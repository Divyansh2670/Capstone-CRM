import { endOfToday, startOfToday } from "date-fns";
import { BarChart3, ListTodo } from "lucide-react";
import { useGetList } from "ra-core";
import { useMemo } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { Card } from "@/components/ui/card";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal, Task } from "../types";

const startOfTodayISO = startOfToday().toISOString();
const endOfTodayISO = endOfToday().toISOString();

const tickStyle = {
  ticks: {
    text: {
      fill: "var(--color-muted-foreground)",
      fontSize: 11,
    },
  },
};

export const DashboardInsights = () => {
  const { dealStages } = useConfigurationContext();

  const { data: deals, isPending: isPendingDeals } = useGetList<Deal>("deals", {
    pagination: { page: 1, perPage: 250 },
    sort: { field: "created_at", order: "DESC" },
  });

  const { data: tasks, isPending: isPendingTasks } = useGetList<Task>("tasks", {
    pagination: { page: 1, perPage: 300 },
    sort: { field: "due_date", order: "ASC" },
  });

  const dealStageData = useMemo(() => {
    const stageCounts = (deals ?? []).reduce<Record<string, number>>((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] ?? 0) + 1;
      return acc;
    }, {});

    return dealStages
      .filter((stage) => stageCounts[stage.value] || stage.value === "won" || stage.value === "lost")
      .map((stage) => ({
        stage: stage.label,
        count: stageCounts[stage.value] ?? 0,
      }));
  }, [deals, dealStages]);

  const taskSplitData = useMemo(() => {
    const overdue = (tasks ?? []).filter(
      (task) => !task.done_date && task.due_date < startOfTodayISO,
    ).length;

    const today = (tasks ?? []).filter(
      (task) =>
        !task.done_date &&
        task.due_date >= startOfTodayISO &&
        task.due_date <= endOfTodayISO,
    ).length;

    const upcoming = (tasks ?? []).filter(
      (task) => !task.done_date && task.due_date > endOfTodayISO,
    ).length;

    const completed = (tasks ?? []).filter((task) => Boolean(task.done_date)).length;

    return [
      { bucket: "Overdue", count: overdue },
      { bucket: "Today", count: today },
      { bucket: "Upcoming", count: upcoming },
      { bucket: "Done", count: completed },
    ];
  }, [tasks]);

  if (isPendingDeals || isPendingTasks) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground">
            Deals by Stage
          </h3>
        </div>
        <div className="h-60">
          <ResponsiveBar
            data={dealStageData}
            indexBy="stage"
            keys={["count"]}
            colors={["var(--color-chart-1)"]}
            margin={{ top: 10, right: 10, bottom: 46, left: 30 }}
            padding={0.35}
            borderRadius={4}
            valueScale={{ type: "linear" }}
            axisTop={null}
            axisRight={null}
            axisLeft={{ tickSize: 0, tickPadding: 8, tickValues: 5, style: tickStyle }}
            axisBottom={{ tickSize: 0, tickPadding: 10, style: tickStyle }}
            enableGridY
            enableGridX={false}
            enableLabel={false}
            tooltip={({ indexValue, value }) => (
              <div className="p-2 bg-secondary rounded shadow text-secondary-foreground text-sm">
                <strong>{indexValue}</strong>: {value} deals
              </div>
            )}
          />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <ListTodo className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground">
            Task Workload Split
          </h3>
        </div>
        <div className="h-60">
          <ResponsiveBar
            data={taskSplitData}
            indexBy="bucket"
            keys={["count"]}
            colors={["var(--color-chart-2)"]}
            margin={{ top: 10, right: 10, bottom: 34, left: 30 }}
            padding={0.45}
            borderRadius={4}
            valueScale={{ type: "linear" }}
            axisTop={null}
            axisRight={null}
            axisLeft={{ tickSize: 0, tickPadding: 8, tickValues: 5, style: tickStyle }}
            axisBottom={{ tickSize: 0, tickPadding: 10, style: tickStyle }}
            enableGridY
            enableGridX={false}
            enableLabel={false}
            tooltip={({ indexValue, value }) => (
              <div className="p-2 bg-secondary rounded shadow text-secondary-foreground text-sm">
                <strong>{indexValue}</strong>: {value} tasks
              </div>
            )}
          />
        </div>
      </Card>
    </div>
  );
};
