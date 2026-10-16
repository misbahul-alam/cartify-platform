"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  X,
  type LucideIcon,
} from "lucide-react";
import { EmptyState } from "@/components/ui";
import { cn } from "@/lib/cn";

export type SortDirection = "asc" | "desc";

export type DataColumn<T> = {
  id: string;
  header: string;
  align?: "left" | "right";
  headerClassName?: string;
  cellClassName?: string;
  sortValue?: (row: T) => string | number | null | undefined;
  cell: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: DataColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  skeletonRows?: number;
  pageSize?: number;
  paginated?: boolean;
  defaultSort?: { id: string; direction: SortDirection };
  selectable?: boolean;
  bulkActions?: (rows: T[], clear: () => void) => React.ReactNode;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  minWidthClassName?: string;
};

const navButton =
  "inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border border-line px-2.5 text-xs font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink disabled:pointer-events-none disabled:opacity-40";

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  skeletonRows,
  pageSize = 10,
  paginated = true,
  defaultSort,
  selectable = false,
  bulkActions,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  minWidthClassName = "min-w-[900px]",
}: Props<T>) {
  const [sort, setSort] = useState<{ id: string; direction: SortDirection } | null>(
    defaultSort ?? null,
  );
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);
  const [selected, setSelected] = useState<string[]>([]);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((item) => item.id === sort.id);
    if (!column?.sortValue) return rows;
    const direction = sort.direction === "asc" ? 1 : -1;
    const read = column.sortValue;
    return [...rows].sort((a, b) => {
      const left = read(a);
      const right = read(b);
      if (left === right) return 0;
      if (left === null || left === undefined) return 1;
      if (right === null || right === undefined) return -1;
      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * direction;
      }
      return String(left).localeCompare(String(right)) * direction;
    });
  }, [rows, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / size));
  const currentPage = Math.min(page, totalPages);
  const start = paginated ? (currentPage - 1) * size : 0;
  const visible = paginated ? sorted.slice(start, start + size) : sorted;

  const selectedRows = useMemo(
    () => rows.filter((row) => selected.includes(rowKey(row))),
    [rows, selected, rowKey],
  );
  const allVisibleSelected =
    visible.length > 0 &&
    visible.every((row) => selected.includes(rowKey(row)));

  const clearSelection = () => setSelected([]);

  const toggleRow = (key: string) =>
    setSelected((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );

  const toggleSort = (column: DataColumn<T>) => {
    if (!column.sortValue) return;
    setSort((current) => {
      if (!current || current.id !== column.id) {
        return { id: column.id, direction: "asc" };
      }
      return {
        id: column.id,
        direction: current.direction === "asc" ? "desc" : "asc",
      };
    });
    setPage(1);
  };

  const columnCount = columns.length + (selectable ? 1 : 0);
  const emptyRows = skeletonRows ?? Math.min(size, 6);

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="overflow-x-auto">
          <table
            className={cn("w-full border-collapse text-left text-sm", minWidthClassName)}
          >
            <thead>
              <tr className="border-b border-line bg-surface-muted/50">
                {selectable && (
                  <th className="w-12 px-4 py-2.5">
                    <input
                      type="checkbox"
                      aria-label="Select all rows"
                      checked={allVisibleSelected}
                      onChange={() =>
                        setSelected(
                          allVisibleSelected
                            ? selected.filter(
                                (key) =>
                                  !visible.some((row) => rowKey(row) === key),
                              )
                            : [
                                ...selected,
                                ...visible
                                  .map(rowKey)
                                  .filter((key) => !selected.includes(key)),
                              ],
                        )
                      }
                      className="h-4 w-4 cursor-pointer accent-[var(--accent)]"
                    />
                  </th>
                )}
                {columns.map((column) => {
                  const active = sort?.id === column.id;
                  return (
                    <th
                      key={column.id}
                      className={cn(
                        "whitespace-nowrap px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle",
                        column.align === "right" && "text-right",
                        column.headerClassName,
                      )}
                    >
                      {column.sortValue ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(column)}
                          className={cn(
                            "inline-flex cursor-pointer items-center gap-1.5 transition-colors hover:text-ink",
                            active && "text-ink",
                          )}
                        >
                          {column.header}
                          {active ? (
                            sort.direction === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        column.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {loading && rows.length === 0
                ? Array.from({ length: emptyRows }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-line/70">
                      {selectable && (
                        <td className="px-4 py-3.5">
                          <div className="h-4 w-4 animate-pulse rounded bg-surface-muted" />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={column.id} className="px-4 py-3.5">
                          <div
                            className={cn(
                              "h-4 animate-pulse rounded bg-surface-muted",
                              rowIndex % 2 === 0 ? "w-3/4" : "w-1/2",
                            )}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                : visible.map((row) => {
                    const key = rowKey(row);
                    const isSelected = selected.includes(key);
                    return (
                      <tr
                        key={key}
                        className={cn(
                          "border-b border-line/70 transition-colors last:border-b-0",
                          isSelected
                            ? "bg-accent-soft/50"
                            : "hover:bg-surface-muted/50",
                        )}
                      >
                        {selectable && (
                          <td className="px-4 py-3.5">
                            <input
                              type="checkbox"
                              aria-label="Select row"
                              checked={isSelected}
                              onChange={() => toggleRow(key)}
                              className="h-4 w-4 cursor-pointer accent-[var(--accent)]"
                            />
                          </td>
                        )}
                        {columns.map((column) => (
                          <td
                            key={column.id}
                            className={cn(
                              "px-4 py-3.5 align-middle",
                              column.align === "right" && "text-right",
                              column.cellClassName,
                            )}
                          >
                            {column.cell(row)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
            </tbody>

            {!loading && visible.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan={columnCount}>
                    <EmptyState
                      icon={emptyIcon}
                      title={emptyTitle}
                      description={emptyDescription}
                    />
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {paginated && !loading && sorted.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-ink-subtle">
              Showing{" "}
              <span className="font-medium text-ink-muted">
                {start + 1}–{Math.min(start + size, sorted.length)}
              </span>{" "}
              of <span className="font-medium text-ink-muted">{sorted.length}</span>
            </p>

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <select
                aria-label="Rows per page"
                value={size}
                onChange={(event) => {
                  setSize(Number(event.target.value));
                  setPage(1);
                }}
                className="h-8 cursor-pointer rounded-lg border border-line bg-surface px-2 text-xs text-ink-muted outline-none focus:border-accent"
              >
                {[10, 25, 50].map((option) => (
                  <option key={option} value={option}>
                    {option} / page
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className={navButton}
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </button>
                <span className="px-1 text-xs tabular-nums text-ink-subtle">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  className={navButton}
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectable && bulkActions && selectedRows.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4">
          <div className="animate-rise pointer-events-auto flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-2.5 shadow-xl shadow-black/10">
            <span className="text-sm font-medium text-ink">
              {selectedRows.length} selected
            </span>
            <span className="h-5 w-px bg-line" />
            {bulkActions(selectedRows, clearSelection)}
            <button
              type="button"
              aria-label="Clear selection"
              onClick={clearSelection}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
