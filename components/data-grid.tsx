"use client";

import { FaPiggyBank } from "react-icons/fa";
import { FaCoins } from "react-icons/fa6";
import { useSearchParams } from "next/navigation";
import { FaArrowTrendUp, FaArrowTrendDown } from "react-icons/fa6";

import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";

import { formatDateRange, convertAmountFromMiliunits } from "@/lib/utils";
import { DataCard, DataCardLoading } from "@/components/data-card";

export const DataGrid = () => {
  const { data, isLoading } = useGetSummary();
  const { data: transactions, isLoading: isLoadingTx } = useGetTransactions();

  const params = useSearchParams();
  const to = params.get("to") || undefined;
  const from = params.get("from") || undefined;

  const dateRangeLabel = formatDateRange({ to, from });

  // Sum all cashbackEarned in the date range
  const totalCashback = (transactions ?? []).reduce((sum, tx) => {
    return sum + (tx.cashbackEarned ?? 0);
  }, 0);

  if (isLoading || isLoadingTx) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-2 mb-8">
        <DataCardLoading />
        <DataCardLoading />
        <DataCardLoading />
        <DataCardLoading />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-2 mb-8">
      <DataCard
        title="Remaining"
        value={data?.remainingAmount}
        percentageChange={data?.remainingChange}
        icon={FaPiggyBank}
        dateRange={dateRangeLabel}
      />
      <DataCard
        title="Income"
        value={data?.incomeAmount}
        percentageChange={data?.incomeChange}
        icon={FaArrowTrendUp}
        variant="success"
        dateRange={dateRangeLabel}
      />
      <DataCard
        title="Expenses"
        value={data?.expensesAmount}
        percentageChange={data?.expensesChange}
        icon={FaArrowTrendDown}
        variant="danger"
        dateRange={dateRangeLabel}
      />
      <DataCard
        title="Cashback Earned"
        value={convertAmountFromMiliunits(totalCashback)}
        percentageChange={0}
        icon={FaCoins}
        variant="warning"
        dateRange={dateRangeLabel}
      />
    </div>
  );
};
