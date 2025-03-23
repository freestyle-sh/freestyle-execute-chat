"use client";

import { ModulesSettings } from "@/components/modules-settings";
import { useSearchParams } from "next/navigation";

export default function ModulesPage() {
  const searchParams = useSearchParams();
  const moduleToOpen = searchParams.get("module");

  return <ModulesSettings moduleToOpen={moduleToOpen} />;
}
