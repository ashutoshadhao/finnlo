import { useState } from "react";
import { format, parse } from "date-fns";
import { CreditCard } from "lucide-react";

import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { convertAmountToMiliunits } from "@/lib/utils";
import {
  CREDIT_CARD_OPTIONS,
  CARD_SPEND_CATEGORIES,
  SPEND_CATEGORIES,
  autoDetectSpendCategory,
  calculateCashback,
  type CreditCard as CreditCardType,
  type SpendCategory,
} from "@/lib/cashback";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ImportTable } from "./import-table";

const dateFormat = "yyyy-MM-dd HH:mm:ss";
const outputFormat = "yyyy-MM-dd";

const requiredOptions = [
  "amount",
  "date",
  "payee",
];

interface SelectedColumnsState {
  [key: string]: string | null;
};

type Props = {
  data: string[][];
  onCancel: () => void;
  onSubmit: (data: any) => void;
  defaultCard?: CreditCardType | null;
};

export const ImportCard = ({
  data,
  onCancel,
  onSubmit,
  defaultCard = null,
}: Props) => {
  const [selectedColumns, setSelectedColumns] = useState<SelectedColumnsState>({});
  const [selectedCard, setSelectedCard] = useState<CreditCardType | null>(defaultCard);

  const headers = data[0];
  const body = data.slice(1);

  const onTableHeadSelectChange = (
    columnIndex: number,
    value: string | null
  ) => {
    setSelectedColumns((prev) => {
      const newSelectedColumns = {...prev};

      for (const key in newSelectedColumns) {
        if (newSelectedColumns[key] === value) {
          newSelectedColumns[key] = null;
        }
      }

      if (value === "skip") {
        value = null;
      }

      newSelectedColumns[`column_${columnIndex}`] = value;
      return newSelectedColumns;
    });
  };

  const progress = Object.values(selectedColumns).filter(Boolean).length;

  const handleContinue = () => {
    const getColumnIndex = (column: string) => {
      return column.split("_")[1];
    };

    const mappedData = {
      headers: headers.map((_header, index) => {
        const columnIndex = getColumnIndex(`column_${index}`);
        return selectedColumns[`column_${columnIndex}`] || null;
      }),
      body: body.map((row) => {
        const transformedRow = row.map((cell, index) => {
          const columnIndex = getColumnIndex(`column_${index}`);
          return selectedColumns[`column_${columnIndex}`] ? cell : null;
        });

        return transformedRow.every((item) => item === null) 
          ? []
          : transformedRow;
      }).filter((row) => row.length > 0),
    };

    const arrayOfData = mappedData.body.map((row) => {
      return row.reduce((acc: any, cell, index) => {
        const header = mappedData.headers[index];
        if (header !== null) {
          acc[header] = cell;
        }
        
        return acc;
      }, {});
    });

    const formattedData = arrayOfData.map((item) => {
      const amountInMiliunits = convertAmountToMiliunits(parseFloat(item.amount));
      
      // Auto-detect spend category and calculate cashback
      let spendCategory: SpendCategory | null = null;
      let cashbackEarned: number | null = null;

      if (selectedCard && item.payee) {
        spendCategory = autoDetectSpendCategory(item.payee);
        cashbackEarned = calculateCashback(selectedCard, spendCategory, amountInMiliunits);
        if (cashbackEarned === 0) cashbackEarned = null;
      }

      return {
        ...item,
        amount: amountInMiliunits,
        date: format(parse(item.date, dateFormat, new Date()), outputFormat),
        creditCard: selectedCard || null,
        spendCategory,
        cashbackEarned,
      };
    });

    onSubmit(formattedData);
  };

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24 space-y-4">
      {/* ── Credit Card Selector ───────────────────────────── */}
      <Card className="border-none drop-shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <CreditCard className="size-5 text-emerald-600" />
            Select Credit Card
          </CardTitle>
          <CardDescription>
            Select the credit card used for these transactions. Cashback will be auto-calculated per row based on the merchant name.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <Select
              value={selectedCard ?? "none"}
              onValueChange={(val) =>
                setSelectedCard(val === "none" ? null : val as CreditCardType)
              }
            >
              <SelectTrigger className="w-full lg:w-72">
                <SelectValue placeholder="Select credit card (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No credit card / Skip cashback</SelectItem>
                {CREDIT_CARD_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCard && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
                  ✓ Cashback will be auto-calculated from payee names
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Column Mapper ─────────────────────────────────── */}
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Map Columns
          </CardTitle>
          <div className="flex flex-col lg:flex-row gap-y-2 items-center gap-x-2">
            <Button 
              onClick={onCancel} 
              size="sm" 
              className="w-full lg:w-auto"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={progress < requiredOptions.length}
              onClick={handleContinue}
              className="w-full lg:w-auto"
            >
              Continue ({progress} / {requiredOptions.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ImportTable
            headers={headers}
            body={body}
            selectedColumns={selectedColumns}
            onTableHeadSelectChange={onTableHeadSelectChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};
