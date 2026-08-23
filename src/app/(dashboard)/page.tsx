import Link from "next/link";
import { MODULES } from "@/lib/modules";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Benvenuto</h1>
        <p className="text-muted-foreground">Scegli una sezione per iniziare.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.slug} href={mod.href}>
              <Card className="h-full transition-colors hover:border-primary hover:bg-accent/50">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{mod.label}</CardTitle>
                  <CardDescription>{mod.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
