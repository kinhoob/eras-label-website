import OfficialInfoPage from "@/components/OfficialInfoPage";
import { officialAboutParagraphs } from "@/lib/official-brand";

export default function AboutPage() {
  return (
    <OfficialInfoPage
      eyebrow="A MARCA · ERAS LABEL"
      title="Quem Somos"
      intro="Conheça a ideia que conecta as coleções da Eras Label e atravessa passado, presente e futuro através do streetwear."
      sections={[{ title: "Reviver e reinventar eras", paragraphs: officialAboutParagraphs }]}
    />
  );
}
