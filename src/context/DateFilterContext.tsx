import React, { createContext, useContext, useState, ReactNode } from "react";

export type DateRangeKey = "today" | "week" | "month" | "custom";
export interface DateRange {
  key: DateRangeKey;
  start?: string; // ISO date
  end?: string; // ISO date
}

const DateFilterContext = createContext<{
  range: DateRange;
  setRange: (r: DateRange) => void;
}>({ range: { key: "month" }, setRange: () => {} });

export const DateFilterProvider = ({ children }: { children: ReactNode }) => {
  const [range, setRange] = useState<DateRange>({ key: "month" });
  return <DateFilterContext.Provider value={{ range, setRange }}>{children}</DateFilterContext.Provider>;
};

export const useDateFilter = () => useContext(DateFilterContext);

export default DateFilterContext;
