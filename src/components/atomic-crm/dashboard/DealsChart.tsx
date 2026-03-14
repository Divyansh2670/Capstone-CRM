import { ResponsiveBar } from "@nivo/bar";
import {
  format,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { DollarSign } from "lucide-react";
import { useGetList } from "ra-core";
import { memo, useEffect, useMemo, useState } from "react";

import type { Deal } from "../types";

const multiplier: Record<string, number> = {
  opportunity: 0.2,
  "proposal-sent": 0.5,
  "in-negociation": 0.8,
  delayed: 0.3,
};

type Granularity = "day" | "month" | "year";
type TimeRange = "14" | "30" | "90" | "6" | "12" | "24" | "3" | "5";

type ChartPoint = {
  date: string;
  won: number;
  pending: number;
  lost: number;
};

const rangeOptions: Record<Granularity, Array<{ value: TimeRange; label: string }>> = {
  day: [
    { value: "14", label: "Last 14 days" },
    { value: "30", label: "Last 30 days" },
    { value: "90", label: "Last 90 days" },
  ],
  month: [
    { value: "6", label: "Last 6 months" },
    { value: "12", label: "Last 12 months" },
    { value: "24", label: "Last 24 months" },
  ],
  year: [
    { value: "3", label: "Last 3 years" },
    { value: "5", label: "Last 5 years" },
  ],
};

const DEFAULT_LOCALE = "en-US";
const CURRENCY = "USD";

export const DealsChart = memo(() => {
  const [granularity, setGranularity] = useState<Granularity>("month");
  const [timeRange, setTimeRange] = useState<TimeRange>("6");

  useEffect(() => {
    const validRanges = rangeOptions[granularity].map((option) => option.value);
    if (!validRanges.includes(timeRange)) {
      setTimeRange(rangeOptions[granularity][0].value);
    }
  }, [granularity, timeRange]);

  const acceptedLanguages =
    typeof navigator !== "undefined"
      ? navigator.languages || [navigator.language]
      : [DEFAULT_LOCALE];

  const sinceDateISO = useMemo(() => {
    const now = new Date();
    if (granularity === "day") {
      return subDays(now, Number(timeRange)).toISOString();
    }
    if (granularity === "month") {
      return subMonths(now, Number(timeRange)).toISOString();
    }
    return subYears(now, Number(timeRange)).toISOString();
  }, [granularity, timeRange]);

  const { data, isPending } = useGetList<Deal>("deals", {
    pagination: { perPage: 1000, page: 1 },
    sort: {
      field: "created_at",
      order: "ASC",
    },
    filter: {
      "created_at@gte": sinceDateISO,
    },
  });

  const chartData = useMemo<ChartPoint[]>(() => {
    if (!data) return [];

    const groupedDeals = data.reduce<Record<string, Deal[]>>((acc, deal) => {
      const createdAt = deal.created_at ? new Date(deal.created_at) : new Date();
      const periodStart =
        granularity === "day"
          ? startOfDay(createdAt)
          : granularity === "month"
            ? startOfMonth(createdAt)
            : startOfYear(createdAt);
      const key = periodStart.toISOString();

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(deal);
      return acc;
    }, {});

    const labelFormat =
      granularity === "day"
        ? "dd MMM"
        : granularity === "month"
          ? "MMM yyyy"
          : "yyyy";

    return Object.keys(groupedDeals)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map((bucketKey) => {
        const periodDeals = groupedDeals[bucketKey];
        return {
          date: format(new Date(bucketKey), labelFormat),
          won: periodDeals
            .filter((deal) => deal.stage === "won")
            .reduce((acc, deal) => acc + deal.amount, 0),
          pending: periodDeals
            .filter((deal) => !["won", "lost"].includes(deal.stage))
            .reduce((acc, deal) => acc + deal.amount * (multiplier[deal.stage] ?? 0.4), 0),
          lost: periodDeals
            .filter((deal) => deal.stage === "lost")
            .reduce((acc, deal) => acc - deal.amount, 0),
        };
      });
  }, [data, granularity]);

  if (isPending) {
    return null;
  }

  const range = chartData.reduce(
    (acc, point) => {
      acc.min = Math.min(acc.min, point.lost);
      acc.max = Math.max(acc.max, point.won + point.pending);
      return acc;
    },
    { min: 0, max: 0 },
  );

  const minValue = range.min === 0 ? -1 : range.min * 1.2;
  const maxValue = range.max === 0 ? 1 : range.max * 1.2;
  const currentRangeOptions = rangeOptions[granularity];

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center">
          <div className="mr-3 flex">
            <DollarSign className="text-muted-foreground w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-muted-foreground">
            Upcoming Deal Revenue
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-md border border-border bg-background p-1">
            {(["day", "month", "year"] as Granularity[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setGranularity(value)}
                className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                  granularity === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            Timeline
            <select
              value={timeRange}
              onChange={(event) => setTimeRange(event.target.value as TimeRange)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              {currentRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="h-100">
        <ResponsiveBar
          data={chartData}
          indexBy="date"
          keys={["won", "pending", "lost"]}
          colors={[
            "var(--color-chart-1)",
            "var(--color-chart-3)",
            "var(--color-chart-5)",
          ]}
          margin={{ top: 30, right: 50, bottom: 60, left: 0 }}
          padding={0.3}
          valueScale={{
            type: "linear",
            min: minValue,
            max: maxValue,
          }}
          indexScale={{ type: "band", round: true }}
          enableGridX={true}
          enableGridY={false}
          enableLabel={false}
          tooltip={({ value, indexValue }) => (
            <div className="p-2 bg-secondary rounded shadow inline-flex items-center gap-1 text-secondary-foreground">
              <strong>{indexValue}: </strong>&nbsp;{value > 0 ? "+" : ""}
              {value.toLocaleString(acceptedLanguages.at(0) ?? DEFAULT_LOCALE, {
                style: "currency",
                currency: CURRENCY,
              })}
            </div>
          )}
          axisTop={{
            tickSize: 0,
            tickPadding: 12,
            style: {
              ticks: {
                text: {
                  fill: "var(--color-muted-foreground)",
                },
              },
              legend: {
                text: {
                  fill: "var(--color-muted-foreground)",
                },
              },
            },
          }}
          axisBottom={{
            legendPosition: "middle",
            legendOffset: 50,
            tickSize: 0,
            tickPadding: 12,
            tickRotation: granularity === "year" ? 0 : -25,
            style: {
              ticks: {
                text: {
                  fill: "var(--color-muted-foreground)",
                },
              },
              legend: {
                text: {
                  fill: "var(--color-muted-foreground)",
                },
              },
            },
          }}
          axisLeft={null}
          axisRight={{
            format: (v: number) => `${Math.abs(v / 1000)}k`,
            tickValues: 8,
            style: {
              ticks: {
                text: {
                  fill: "var(--color-muted-foreground)",
                },
              },
              legend: {
                text: {
                  fill: "var(--color-muted-foreground)",
                },
              },
            },
          }}
          markers={
            [
              {
                axis: "y",
                value: 0,
                lineStyle: { strokeOpacity: 0 },
                textStyle: { fill: "var(--color-chart-1)" },
                legend: "Won",
                legendPosition: "top-left",
                legendOrientation: "vertical",
              },
              {
                axis: "y",
                value: 0,
                lineStyle: {
                  stroke: "var(--color-chart-5)",
                  strokeWidth: 1,
                },
                textStyle: { fill: "var(--color-chart-5)" },
                legend: "Lost",
                legendPosition: "bottom-left",
                legendOrientation: "vertical",
              },
            ] as any
          }
        />
      </div>
    </div>
  );
});
