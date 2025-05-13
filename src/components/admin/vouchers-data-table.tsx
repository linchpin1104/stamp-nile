"use client";

import * as React from "react";
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
import type { Voucher, Program } from "@/types";
import { ArrowUpDown, Ban, CheckCircle, Clock, MoreHorizontal, Info, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, parseISO, isBefore, isAfter } from 'date-fns';
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface VouchersDataTableProps {
  data: Voucher[];
  programs: Program[]; // To display program titles
  onDeactivateVoucher: (voucherId: string) => void;
}

const getVoucherStatus = (voucher: Voucher): { text: string; icon: React.ElementType; className: string } => {
  const now = new Date();
  if (voucher.status === 'void') return { text: "Void", icon: Ban, className: "bg-gray-500 text-white" };
  // if (voucher.status === 'expired') return { text: "Expired", icon: Clock, className: "bg-red-200 text-red-700" }; // This specific status might be set manually or by a cron job

  const regStartDate = parseISO(voucher.registrationStartDate);
  const regEndDate = parseISO(voucher.registrationEndDate);

  if (voucher.registeredByUserId && voucher.accessExpiresDate) {
    const accessExpDate = parseISO(voucher.accessExpiresDate);
    if (isAfter(now, accessExpDate)) return { text: "Expired (Access)", icon: Clock, className: "bg-red-200 text-red-700" };
    return { text: "Active", icon: CheckCircle, className: "bg-green-200 text-green-700" };
  }
  
  if (isAfter(now, regEndDate)) return { text: "Expired (Registration)", icon: Clock, className: "bg-orange-200 text-orange-700" };
  if (isBefore(now, regStartDate)) return { text: "Upcoming", icon: Info, className: "bg-blue-200 text-blue-700" };
  
  return { text: "Available", icon: CheckCircle, className: "bg-green-200 text-green-700" };
};


export const getVoucherColumns = (
  onDeactivateVoucher: (voucherId: string) => void,
  programs: Program[]
): ColumnDef<Voucher>[] => [
  {
    accessorKey: "code",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Code <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-mono font-medium">{row.getValue("code")}</div>,
  },
  {
    accessorKey: "programId",
    header: "Program",
    cell: ({ row }) => {
      const programId = row.getValue("programId") as string;
      const program = programs.find(p => p.id === programId);
      return program ? program.title : <span className="text-muted-foreground">Unknown Program</span>;
    },
    filterFn: (row, id, value) => {
      return row.original.programId === value;
    },
  },
  {
    id: "status", // Custom ID for sorting/filtering
    accessorFn: (row) => getVoucherStatus(row).text, // Accessor for sorting
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Status <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const statusInfo = getVoucherStatus(row.original);
      const Icon = statusInfo.icon;
      return (
        <Badge variant="outline" className={cn("capitalize", statusInfo.className)}>
           <Icon className="mr-1.5 h-3.5 w-3.5" /> {statusInfo.text}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(getVoucherStatus(row.original).text);
    },
  },
  {
    accessorKey: "registrationStartDate",
    header: "Reg. Start",
    cell: ({ row }) => format(parseISO(row.getValue("registrationStartDate")), "yyyy-MM-dd"),
  },
  {
    accessorKey: "registrationEndDate",
    header: "Reg. End",
    cell: ({ row }) => format(parseISO(row.getValue("registrationEndDate")), "yyyy-MM-dd"),
  },
  {
    accessorKey: "accessDurationDays",
    header: "Access (Days)",
    cell: ({ row }) => <div className="text-center">{row.getValue("accessDurationDays")}</div>,
  },
  {
    accessorKey: "registeredByUserName",
    header: "Registered By",
    cell: ({ row }) => row.getValue("registeredByUserName") || <span className="text-muted-foreground">-</span>,
  },
  {
    accessorKey: "accessExpiresDate",
    header: "Access Expires",
    cell: ({ row }) => {
      const date = row.getValue("accessExpiresDate") as string | undefined;
      return date ? format(parseISO(date), "yyyy-MM-dd") : <span className="text-muted-foreground">-</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const voucher = row.original;
      const statusInfo = getVoucherStatus(voucher);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Voucher Actions</DropdownMenuLabel>
            <DropdownMenuItem disabled>
              <Info className="mr-2 h-4 w-4" /> View Details (Soon)
            </DropdownMenuItem>
            {statusInfo.text !== "Void" && statusInfo.text !== "Expired (Access)" && statusInfo.text !== "Expired (Registration)" && (
              <DropdownMenuItem
                onClick={() => {
                  if (confirm(`Are you sure you want to deactivate voucher: ${voucher.code}?`)) {
                    onDeactivateVoucher(voucher.id);
                  }
                }}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              >
                <Ban className="mr-2 h-4 w-4" /> Deactivate Voucher
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function VouchersDataTable({ data, programs, onDeactivateVoucher }: VouchersDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'code', desc: false }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const columns = React.useMemo(() => getVoucherColumns(onDeactivateVoucher, programs), [onDeactivateVoucher, programs]);

  const uniqueStatuses = React.useMemo(() => {
    const statuses = new Set<string>();
    data.forEach(voucher => statuses.add(getVoucherStatus(voucher).text));
    return Array.from(statuses).sort();
  }, [data]);

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
  });

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center py-4 gap-2">
        <Input
          placeholder="Filter by code..."
          value={(table.getColumn("code")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("code")?.setFilterValue(event.target.value)
          }
          className="max-w-xs h-10"
        />
        <Select
          value={(table.getColumn("programId")?.getFilterValue() as string) ?? ""}
          onValueChange={(value) => {
            table.getColumn("programId")?.setFilterValue(value === "all" ? "" : value);
          }}
        >
          <SelectTrigger className="max-w-xs h-10 md:w-[280px]">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Filter by program..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programs</SelectItem>
            {programs.map((program) => (
              <SelectItem key={program.id} value={program.id}>
                {program.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
         <Select
          value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
          onValueChange={(value) => {
            table.getColumn("status")?.setFilterValue(value === "all" ? "" : value);
          }}
        >
          <SelectTrigger className="max-w-xs h-10">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Filter by status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {uniqueStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
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
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No vouchers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

