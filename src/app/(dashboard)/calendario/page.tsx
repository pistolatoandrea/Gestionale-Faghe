import { ModulePlaceholder } from "@/components/module-placeholder";
import { MODULES } from "@/lib/modules";

const mod = MODULES.find((m) => m.slug === "calendario")!;

export default function CalendarioPage() {
  return <ModulePlaceholder icon={mod.icon} label={mod.label} description={mod.description} />;
}
