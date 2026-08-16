export type StorefrontConfig = {
  announcement: {
    enabled: boolean;
    text: string;
    href: string;
    backgroundColor: string;
    textColor: string;
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
    text: "5% OFF PARA PAGAMENTOS NO PIX · UMA NOVA ERA COMEÇA AQUI",
    href: "",
    backgroundColor: "#b22222",
    textColor: "#ffffff",
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
