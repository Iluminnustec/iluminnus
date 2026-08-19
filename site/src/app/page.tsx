import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Sobre } from "@/components/sobre";
import { Produtos } from "@/components/produtos";
import { Contato } from "@/components/contato";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Sobre />
        <Produtos />
        <Contato />
      </main>
      <SiteFooter />
    </div>
  );
}
