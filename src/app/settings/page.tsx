export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-2">Appearance</h2>
          <p className="text-sm text-muted-foreground">
            Configure your appearance settings
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-medium mb-2">Account</h2>
          <p className="text-sm text-muted-foreground">
            Manage your account settings
          </p>
        </div>
      </div>
    </div>
  );
}

