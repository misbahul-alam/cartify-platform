"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, Pencil, Plus, RefreshCw, Tags, Trash2 } from "lucide-react";
import {
  AdminPageHeader,
  CategoryFormDialog,
  ConfirmDialog,
  DataTable,
  Pill,
  ResultCount,
  SearchInput,
  Toolbar,
  ToolbarGroup,
  type DataColumn,
  type PillTone,
} from "@/components/admin";
import { Button } from "@/components/ui";
import { useCategoriesStore } from "@/store/useCategoriesStore";
import { useProductsStore } from "@/store/useProductsStore";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "@/store/useToastStore";
import type { Category } from "@/types";

export const CategoryManager: React.FC = () => {
  const categories = useCategoriesStore((state) => state.categories);
  const loading = useCategoriesStore((state) => state.loading);
  const fetchCategories = useCategoriesStore((state) => state.fetchCategories);
  const fetchCategoryById = useCategoriesStore(
    (state) => state.fetchCategoryById,
  );
  const deleteCategory = useCategoriesStore((state) => state.deleteCategory);
  const products = useProductsStore((state) => state.products);
  const fetchProducts = useProductsStore((state) => state.fetchProducts);

  const [query, setQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ category: Category | null } | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts(1, 100);
  }, [fetchCategories, fetchProducts]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const product of products) {
      if (!product.category_id) continue;
      map.set(product.category_id, (map.get(product.category_id) ?? 0) + 1);
    }
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return categories;
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(needle) ||
        category.slug.toLowerCase().includes(needle),
    );
  }, [categories, query]);

  const startEdit = async (category: Category) => {
    setLoadingId(category.id);
    try {
      const fresh = await fetchCategoryById(category.id);
      setEditor({ category: fresh });
    } catch (editError: unknown) {
      toast.error(getErrorMessage(editError, "Could not load that category."));
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (category: Category) => {
    try {
      await deleteCategory(category.id);
      toast.success(`Deleted “${category.name}”.`);
    } catch (deleteError: unknown) {
      toast.error(
        getErrorMessage(deleteError, "Could not delete the category."),
      );
    }
  };

  const handleRefresh = async () => {
    await Promise.all([fetchCategories(), fetchProducts(1, 100)]);
    toast.info("Categories refreshed.");
  };

  const statusTone: Record<string, PillTone> = {
    public: "success",
    private: "neutral",
  };

  const columns: DataColumn<Category>[] = [
    {
      id: "category",
      header: "Category",
      sortValue: (category) => category.name.toLowerCase(),
      cell: (category) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
            {category.image_url ? (
              <Image
                src={category.image_url}
                alt=""
                fill
                unoptimized
                sizes="40px"
                className="object-cover object-center"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-ink-subtle">
                <Tags className="h-4 w-4" />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{category.name}</p>
            <p className="truncate text-xs text-ink-subtle">
              /{category.slug}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "description",
      header: "Description",
      cellClassName: "text-ink-muted max-w-[320px]",
      cell: (category) => (
        <span className="line-clamp-1">{category.description}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortValue: (category) => category.status,
      cell: (category) => (
        <Pill tone={statusTone[category.status] || "neutral"}>
          {category.status}
        </Pill>
      ),
    },
    {
      id: "products",
      header: "Products",
      align: "right",
      sortValue: (category) => counts.get(category.id) ?? 0,
      cellClassName: "text-ink-muted tabular-nums",
      cell: (category) => counts.get(category.id) ?? 0,
    },
    {
      id: "actions",
      header: "",
      align: "right",
      cell: (category) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={loadingId === category.id}
            onClick={() => startEdit(category)}
          >
            {loadingId === category.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Pencil className="h-3.5 w-3.5" />
            )}
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Delete ${category.name}`}
            onClick={() => setPendingDelete(category)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Group the catalog into departments. Public categories appear across the storefront."
        actions={
          <>
            <Button variant="secondary" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => setEditor({ category: null })}>
              <Plus className="h-4 w-4" />
              New category
            </Button>
          </>
        }
      />

      <Toolbar className="mb-4">
        <ToolbarGroup className="w-full sm:w-auto">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search name or slug"
            containerClassName="w-full sm:w-72"
          />
        </ToolbarGroup>
        <ToolbarGroup className="w-full justify-end sm:w-auto">
          <ResultCount
            shown={filtered.length}
            total={categories.length}
            noun="categories"
          />
        </ToolbarGroup>
      </Toolbar>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(category) => category.id}
        loading={loading}
        pageSize={10}
        defaultSort={{ id: "category", direction: "asc" }}
        minWidthClassName="min-w-[860px]"
        emptyIcon={Tags}
        emptyTitle="No categories yet"
        emptyDescription="Create your first department to start organising the catalog."
      />

      {editor && (
        <CategoryFormDialog
          key={editor.category?.id ?? "new"}
          category={editor.category}
          onClose={() => setEditor(null)}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        destructive
        title="Delete this category?"
        description={
          (counts.get(pendingDelete?.id ?? "") ?? 0) > 0
            ? `“${pendingDelete?.name}” has ${counts.get(pendingDelete?.id ?? "")} ${
                counts.get(pendingDelete?.id ?? "") === 1
                  ? "product"
                  : "products"
              } that will stay in the catalog uncategorised.`
            : `“${pendingDelete?.name}” will be permanently removed.`
        }
        confirmLabel="Delete category"
        onConfirm={async () => {
          if (pendingDelete) await handleDelete(pendingDelete);
        }}
      />
    </div>
  );
};

export default CategoryManager;
