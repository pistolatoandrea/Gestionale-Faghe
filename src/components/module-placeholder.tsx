import type { LucideIcon } from "lucide-react";

export function ModulePlaceholder({
  icon: Icon,
  label,
  description,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-6" />
      </div>
      <h1 className="text-xl font-semibold">{label}</h1>
      <p className="max-w-sm text-muted-foreground">
        {description}. Questa sezione verrà sviluppata nella prossima fase.
      </p>
    </div>
  );
}
