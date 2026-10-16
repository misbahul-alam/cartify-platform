"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
import { useProductsStore } from "@/store/useProductsStore";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "@/store/useToastStore";
import type { ProductImage } from "@/types";

type Props = {
  productId: string;
  images: ProductImage[];
  onChanged: () => Promise<void> | void;
};

export const ProductImageManager: React.FC<Props> = ({
  productId,
  images,
  onChanged,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadProductImage = useProductsStore((s) => s.uploadProductImage);
  const deleteProductImage = useProductsStore((s) => s.deleteProductImage);
  const setPrimaryImage = useProductsStore((s) => s.setPrimaryImage);

  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ProductImage | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        await uploadProductImage(productId, file);
      }
      await onChanged();
      toast.success(
        `Uploaded ${files.length} ${files.length === 1 ? "image" : "images"}.`,
      );
    } catch (uploadError: unknown) {
      toast.error(getErrorMessage(uploadError, "Could not upload the image."));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    try {
      await action();
      await onChanged();
      toast.success(success);
    } catch (actionError: unknown) {
      toast.error(getErrorMessage(actionError, "Could not update the gallery."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">Gallery</h2>
          <p className="mt-1 text-sm text-ink-muted">
            The primary image is shown first across the storefront.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => handleFiles(event.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-muted disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          Upload
        </button>
      </div>

      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="mt-6 flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong px-6 py-12 text-center transition-colors hover:border-accent disabled:opacity-50"
        >
          <ImagePlus className="h-6 w-6 text-ink-subtle" />
          <span className="text-sm text-ink-muted">
            Add the first image for this product
          </span>
        </button>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-surface-muted"
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 200px"
                className="object-cover object-center"
              />

              {image.is_primary && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-canvas/90 px-2 py-0.5 text-[10px] font-medium text-ink backdrop-blur">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  Primary
                </span>
              )}

              <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                {!image.is_primary && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      run(
                        () => setPrimaryImage(productId, image.id),
                        "Primary image updated.",
                      )
                    }
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-canvas/90 px-2.5 py-1 text-[11px] font-medium text-ink backdrop-blur transition-colors hover:bg-canvas disabled:opacity-50"
                  >
                    <Star className="h-3 w-3" />
                    Primary
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy}
                  aria-label="Delete image"
                  onClick={() => setPendingDelete(image)}
                  className="ml-auto inline-flex h-7 cursor-pointer items-center gap-1 rounded-full bg-canvas/90 px-2.5 text-danger backdrop-blur transition-colors hover:bg-danger-soft disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        destructive
        title="Delete this image?"
        description="The image will be removed from this product immediately."
        confirmLabel="Delete image"
        onConfirm={async () => {
          if (pendingDelete) {
            await run(
              () => deleteProductImage(productId, pendingDelete.id),
              "Image deleted.",
            );
          }
        }}
      />
    </div>
  );
};

export default ProductImageManager;
