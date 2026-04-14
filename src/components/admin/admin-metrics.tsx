import { Card } from "@/components/ui/card";

type AdminMetricsProps = {
  metrics: Array<{
    label: string;
    value: string;
  }>;
};

export function AdminMetrics({ metrics }: AdminMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="bg-white/95">
          <p className="text-sm text-stone">{metric.label}</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{metric.value}</p>
        </Card>
      ))}
    </div>
  );
}
