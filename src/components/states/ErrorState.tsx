import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ErrorState = ({
  message = "Something went wrong",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => (
  <div className="bg-card rounded-xl border border-destructive/30 p-8 text-center">
    <AlertTriangle size={28} className="mx-auto mb-2 text-destructive" />
    <p className="text-sm font-medium">{message}</p>
    {onRetry && (
      <Button size="sm" variant="outline" className="mt-3" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);