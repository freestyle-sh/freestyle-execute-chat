"use client";

import { useEffect, useState } from "react";

/**
 * This component ensures that its children are only rendered on the client side.
 *
 * Use this component to suppress hydration errors for components that rely on
 * themeing and similar.
 */
export default function ClientOnly({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
