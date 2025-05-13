
"use client";

import * as React from "react";
import Link from "next/link";
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
import type { User } from "@/types";
import { ArrowUpDown, Eye, Edit, UserX, MoreHorizontal, Trash2, CalendarDays, Mail } from "lucide-react"; // Added Mail
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation"; 
import { format } from 'date-fns';

interface UsersDataTableProps {
  data: User[];
  onBanUser: (userId: string, userName: string) => void;
  onDeleteUser: (userId: string, userName: string) => void;
}

export const getUserColumns = (
  onBanUser: (userId: string, userName: string) => void,
  onDeleteUser: (userId: string, userName: string) => void
): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Email <Mail className="ml-2 h-4 w-4" /> <ArrowUpDown className="ml-1 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => row.getValue("email") || <span className="text-muted-foreground">-</span>,
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone (Optional)",
    cell: ({ row }) => row.getValue("phoneNumber") || <span className="text-muted-foreground">-</span>,
  },
  {
    accessorKey: "parentalRole",
    header: "Role",
    cell: ({ row }) => <Badge variant="secondary" className="capitalize">{row.getValue("parentalRole")}</Badge>,
  },
  {
    accessorKey: "children",
    header: "Children",
    cell: ({ row }) => {
      const children = row.getValue("children") as User["children"];
      return <Badge variant="outline">{children?.length || 0}</Badge>;
    },
  },
   {
    accessorKey: "residentialArea",
    header: "Area",
    cell: ({ row }) => <div className="text-sm text-muted-foreground truncate max-w-[150px]">{row.getValue("residentialArea")}</div>,
  },
  {
    accessorKey: "registrationDate",
    header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Registered <CalendarDays className="ml-2 h-4 w-4" /> <ArrowUpDown className="ml-1 h-4 w-4" />
        </Button>
    ),
    cell: ({ row }) => {
        const date = row.getValue("registrationDate") as string | undefined;
        return date ? format(new Date(date), "yyyy-MM-dd") : <span className="text-muted-foreground">-</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      const router = useRouter();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>User Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}/view`)} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}/edit`)} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" /> Edit User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onBanUser(user.id, user.name)}
              className="text-orange-600 focus:text-orange-600 focus:bg-orange-500/10 cursor-pointer"
            >
              <UserX className="mr-2 h-4 w-4" /> Ban User
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteUser(user.id, user.name)}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function UsersDataTable({ data, onBanUser, onDeleteUser }: UsersDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'registrationDate', desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  
  const columns = React.useMemo(() => getUserColumns(onBanUser, onDeleteUser), [onBanUser, onDeleteUser]);

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
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter users by name or email..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? (table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) => {
            table.getColumn("name")?.setFilterValue(event.target.value);
            table.getColumn("email")?.setFilterValue(event.target.value);
           }
          }
          className="max-w-sm"
        />
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
                  No users found.
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

