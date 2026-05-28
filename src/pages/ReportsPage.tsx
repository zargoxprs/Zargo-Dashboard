import StatCard from "@/components/StatCard";
import { Bike, CalendarDays, Users, TrendingUp } from "lucide-react";
import RupeeIcon from "@/components/ui/icons/RupeeIcon";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { useReportSummary } from "@/hooks/useReports";
import { StatCardsSkeleton } from "@/components/states/LoadingSkeleton";
import { ErrorState } from "@/components/states/ErrorState";

const ReportsPage = () => {
  const { data, isLoading, error, refetch } = useReportSummary();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Insights and performance analytics</p>
        </div>
        <StatCardsSkeleton />
      </div>
    );
  }


  const statusColors: Record<string, string> = {
    available: "hsl(142 71% 42%)",
    rented: "hsl(216 100% 50%)",
    service: "hsl(38 92% 50%)",
    idle: "hsl(220 10% 60%)",
  };
  const vehicleData = data.vehicleStatusBreakdown.map((d) => ({ ...d, color: statusColors[d.name] }));
  const trendData = data.rentalTrend;
  const bookingDist = data.bookingStatusBreakdown;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Insights and performance analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Fleet Size" value={data.fleetSize} icon={Bike} subtitle="Total vehicles" />
        <StatCard title="Total Bookings" value={data.totalBookings} icon={CalendarDays} accent="primary" subtitle={`${data.completedBookings} completed`} />
        <StatCard title="Revenue" value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(data.rentalTrend.reduce((s, r) => s + (r.revenue || 0), 0))} icon={RupeeIcon} accent="success" subtitle="+11% vs last month" />
        <StatCard title="Onboarded" value={data.totalOnboarded} icon={Users} accent="accent" subtitle="By team" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-semibold mb-4">Vehicle Status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={vehicleData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {vehicleData.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {vehicleData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                <span className="capitalize text-muted-foreground">{d.name}</span>
                <span className="ml-auto font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Rental Trend</h2>
            <span className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp size={12} className="text-success" /> Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="rentals" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-5">
        <h2 className="font-semibold mb-4">Booking Distribution</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={bookingDist}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReportsPage;
