import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services";
import { useDateFilter } from "@/context/DateFilterContext";

function rangeToFilter(range: ReturnType<typeof useDateFilter>['range']) {
  const now = new Date();
  if (!range) return undefined;
  switch (range.key) {
    case "today": {
      const s = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const e = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
      return { start: s, end: e };
    }
    case "week": {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      return { start: start.toISOString(), end: now.toISOString() };
    }
    case "month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: start.toISOString(), end: now.toISOString() };
    }
    case "custom":
    default:
      return { start: range.start, end: range.end };
  }
}

export const useDashboardStats = () => {
  const { range } = useDateFilter();
  const filter = rangeToFilter({ key: range.key, start: range.start, end: range.end });
  return useQuery({ queryKey: ["dashboard-stats", range], queryFn: () => dashboardService.getStats(filter) });
};