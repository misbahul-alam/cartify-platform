"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog } from "./Dialog";
import { SlugAvailability, type SlugState } from "./SlugAvailability";
import { Button, Input, Select, Textarea } from "@/components/ui";
import {
  useCategoriesStore,
  type CategoryPayload,
} from "@/store/useCategoriesStore";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "@/store/useToastStore";
import type { Category } from "@/types";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const CategoryFormDialog: React.FC<{
  category: Category | null;
  onClose: () => void;
}> = ({ category, onClose }) => {
  const createCategory = useCategoriesStore((state) => state.createCategory);
  const updateCategory = useCategoriesStore((state) => state.updateCategory);
  const saving = useCategoriesStore((state) => state.saving);
  const checkSlug = useCategoriesStore((state) => state.checkSlug);
  const editingId = category?.id ?? null;

  const [form, setForm] = useState<CategoryPayload>({
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    image_url: category?.image_url ?? "",
    status: category?.status ?? "public",
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(category));
  const [slugState, setSlugState] = useState<SlugState>("idle");
  const [slugMessage, setSlugMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

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
      if (!existing || existing.id === editingId) {
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

    const payload: CategoryPayload = {
      ...form,
      image_url: form.image_url?.trim() || undefined,
    };

    try {
      if (editingId) {
        await updateCategory(editingId, payload);
        toast.success(`Saved “${payload.name}”.`);
      } else {
        await createCategory(payload);
        toast.success(`Created “${payload.name}”.`);
      }
      onClose();
    } catch (submitError: unknown) {
      setError(getErrorMessage(submitError, "Could not save the category."));
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={editingId ? "Edit category" : "New category"}
      description="Public categories appear across the storefront and in catalog filters."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editingId ? "Save changes" : "Create category"}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-xs text-danger">
            {error}
          </p>
        )}

        <Input
          id="category-name"
          label="Name"
          maxLength={35}
          required
          autoFocus
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
          placeholder="Audio"
        />

        <div className="space-y-2">
          <Input
            id="category-slug"
            label="Slug"
            maxLength={35}
            required
            value={form.slug}
            onChange={(event) => {
              setSlugTouched(true);
              setForm((prev) => ({ ...prev, slug: event.target.value }));
              setSlugState("idle");
            }}
            onBlur={runSlugCheck}
            placeholder="audio"
          />
          <SlugAvailability state={slugState} message={slugMessage} />
        </div>

        <Textarea
          id="category-description"
          label="Description"
          rows={3}
          maxLength={100}
          required
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
          placeholder="Short summary shown in the catalog"
        />

        <Input
          id="category-image"
          label="Image URL"
          type="url"
          value={form.image_url}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, image_url: event.target.value }))
          }
          placeholder="https://…"
        />

        <Select
          id="category-status"
          label="Status"
          value={form.status}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              status: event.target.value as Category["status"],
            }))
          }
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </Select>
      </form>
    </Dialog>
  );
};

export default CategoryFormDialog;
