import { z } from "zod";
import { Trash } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Select } from "@/components/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/date-picker";
import { insertTransactionSchema } from "@/db/schema";
import { convertAmountToMiliunits } from "@/lib/utils";
import { AmountInput } from "@/components/amount-input";
import {
  CREDIT_CARDS,
  CREDIT_CARD_OPTIONS,
  CARD_SPEND_CATEGORIES,
  SPEND_CATEGORIES,
  calculateCashback,
  getCashbackRate,
  autoDetectSpendCategory,
  formatCashback,
  type CreditCard,
  type SpendCategory,
} from "@/lib/cashback";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select as UISelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  date: z.coerce.date(),
  accountId: z.string(),
  categoryId: z.string().nullable().optional(),
  payee: z.string(),
  amount: z.string(),
  notes: z.string().nullable().optional(),
  creditCard: z.string().nullable().optional(),
  spendCategory: z.string().nullable().optional(),
  cashbackEarned: z.number().int().nullable().optional(),
});

const apiSchema = insertTransactionSchema.omit({
  id: true,
});

type FormValues = z.input<typeof formSchema>;
type ApiFormValues = z.input<typeof apiSchema>;

type Props = {
  id?: string;
  defaultValues?: FormValues;
  onSubmit: (values: ApiFormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  accountOptions: { label: string; value: string; }[];
  categoryOptions: { label: string; value: string; }[];
  onCreateAccount: (name: string) => void;
  onCreateCategory: (name: string) => void;
};

export const TransactionForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  accountOptions,
  categoryOptions,
  onCreateAccount,
  onCreateCategory,
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  // Watch fields for live cashback calculation
  const watchedCard = useWatch({ control: form.control, name: "creditCard" });
  const watchedSpendCategory = useWatch({ control: form.control, name: "spendCategory" });
  const watchedAmount = useWatch({ control: form.control, name: "amount" });
  const watchedPayee = useWatch({ control: form.control, name: "payee" });

  // Auto-detect spend category when payee changes and no category set yet
  const handlePayeeBlur = () => {
    if (watchedCard && !watchedSpendCategory && watchedPayee) {
      const detected = autoDetectSpendCategory(watchedPayee);
      form.setValue("spendCategory", detected);
    }
  };

  // Compute live cashback preview
  const getLiveCashback = (): number => {
    if (!watchedCard || !watchedSpendCategory || !watchedAmount) return 0;
    const amount = parseFloat(watchedAmount);
    if (isNaN(amount) || amount >= 0) return 0;
    const amountInMiliunits = convertAmountToMiliunits(amount);
    return calculateCashback(
      watchedCard as CreditCard,
      watchedSpendCategory as SpendCategory,
      amountInMiliunits,
    );
  };

  const liveCashback = getLiveCashback();
  const cashbackRate = watchedCard && watchedSpendCategory
    ? getCashbackRate(watchedCard as CreditCard, watchedSpendCategory as SpendCategory)
    : 0;

  const spendCategoryOptions = watchedCard
    ? CARD_SPEND_CATEGORIES[watchedCard as CreditCard].map((key) => ({
        value: key,
        label: SPEND_CATEGORIES[key],
      }))
    : [];

  const handleSubmit = (values: FormValues) => {
    const amount = parseFloat(values.amount);
    const amountInMiliunits = convertAmountToMiliunits(amount);

    const cashback =
      values.creditCard && values.spendCategory
        ? calculateCashback(
            values.creditCard as CreditCard,
            values.spendCategory as SpendCategory,
            amountInMiliunits,
          )
        : null;

    onSubmit({
      ...values,
      amount: amountInMiliunits,
      creditCard: values.creditCard || null,
      spendCategory: values.spendCategory || null,
      cashbackEarned: cashback,
    });
  };

  const handleDelete = () => {
    onDelete?.();
  };
  
  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className="space-y-4 pt-4"
      >
        <FormField
          name="date"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="accountId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <FormControl>
                <Select
                  placeholder="Select an account"
                  options={accountOptions}
                  onCreate={onCreateAccount}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="categoryId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select
                  placeholder="Select a category"
                  options={categoryOptions}
                  onCreate={onCreateCategory}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="payee"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payee</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder="Add a payee"
                  {...field}
                  onBlur={handlePayeeBlur}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="amount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <AmountInput
                  {...field}
                  disabled={disabled}
                  placeholder="0.00"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="notes"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  disabled={disabled}
                  placeholder="Optional notes"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* ── Cashback Section ───────────────────────── */}
        <div className="border rounded-xl p-4 space-y-3 bg-emerald-50 border-emerald-200">
          <p className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
            💳 Cashback Tracker
            <span className="text-xs font-normal text-emerald-600">(optional)</span>
          </p>

          <FormField
            name="creditCard"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Credit Card Used</FormLabel>
                <UISelect
                  disabled={disabled}
                  value={field.value ?? "none"}
                  onValueChange={(val) => {
                    field.onChange(val === "none" ? null : val);
                    form.setValue("spendCategory", null);
                    form.setValue("cashbackEarned", null);
                  }}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select credit card (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {CREDIT_CARD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </UISelect>
              </FormItem>
            )}
          />

          {watchedCard && (
            <FormField
              name="spendCategory"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Spend Category</FormLabel>
                  <UISelect
                    disabled={disabled}
                    value={field.value ?? "none"}
                    onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select spend category" />
                    </SelectTrigger>
                    <SelectContent>
                      {spendCategoryOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </UISelect>
                  {watchedPayee && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto-detected from payee. You can change it.
                    </p>
                  )}
                </FormItem>
              )}
            />
          )}

          {watchedCard && watchedSpendCategory && (
            <div className="flex items-center justify-between rounded-lg bg-white border border-emerald-200 px-3 py-2">
              <div>
                <p className="text-xs text-muted-foreground">Cashback Rate</p>
                <p className="text-sm font-semibold text-emerald-700">{cashbackRate}%</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Estimated Cashback</p>
                <p className="text-lg font-bold text-emerald-600">
                  {liveCashback > 0 ? formatCashback(liveCashback) : "₹0.00"}
                </p>
              </div>
            </div>
          )}
        </div>

        <Button className="w-full" disabled={disabled}>
          {id ? "Save changes" : "Create transaction"}
        </Button>
        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={handleDelete}
            className="w-full"
            variant="outline"
          >
            <Trash className="size-4 mr-2" />
            Delete transaction
          </Button>
        )}
      </form>
    </Form>
  );
};
