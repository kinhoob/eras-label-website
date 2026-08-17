import OfficialInfoPage from "@/components/OfficialInfoPage";

const shippingSections = [
  {
    title: "Postagem dos pedidos",
    paragraphs: ["Os Correios recolhem os pedidos da semana todas as quintas e sextas em nossa sede."],
  },
  {
    title: "Código de rastreio",
    paragraphs: ["Assim que o pedido é enviado, o código de rastreio chega no e-mail de cadastro feito na hora da compra. No nosso site, você também pode acompanhar o pedido pela página de rastreamento quando o código estiver disponível."],
  },
  {
    title: "Frete grátis",
    paragraphs: ["A página oficial informa frete grátis para todo o Brasil na modalidade SEDEX acima de pedidos de R$300,00. No checkout desta loja, o valor e a disponibilidade do frete são calculados conforme o CEP e a configuração vigente do painel administrativo."]
  },
] as const;

export default function ShippingPage() {
  return (
    <OfficialInfoPage
      eyebrow="INFORMAÇÕES · LOGÍSTICA"
      title="Envios"
      intro="Acompanhe como a Eras Label organiza a postagem, envia o código de rastreio e disponibiliza o frete conforme as regras publicadas pela marca."
      sections={shippingSections}
    />
  );
}
