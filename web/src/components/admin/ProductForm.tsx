"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  AdminPageHeader,
  ProductImageManager,
  SlugAvailability,
  type SlugState,
} from "@/components/admin";
import { Button, Input, Select, SkeletonBlock, Textarea } from "@/components/ui";
import { useProductsStore, type ProductPayload } from "@/store/useProductsStore";
import { useCategoriesStore } from "@/store/useCategoriesStore";
import { getErrorMessage } from "@/lib/errors";
import type { Product } from "@/types";

type FormState = {
  sku: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  category_id: string;
  is_stock: boolean;
  is_featured: boolean;
  status: Product["status"];
};

const emptyForm: FormState = {
  sku: "",
  name: "",
  slug: "",
  description: "",
  price: "",
  category_id: "",
  is_stock: true,
  is_featured: false,
  status: "active",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toFormState = (data: Product): FormState => ({
  sku: data.sku,
  name: data.name,
  slug: data.slug,
  description: data.description,
  price: String(data.price),
  category_id: data.category_id || "",
  is_stock: data.is_stock,
  is_featured: data.is_featured,
  status: data.status,
});

function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3.5 transition-colors hover:border-line-strong"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 cursor-pointer accent-[var(--accent)]"
      />
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="mt-0.5 block text-xs text-ink-subtle">
          {description}
        </span>
      </span>
    </label>
  );
}

export const ProductForm: React.FC<{ productId?: string }> = ({
  productId,
}) => {
  const router = useRouter();
  const categories = useCategoriesStore((state) => state.categories);
  const fetchCategories = useCategoriesStore((state) => state.fetchCategories);
  const createProduct = useProductsStore((state) => state.createProduct);
  const updateProduct = useProductsStore((state) => state.updateProduct);
  const fetchProductById = useProductsStore((state) => state.fetchProductById);
  const checkSlug = useProductsStore((state) => state.checkSlug);
  const saving = useProductsStore((state) => state.saving);

  const isEdit = Boolean(productId);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugState, setSlugState] = useState<SlugState>("idle");
  const [slugMessage, setSlugMessage] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const load = useCallback(async () => {
    if (!productId) return;
    const data = await fetchProductById(productId);
    if (!data) throw new Error("This product could not be found.");
    setProduct(data);
    setSlugTouched(true);
    setForm(toFormState(data));
  }, [productId, fetchProductById]);

  useEffect(() => {
    if (!productId) return;
    let active = true;
    fetchProductById(productId)
      .then((data) => {
        if (!active) return;
        setLoading(false);
        if (!data) {
          setLoadError("This product could not be found.");
          return;
        }
        setProduct(data);
        setSlugTouched(true);
        setForm(toFormState(data));
      })
      .catch((fetchError: unknown) => {
        if (!active) return;
        setLoadError(
          getErrorMessage(fetchError, "Could not load this product."),
        );
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId, fetchProductById]);

  const runSlugCheck = async () => {
    const slug = form.slug.trim();
    setSlugMessage("");
    if (slug.length < 3) {
      setSlugState("idle");
      return;
    }
    setSlugState("checking");
    try {
      const existing = await checkSlug(slug);
      if (!existing || existing.id === productId) {
        setSlugState("available");
        return;
      }
      setSlugState("taken");
      setSlugMessage(`Already used by “${existing.name}”`);
    } catch (checkError: unknown) {
      setSlugState("error");
      setSlugMessage(getErrorMessage(checkError, "Could not check this slug"));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.category_id) {
      setError("Choose a category for this product.");
      return;
    }

    const price = Number(form.price);
    if (form.price.trim() === "" || Number.isNaN(price) || price < 0) {
      setError("Enter a valid price.");
      return;
    }

    const payload: ProductPayload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      price,
      category_id: form.category_id,
      is_stock: form.is_stock,
      is_featured: form.is_featured,
      status: form.status,
    };

    try {
      if (productId) {
        await updateProduct(productId, payload);
        router.push("/admin/products");
        return;
      }

      await createProduct(payload);
      const created =
        useProductsStore
          .getState()
          .products.find((item) => item.slug === payload.slug) ??
        useProductsStore
          .getState()
          .products.find((item) => item.sku === payload.sku);
      router.push(created ? `/admin/products/${created.id}` : "/admin/products");
    } catch (submitError: unknown) {
      setError(getErrorMessage(submitError, "Could not save the product."));
    }
  };

  return (
    <div>
      <AdminPageHeader
        title={isEdit ? "Edit product" : "New product"}
        description={
          isEdit
            ? "Update the details buyers see, then manage the gallery below."
            : "Add a product to the catalog. You can upload images after saving."
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: isEdit ? "Edit" : "New" },
        ]}
        actions={
          isEdit && product ? (
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong bg-surface px-5 text-sm font-medium text-ink transition-colors hover:bg-surface-muted"
            >
              View on store
              <ExternalLink className="h-4 w-4" />
            </Link>
          ) : undefined
        }
      />

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <SkeletonBlock className="h-96 rounded-2xl lg:col-span-2" />
          <SkeletonBlock className="h-80 rounded-2xl" />
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center text-sm text-ink-muted">
          {loadError}
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-5 rounded-2xl border border-line bg-surface p-6 lg:col-span-2">
              <Input
                id="name"
                label="Name"
                required
                maxLength={255}
                value={form.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setForm((prev) => ({
                    ...prev,
                    name,
                    slug: slugTouched ? prev.slug : slugify(name),
                  }));
                  setSlugState("idle");
                }}
                placeholder="Studio headphones"
              />
              <div className="space-y-2">
                <Input
                  id="slug"
                  label="Slug"
                  required
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setForm((prev) => ({ ...prev, slug: event.target.value }));
                    setSlugState("idle");
                  }}
                  onBlur={runSlugCheck}
                  placeholder="studio-headphones"
                />
                <SlugAvailability state={slugState} message={slugMessage} />
              </div>
              <Input
                id="sku"
                label="SKU"
                required
                value={form.sku}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, sku: event.target.value }))
                }
                placeholder="AUD-001"
              />
              <Textarea
                id="description"
                label="Description"
                rows={6}
                required
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="What makes this piece worth it"
              />
            </div>

            <div className="space-y-5 rounded-2xl border border-line bg-surface p-6">
              <Input
                id="price"
                label="Price (USD)"
                type="number"
                min="0"
                step="0.01"
                required
                value={form.price}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, price: event.target.value }))
                }
                placeholder="0.00"
              />
              <Select
                id="category_id"
                label="Category"
                required
                value={form.category_id}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    category_id: event.target.value,
                  }))
                }
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>

              {isEdit && (
                <Select
                  id="status"
                  label="Status"
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      status: event.target.value as Product["status"],
                    }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </Select>
              )}

              <div className="space-y-3 pt-1">
                <Toggle
                  id="is_stock"
                  label="In stock"
                  description="Show as available for purchase."
                  checked={form.is_stock}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, is_stock: value }))
                  }
                />
                <Toggle
                  id="is_featured"
                  label="Featured"
                  description="Surface in the featured sections."
                  checked={form.is_featured}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, is_featured: value }))
                  }
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger lg:col-span-3">
                {error}
              </p>
            )}

            <div className="sticky bottom-4 z-20 flex items-center gap-3 rounded-2xl border border-line bg-surface/90 px-4 py-3 shadow-lg shadow-black/5 backdrop-blur lg:col-span-3">
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Saving…"
                  : isEdit
                    ? "Save changes"
                    : "Create product"}
              </Button>
              <Link
                href="/admin/products"
                className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                Cancel
              </Link>
              {isEdit && (
                <span className="ml-auto hidden text-xs text-ink-subtle sm:block">
                  Changes apply to the storefront immediately
                </span>
              )}
            </div>
          </form>

          {isEdit && product && (
            <div className="mt-8">
              <ProductImageManager
                productId={product.id}
                images={product.images || []}
                onChanged={load}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductForm;
