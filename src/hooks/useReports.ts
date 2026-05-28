import { useQuery } from "@tanstack/react-query";
import { reportService } from "@/services";
import { useDateFilter } from "@/context/DateFilterContext";

export const useReportSummary = () => {
  const { range } = useDateFilter();
  const filter = range.key === "custom" ? { start: range.start, end: range.end } : undefined;
  return useQuery({ queryKey: ["report-summary", range], queryFn: () => reportService.getSummary(filter) });
};