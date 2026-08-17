import OfficialInfoPage from "@/components/OfficialInfoPage";
import { officialReturnsSections } from "@/lib/official-brand";

export default function ReturnsPage() {
  return (
    <OfficialInfoPage
      eyebrow="INFORMAÇÕES · ATENDIMENTO"
      title="Trocas e Devoluções"
      intro="Confira os prazos, condições e passos publicados pela Eras Label para solicitar uma troca ou devolução. Em caso de dúvida, fale com o nosso atendimento antes de enviar qualquer produto."
      sections={officialReturnsSections}
    />
  );
}
