"use client"

import { format } from "date-fns";
import { InferResponseType } from "hono";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

import { client } from "@/lib/hono";
import { formatCurrency } from "@/lib/utils";
import { CREDIT_CARDS, SPEND_CATEGORIES, formatCashback, type CreditCard, type SpendCategory } from "@/lib/cashback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { Actions } from "./actions";
import { AccountColumn } from "./account-column";
import { CategoryColumn } from "./category-column";

export type ResponseType = InferResponseType<typeof client.api.transactions.$get, 200>["data"][0];

export const columns: ColumnDef<ResponseType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue("date") as Date;
      return <span>{format(date, "dd MMMM, yyyy")}</span>;
    }
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Category
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <CategoryColumn
        id={row.original.id}
        category={row.original.category}
        categoryId={row.original.categoryId}
      />
    )
  },
  {
    accessorKey: "payee",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Payee
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const card = row.original.creditCard as CreditCard | null;
      const spendCat = row.original.spendCategory as SpendCategory | null;
      return (
        <div className="flex flex-col gap-0.5">
          <span>{row.getValue("payee")}</span>
          {card && (
            <span className="text-[10px] text-muted-foreground">
              {CREDIT_CARDS[card]}
              {spendCat ? ` · ${SPEND_CATEGORIES[spendCat]}` : ""}
            </span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Amount
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      return (
        <Badge
          variant={amount < 0 ? "destructive" : "primary"}
          className="text-xs font-medium px-3.5 py-2.5"
        >
          {formatCurrency(amount)}
        </Badge>
      );
    }
  },
  {
    accessorKey: "cashbackEarned",
    header: () => (
      <span className="text-emerald-700 font-medium text-sm px-2">💰 Cashback</span>
    ),
    cell: ({ row }) => {
      const cashback = row.original.cashbackEarned;
      if (!cashback || cashback === 0) {
        return <span className="text-xs text-muted-foreground px-2">—</span>;
      }
      return (
        <Badge
          className="text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-200 px-2.5 py-1"
          variant="outline"
        >
          {formatCashback(cashback)}
        </Badge>
      );
    }
  },
  {
    accessorKey: "account",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Account
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <AccountColumn
        account={row.original.account}
        accountId={row.original.accountId}
      />
    )
  },
  {
    id: "actions",
    cell: ({ row }) => <Actions id={row.original.id} />
  }
];
