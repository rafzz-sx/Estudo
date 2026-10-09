import { Metadata } from "next";
import { NovidadesView } from "@/components/novidades/NovidadesView";

export const metadata: Metadata = {
  title: "Novidades & Atualizações | BatCaverna",
  description:
    "Acompanhe o registro cronológico de atualizações, novos recursos, melhorias e correções da plataforma BatCaverna.",
};

export default function NovidadesPage() {
  return <NovidadesView />;
}
