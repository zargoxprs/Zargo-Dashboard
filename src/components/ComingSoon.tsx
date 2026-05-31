import { Link } from "react-router-dom";

interface ComingSoonProps {
  title: string;
  description?: string;
  planned?: string | string[];
  actionLabel?: string;
  actionTo?: string;
}

const ComingSoon = ({
  title,
  description = "This module is under construction and will be available soon.",
  planned,
  actionLabel = "Back to dashboard",
  actionTo = "/",
}: ComingSoonProps) => {
  const plannedList = Array.isArray(planned) ? planned : planned ? [planned] : [];

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-10 text-left shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Status: Coming Soon</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-xl">{description}</p>

        {plannedList.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-muted-foreground">Planned functionality</p>
            <ul className="mt-2 ml-5 list-disc text-sm text-muted-foreground">
              {plannedList.map((p, idx) => (
                <li key={idx} className="mt-1">{p}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex justify-start">
          <Link
            to={actionTo}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
