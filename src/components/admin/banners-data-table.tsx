
"use client";

import * as React from "react";
import Image from "next/image";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Banner } from "@/types";
import { ArrowUpDown, Edit, Trash2, MoreHorizontal, ExternalLink, ImageOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface BannersDataTableProps {
  data: Banner[];
  onDeleteBanner: (bannerId: string) => void;
}

export const getBannerColumns = (
  router: ReturnType<typeof useRouter>,
  onDeleteBanner: (bannerId: string) => void
): ColumnDef<Banner>[] => [
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.getValue("imageUrl") as string;
      return imageUrl ? (
        <Image
          src={imageUrl}
          alt={row.original.title || `Banner ${row.original.id}`}
          width={100}
          height={40}
          className="object-cover rounded aspect-video"
          data-ai-hint="banner thumbnail"
        />
      ) : <div className="w-[100px] h-[40px] bg-muted rounded flex items-center justify-center text-muted-foreground"><ImageOff size={20}/></div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Title <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("title") || <span className="italic text-muted-foreground">(No Title)</span>}</div>,
  },
  {
    accessorKey: "linkUrl",
    header: "Link URL",
    cell: ({ row }) => {
      const linkUrl = row.getValue("linkUrl") as string;
      return linkUrl ? (
        <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center">
          {linkUrl.length > 30 ? `${linkUrl.substring(0, 27)}...` : linkUrl}
          <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      ) : <span className="text-muted-foreground">-</span>;
    },
  },
  {
    accessorKey: "order",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Order <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue("order")}</div>,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "outline"} className={cn(isActive ? "bg-green-500 text-white" : "border-destructive text-destructive")}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
        return value === "all" ? true : String(row.original.isActive) === String(value);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const banner = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/admin/banners/${banner.id}/edit`)} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" /> Edit Banner
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (confirm(`Are you sure you want to delete banner: ${banner.title || banner.id}?`)) {
                  onDeleteBanner(banner.id);
                }
              }}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Banner
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function BannersDataTable({ data, onDeleteBanner }: BannersDataTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "order", desc: false }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  
  const columns = React.useMemo(() => getBannerColumns(router, onDeleteBanner), [router, onDeleteBanner]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: { pagination: { pageSize: 5 } },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4 space-x-2">
        <Input
          placeholder="Filter by title..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("title")?.setFilterValue(event.target.value)}
          className="max-w-sm h-9"
        />
        <select
            value={String(table.getColumn("isActive")?.getFilterValue() ?? "all")}
            onChange={(e) => {
                const value = e.target.value;
                table.getColumn("isActive")?.setFilterValue(value === "all" ? undefined : value === "true");
            }}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
            <option value="all">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
        </select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No banners found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  );
}

