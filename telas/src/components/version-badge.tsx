import { APP_VERSION, APP_UPDATED_AT } from "@/lib/version";

export function VersionBadge({
  className = "",
  detailed = false,
}: {
  className?: string;
  detailed?: boolean;
}) {
  return (
    <span
      className={`select-none text-[10px] text-slate-400 ${className}`}
      title={`Atualizado em ${APP_UPDATED_AT}`}
    >
      v{APP_VERSION}
      {detailed && ` · ${APP_UPDATED_AT}`}
    </span>
  );
}
