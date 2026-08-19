import { APP_VERSION } from "@/lib/version";

export function VersionBadge() {
  return (
    <div className="fixed bottom-3 left-3 z-50 rounded-full border border-border bg-surface/80 px-2.5 py-1 text-xs text-muted backdrop-blur-sm">
      v{APP_VERSION}
    </div>
  );
}
