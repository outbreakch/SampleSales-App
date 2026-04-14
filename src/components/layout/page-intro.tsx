import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PageIntroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function PageIntro({ eyebrow, title, description, actions, className }: PageIntroProps) {
  return (
    <Card className={cn("bg-white/90", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.28em] text-stone">{eyebrow}</p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">{title}</h2>
          {description ? <p className="mt-3 text-sm leading-6 text-stone">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
      </div>
    </Card>
  );
}
