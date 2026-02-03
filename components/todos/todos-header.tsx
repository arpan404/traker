import { Button } from "@/components/ui/button";

interface TodosHeaderProps {
  title: string;
  description: string;
  actionLabel: string;
  onNew: () => void;
}

export function TodosHeader({
  title,
  description,
  actionLabel,
  onNew,
}: TodosHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {description}
        </p>
      </div>
      <Button
        onClick={onNew}
        className="bg-[var(--accent)] text-white hover:opacity-90 font-bold px-6 shadow-sm"
      >
        {actionLabel}
      </Button>
    </header>
  );
}
