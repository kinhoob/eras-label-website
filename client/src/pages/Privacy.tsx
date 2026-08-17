import OfficialInfoPage from "@/components/OfficialInfoPage";
import { officialBrand, officialPrivacySections } from "@/lib/official-brand";

export default function PrivacyPage() {
  return (
    <OfficialInfoPage
      eyebrow="INFORMAÇÕES · PRIVACIDADE"
      title="Política de Privacidade"
      intro={`A sua privacidade é importante para nós. Esta política descreve como coletamos, usamos, armazenamos e protegemos suas informações ao utilizar a Loja ${officialBrand.name}. Ao acessar e utilizar a Loja, você declara estar ciente dos termos aqui previstos e de acordo com esta política.`}
      sections={[
        ...officialPrivacySections,
        { title: "7. Contato", paragraphs: [`Se tiver dúvidas ou desejar exercer seus direitos, entre em contato conosco pelo e-mail: ${officialBrand.email}.`, "Esta Política de Privacidade pode ser alterada a qualquer momento. Recomendamos que você a revise periodicamente."] },
      ]}
    />
  );
}
