export function SiteFooter() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 text-xs text-muted sm:flex-row">
        <span>© {new Date().getFullYear()} Iluminnus Technology</span>
        <span>Todos os direitos reservados.</span>
      </div>
    </footer>
  );
}
