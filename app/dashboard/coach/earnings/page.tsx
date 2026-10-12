"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Wallet,
  TrendingUp,
  Clock3,
  CheckCircle2,
  RefreshCw,
  CreditCard,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

import {
  getCoachEarnings,
  getCoachEarningsSummary,
  getMonthlyEarnings,
  getCoachPayoutInfo,
} from "@/services/role-coach/earnings";

import type {
  CoachEarning,
  CoachEarningsSummary,
  CoachPayoutInfo,
  MonthlyEarning,
  EarningsStatus,
} from "@/types/role-coach/earnings";

const EMPTY_SUMMARY: CoachEarningsSummary = {
  totalEarned: 0,
  pendingPayout: 0,
  totalSessions: 0,
  paidSessions: 0,
  pendingSessions: 0,
  currency: "INR",
};

const formatCurrency = (
  amount: number,
  currency = "INR"
) => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

const formatDate = (date: string | null) => {
  if (!date) return "—";

  return new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

const formatMonth = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);

  return new Date(year, monthNumber - 1, 1).toLocaleDateString(
    "en-IN",
    {
      month: "short",
      year: "2-digit",
    }
  );
};

const getMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;

const getStatusClasses = (status: EarningsStatus) => {
  switch (status) {
    case "paid":
      return "bg-emerald-50 text-emerald-700";

    case "pending":
      return "bg-amber-50 text-amber-700";

    case "failed":
      return "bg-red-50 text-red-700";

    case "refunded":
      return "bg-slate-100 text-slate-600";

    default:
      return "bg-slate-100 text-slate-600";
  }
};

export default function CoachEarningsPage() {
  const [earnings, setEarnings] = useState<CoachEarning[]>([]);
  const [summary, setSummary] =
    useState<CoachEarningsSummary>(EMPTY_SUMMARY);
  const [monthlyEarnings, setMonthlyEarnings] =
    useState<MonthlyEarning[]>([]);
  const [payoutInfo, setPayoutInfo] =
    useState<CoachPayoutInfo | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadEarnings = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
    const [
      earningsResponse,
      summaryResponse,
      monthlyResponse,
      payoutResponse,
    ] = await Promise.all([
      getCoachEarnings(),
      getCoachEarningsSummary(),
      getMonthlyEarnings(6),
      getCoachPayoutInfo(),
    ]);

    if (
      !earningsResponse.success ||
      !summaryResponse.success ||
      !monthlyResponse.success ||
      !payoutResponse.success
    ) {
      throw new Error("Failed to load coach earnings.");
    }

    setEarnings(earningsResponse.data);
    setSummary(summaryResponse.data);
    setMonthlyEarnings(monthlyResponse.data);
    setPayoutInfo(payoutResponse.data);
    } catch (err) {
      console.error("Failed to load coach earnings:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load earnings. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadEarnings();
  }, [loadEarnings]);

  const thisMonthKey = getMonthKey(new Date());

  const lastMonthDate = new Date();
  lastMonthDate.setDate(1);
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

  const lastMonthKey = getMonthKey(lastMonthDate);

  const thisMonthEarnings = useMemo(
    () =>
      earnings
        .filter(
          (item) =>
            item.status === "paid" &&
            item.date?.slice(0, 7) === thisMonthKey
        )
        .reduce((sum, item) => sum + item.netPayout, 0),
    [earnings, thisMonthKey]
  );

  const lastMonthEarnings = useMemo(
    () =>
      earnings
        .filter(
          (item) =>
            item.status === "paid" &&
            item.date?.slice(0, 7) === lastMonthKey
        )
        .reduce((sum, item) => sum + item.netPayout, 0),
    [earnings, lastMonthKey]
  );

  const chartData = useMemo(() => {
    const monthlyMap = new Map(
      monthlyEarnings.map((item) => [item.month, item])
    );

    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - (5 - index));

      const month = getMonthKey(date);
      const data = monthlyMap.get(month);

      return {
        month,
        label: formatMonth(month),
        amount: data?.totalEarned ?? 0,
      };
    });
  }, [monthlyEarnings]);

  const maxChartAmount = Math.max(
    ...chartData.map((item) => item.amount),
    1
  );

  const filteredEarnings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return earnings.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchesSearch =
        !query ||
        item.client.name.toLowerCase().includes(query) ||
        (item.service.name || "").toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [earnings, search, statusFilter]);

  const totalFees = useMemo(
    () =>
      earnings
        .filter((item) => item.status === "paid")
        .reduce((sum, item) => sum + item.platformFee, 0),
    [earnings]
  );

  const currency = summary.currency || "INR";

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Earnings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your coaching revenue, session payments, and payouts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadEarnings(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            <p className="font-semibold">Unable to load earnings</p>
            <p className="mt-1">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => void loadEarnings(true)}
            className="shrink-0 font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total earned"
          value={formatCurrency(summary.totalEarned, currency)}
          description="All-time net earnings"
          icon={<Wallet className="h-5 w-5" />}
          loading={loading}
        />

        <SummaryCard
          title="This month"
          value={formatCurrency(thisMonthEarnings, currency)}
          description="Paid net earnings"
          icon={<TrendingUp className="h-5 w-5" />}
          loading={loading}
        />

        <SummaryCard
          title="Last month"
          value={formatCurrency(lastMonthEarnings, currency)}
          description="Paid net earnings"
          icon={<ArrowUpRight className="h-5 w-5" />}
          loading={loading}
        />

        <SummaryCard
          title="Pending payout"
          value={formatCurrency(summary.pendingPayout, currency)}
          description={`${summary.pendingSessions} pending payments`}
          icon={<Clock3 className="h-5 w-5" />}
          loading={loading}
        />
      </div>

      {/* Monthly Chart + Payout Status */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Monthly earnings
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Net earnings from paid sessions over the last six months.
              </p>
            </div>

            <span className="mt-2 text-sm font-medium text-slate-600 sm:mt-0">
              {formatCurrency(
                chartData.reduce((sum, item) => sum + item.amount, 0),
                currency
              )}
            </span>
          </div>

          <div className="mt-8 flex h-52 items-end gap-3 sm:gap-5">
            {chartData.map((item) => {
              const height =
                item.amount > 0
                  ? Math.max(
                      (item.amount / maxChartAmount) * 100,
                      5
                    )
                  : 0;

              return (
                <div
                  key={item.month}
                  className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="flex h-full w-full items-end justify-center">
                    <div
                      title={formatCurrency(item.amount, currency)}
                      className={`w-full max-w-12 rounded-t-lg transition-all ${
                        item.amount > 0
                          ? "bg-indigo-500 hover:bg-indigo-600"
                          : "bg-slate-100"
                      }`}
                      style={{
                        height: `${height}%`,
                        minHeight: item.amount > 0 ? "6px" : "3px",
                      }}
                    />
                  </div>

                  <span className="text-xs text-slate-500">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <CreditCard className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Payout account
              </h2>
              <p className="text-sm text-slate-500">
                Stripe connection status
              </p>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 h-16 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <>
              <div className="mt-6 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    payoutInfo?.stripeConnected
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }`}
                />

                <span className="text-sm font-semibold text-slate-800">
                  {payoutInfo?.stripeConnected
                    ? "Stripe connected"
                    : "Not connected"}
                </span>
              </div>

              <p className="mt-3 break-all text-sm leading-6 text-slate-500">
                {payoutInfo?.stripeConnected
                  ? "Your Stripe account is linked. Payout availability depends on your payment and payout setup."
                  : "Connect your Stripe account to receive payouts. Account setup must be implemented in the backend."}
              </p>

              {payoutInfo?.stripeConnected &&
                payoutInfo.stripeAccountId && (
                  <p className="mt-3 text-xs text-slate-400">
                    Account ID: {payoutInfo.stripeAccountId}
                  </p>
                )}
            </>
          )}
        </section>
      </div>

      {/* Earnings Breakdown */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Session earnings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review the amount, Prevail fee, and net payout for each session.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search client or service..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-64"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
              aria-label="Filter earnings by status"
            >
              <option value="all">All statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-5 border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-sm">
          <div>
            <span className="text-slate-500">Sessions</span>
            <span className="ml-2 font-semibold text-slate-900">
              {summary.totalSessions}
            </span>
          </div>

          <div>
            <span className="text-slate-500">Paid</span>
            <span className="ml-2 font-semibold text-emerald-700">
              {summary.paidSessions}
            </span>
          </div>

          <div>
            <span className="text-slate-500">Paid platform fees</span>
            <span className="ml-2 font-semibold text-slate-900">
              {formatCurrency(totalFees, currency)}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-white text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-medium">Date</th>
                <th className="px-5 py-4 font-medium">Client</th>
                <th className="px-5 py-4 font-medium">Service</th>
                <th className="px-5 py-4 text-right font-medium">
                  Amount
                </th>
                <th className="px-5 py-4 text-right font-medium">
                  Prevail fee
                </th>
                <th className="px-5 py-4 text-right font-medium">
                  Net payout
                </th>
                <th className="px-5 py-4 font-medium">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Loading your earnings...
                  </td>
                </tr>
              ) : filteredEarnings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="rounded-full bg-slate-100 p-3 text-slate-500">
                        <Wallet className="h-6 w-6" />
                      </div>

                      <p className="mt-3 font-semibold text-slate-800">
                        {earnings.length === 0
                          ? "No earnings yet"
                          : "No matching sessions"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {earnings.length === 0
                          ? "Paid and pending session payment records will appear here."
                          : "Try changing your search or status filter."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEarnings.map((earning) => (
                  <tr
                    key={earning.id}
                    className="transition hover:bg-slate-50/80"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatDate(earning.date)}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {earning.client.name}
                      </p>
                      {earning.client.email && (
                        <p className="mt-1 text-xs text-slate-500">
                          {earning.client.email}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {earning.service.name || "Coaching session"}
                      </p>
                      {earning.service.sessionType && (
                        <p className="mt-1 text-xs capitalize text-slate-500">
                          {earning.service.sessionType}
                        </p>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-slate-700">
                      {formatCurrency(earning.amount, earning.currency)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-slate-600">
                      {formatCurrency(
                        earning.platformFee,
                        earning.currency
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-900">
                      {formatCurrency(
                        earning.netPayout,
                        earning.currency
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClasses(
                          earning.status
                        )}`}
                      >
                        {earning.status === "paid" && (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        {earning.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredEarnings.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            Showing {filteredEarnings.length} of {earnings.length} payment records
          </div>
        )}
      </section>

      {/* Commission Note */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-800">
          Understanding your earnings
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Amount is the gross session payment. Prevail fee is the recorded
          platform fee, and net payout is the amount remaining after that fee.
          Only actual payment records are shown here.
        </p>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  loading,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          {loading ? (
            <div className="mt-3 h-8 w-32 animate-pulse rounded-md bg-slate-100" />
          ) : (
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}