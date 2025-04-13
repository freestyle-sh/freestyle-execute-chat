import { ModulesSettings } from "@/components/modules-settings";
import { SettingsSection } from "@/components/settings";
import { Suspense } from "react";

export default async function ModulesPage({
  searchParams: { module },
}: {
  searchParams: {
    module: string | null;
  };
}) {
  return (
    <SettingsSection
      title="Module Configurations"
      description="Configure your modules to use external services and APIs"
    >
      <Suspense>
        <ModulesSettings moduleToOpen={module} />
      </Suspense>
    </SettingsSection>
  );
}
