"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpDown,
  CheckCircle2,
  Download,
  Loader2,
  Package,
  Pencil,
  Plus,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  AdminPageHeader,
  ConfirmDialog,
  DataTable,
  Pill,
  ResultCount,
  SearchInput,
  Toolbar,
  ToolbarGroup,
  type DataColumn,
} from "@/components/admin";
import { Button, Select } from "@/components/ui";
import { useProductsStore, type ProductPayload } from "@/store/useProductsStore";
import { useCategoriesStore } from "@/store/useCategoriesStore";
import { getErrorMessage } from "@/lib/errors";
import { downloadCsv } from "@/lib/csv";
import { formatPrice } from "@/lib/format";
import { toast } from "@/store/useToastStore";
import { cn } from "@/lib/cn";
import type { Product } from "@/types";

type SortKey = "newest" | "name" | "price-desc" | "price-asc" | "stock";

const sortLabels: Record<SortKey, string> = {
  newest: "Newest first",
  name: "Name A–Z",
  "price-desc": "Price high to low",
  "price-asc": "Price low to high",
  stock: "Out of stock first",
};

const bulkButton =
  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink disabled:pointer-events-none disabled:opacity-50";

const toPayload = (product: Product): ProductPayload => ({
  sku: product.sku,
  name: product.name,
  slug: product.slug,
  description: product.description,
  price: product.price,
  category_id: product.category_id ?? null,
  is_stock: product.is_stock,
  is_featured: product.is_featured,
  status: product.status,
});

export const ProductsManager: React.FC = () => {
  const products = useProductsStore((state) => state.products);
  const loading = useProductsStore((state) => state.loading);
  const fetchProducts = useProductsStore((state) => state.fetchProducts);
  const updateProduct = useProductsStore((state) => state.updateProduct);
  const deleteProduct = useProductsStore((state) => state.deleteProduct);
  const categories = useCategoriesStore((state) => state.categories);
  const fetchCategories = useCategoriesStore((state) => state.fetchCategories);

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [bulkDelete, setBulkDelete] = useState<Product[] | null>(null);

  useEffect(() => {
    fetchProducts(1, 100);
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = products.filter((product) => {
      if (categoryId !== "all" && product.category_id !== categoryId) {
        return false;
      }
      if (!needle) return true;
      return (
        product.name.toLowerCase().includes(needle) ||
        product.sku.toLowerCase().includes(needle)
      );
    });

    const sorted = [...list];
    switch (sort) {
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "stock":
        sorted.sort((a, b) => Number(a.is_stock) - Number(b.is_stock));
        break;
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
    }
    return sorted;
  }, [products, query, categoryId, sort]);

  const apply = async (
    product: Product,
    changes: Partial<ProductPayload>,
    message: string,
  ) => {
    setBusyId(product.id);
    try {
      await updateProduct(product.id, { ...toPayload(product), ...changes });
      toast.success(message);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Could not update the product."));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (product: Product) => {
    try {
      await deleteProduct(product.id);
      toast.success(`Deleted ${product.name}.`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Could not delete the product."));
    }
  };

  const bulkSetStock = async (rows: Product[], inStock: boolean) => {
    setBulkBusy(true);
    try {
      await Promise.all(
        rows.map((product) =>
          updateProduct(
            product.id,
            { ...toPayload(product), is_stock: inStock },
            { refresh: false },
          ),
        ),
      );
      await fetchProducts(1, 100);
      toast.success(
        `${rows.length} ${rows.length === 1 ? "product" : "products"} marked ${
          inStock ? "in stock" : "sold out"
        }.`,
      );
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Could not update the products."));
    } finally {
      setBulkBusy(false);
    }
  };

  const bulkRemove = async (rows: Product[]) => {
    setBulkBusy(true);
    try {
      await Promise.all(rows.map((product) => deleteProduct(product.id)));
      toast.success(
        `Deleted ${rows.length} ${rows.length === 1 ? "product" : "products"}.`,
      );
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Could not delete the products."));
    } finally {
      setBulkBusy(false);
    }
  };

  const handleExport = () => {
    downloadCsv(`products-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["SKU", "Name", "Slug", "Category", "Price", "Status", "Stock", "Featured"],
      ...filtered.map((product) => [
        product.sku,
        product.name,
        product.slug,
        product.category?.name ?? "",
        product.price,
        product.status,
        product.is_stock ? "in stock" : "sold out",
        product.is_featured ? "yes" : "no",
      ]),
    ]);
    toast.info(`Exported ${filtered.length} products.`);
  };

  const columns: DataColumn<Product>[] = [
    {
      id: "product",
      header: "Product",
      sortValue: (product) => product.name.toLowerCase(),
      cell: (product) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
            {product.images?.[0]?.url ? (
              <Image
                src={product.images[0].url}
                alt=""
                fill
                sizes="40px"
                className="object-cover object-center"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-ink-subtle">
                <Package className="h-4 w-4" />
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate font-medium text-ink">
              {product.name}
              {product.is_featured && (
                <Star className="h-3 w-3 shrink-0 fill-warning text-warning" />
              )}
            </p>
            <p className="truncate text-xs text-ink-subtle tabular-nums">
              {product.sku}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      sortValue: (product) => product.category?.name ?? "",
      cellClassName: "text-ink-muted",
      cell: (product) => (
        <span className="whitespace-nowrap">
          {product.category?.name || "—"}
        </span>
      ),
    },
    {
      id: "price",
      header: "Price",
      align: "right",
      sortValue: (product) => product.price,
      cellClassName: "font-medium text-ink tabular-nums",
      cell: (product) => formatPrice(product.price),
    },
    {
      id: "status",
      header: "Status",
      cell: (product) => {
        const busy = busyId === product.id;
        return (
          <div className="flex items-center gap-2">
            <Select
              aria-label={`Status for ${product.name}`}
              containerClassName="w-32"
              className="h-9 py-0 text-xs"
              value={product.status}
              disabled={busy}
              onChange={(event) =>
                apply(
                  product,
                  { status: event.target.value as Product["status"] },
                  `${product.name} set to ${event.target.value}.`,
                )
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </Select>
            {busy && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-subtle" />
            )}
          </div>
        );
      },
    },
    {
      id: "stock",
      header: "Stock",
      cell: (product) => (
        <button
          type="button"
          disabled={busyId === product.id}
          onClick={() =>
            apply(
              product,
              { is_stock: !product.is_stock },
              product.is_stock
                ? `${product.name} marked sold out.`
                : `${product.name} marked in stock.`,
            )
          }
          title="Toggle stock"
          className="cursor-pointer disabled:opacity-50"
        >
          <Pill
            tone={product.is_stock ? "success" : "danger"}
            className="transition-opacity hover:opacity-80"
          >
            {product.is_stock ? "in stock" : "sold out"}
          </Pill>
        </button>
      ),
    },
    {
      id: "actions",
      header: "",
      align: "right",
      cell: (product) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/admin/products/${product.id}`}>
            <Button variant="ghost" size="sm">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Delete ${product.name}`}
            onClick={() => setPendingDelete(product)}
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
        title="Products"
        description="Create and maintain everything in the catalog."
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
          >
            <Plus className="h-4 w-4" />
            New product
          </Link>
        }
      />

      <Toolbar className="mb-4">
        <ToolbarGroup className="w-full sm:w-auto">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search name or SKU"
            containerClassName="w-full sm:w-64"
          />
          <Select
            aria-label="Filter by category"
            containerClassName="w-full sm:w-44"
            className="h-10 py-0"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Sort products"
            containerClassName="w-full sm:w-48"
            className="h-10 py-0"
            icon={<ArrowUpDown className="h-4 w-4" />}
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
          >
            {(Object.keys(sortLabels) as SortKey[]).map((key) => (
              <option key={key} value={key}>
                {sortLabels[key]}
              </option>
            ))}
          </Select>
        </ToolbarGroup>

        <ToolbarGroup className="w-full justify-between sm:w-auto sm:justify-end">
          <ResultCount
            shown={filtered.length}
            total={products.length}
            noun="products"
          />
          <Button variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </ToolbarGroup>
      </Toolbar>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(product) => product.id}
        loading={loading}
        pageSize={10}
        selectable
        minWidthClassName="min-w-[1040px]"
        emptyIcon={Package}
        emptyTitle="No products found"
        emptyDescription="Adjust the search or filters, or add a new product to the catalog."
        bulkActions={(rows) => (
          <>
            <button
              type="button"
              className={bulkButton}
              disabled={bulkBusy}
              onClick={() => bulkSetStock(rows, true)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              In stock
            </button>
            <button
              type="button"
              className={bulkButton}
              disabled={bulkBusy}
              onClick={() => bulkSetStock(rows, false)}
            >
              <XCircle className="h-3.5 w-3.5" />
              Sold out
            </button>
            <button
              type="button"
              className={cn(bulkButton, "text-danger hover:bg-danger-soft")}
              disabled={bulkBusy}
              onClick={() => setBulkDelete(rows)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </>
        )}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        destructive
        title="Delete this product?"
        description={`${pendingDelete?.name ?? "This product"} and its images will be permanently removed.`}
        confirmLabel="Delete product"
        onConfirm={async () => {
          if (pendingDelete) await handleDelete(pendingDelete);
        }}
      />

      <ConfirmDialog
        open={bulkDelete !== null}
        onClose={() => setBulkDelete(null)}
        destructive
        title={`Delete ${bulkDelete?.length ?? 0} products?`}
        description="The selected products and their images will be permanently removed."
        confirmLabel="Delete products"
        onConfirm={async () => {
          if (bulkDelete) await bulkRemove(bulkDelete);
        }}
      />
    </div>
  );
};

export default ProductsManager;
