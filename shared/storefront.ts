export type StorefrontAnnouncementMessage = {
  id: string;
  text: string;
  href: string;
};

export type StorefrontConfig = {
  announcement: {
    enabled: boolean;
    messages: StorefrontAnnouncementMessage[];
    backgroundColor: string;
    textColor: string;
    rotationSpeedSeconds: number;
    showArrows: boolean;
  };
  maintenance: {
    enabled: boolean;
    title: string;
    message: string;
    accessLabel: string;
  };
  drop: {
    enabled: boolean;
    title: string;
    targetAt: string | null;
  };
};

export const DEFAULT_STOREFRONT_CONFIG: StorefrontConfig = {
  announcement: {
    enabled: true,
    messages: [
      { id: "pix", text: "5% OFF PARA PAGAMENTOS NO PIX · UMA NOVA ERA COMEÇA AQUI", href: "" },
      { id: "shipping", text: "FRETE GRÁTIS ACIMA DE R$ 350 · ENVIO PARA TODO O BRASIL", href: "/faq" },
    ],
    backgroundColor: "#b22222",
    textColor: "#ffffff",
    rotationSpeedSeconds: 4,
    showArrows: true,
  },
  maintenance: {
    enabled: false,
    title: "Página em construção",
    message: "Estamos a preparar a próxima era. Volte em breve para descobrir o novo drop.",
    accessLabel: "Entrar na área administrativa",
  },
  drop: {
    enabled: false,
    title: "PRÓXIMO DROP",
    targetAt: null,
  },
};
