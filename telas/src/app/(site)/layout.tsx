import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VersionBadge } from "@/components/version-badge";
import { VersionChecker } from "@/components/version-checker";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <div className="fixed bottom-2 left-2 z-40 flex flex-col items-start gap-1">
        <VersionBadge className="rounded bg-white/70 px-1.5 py-0.5 backdrop-blur-sm" />
        <VersionChecker />
      </div>
    </>
  );
}
