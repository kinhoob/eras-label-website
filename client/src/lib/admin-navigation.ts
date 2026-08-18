/**
 * Identificadores visuais usados pela sidebar administrativa.
 *
 * Os componentes do Lucide continuam a ser resolvidos no Admin.tsx para manter
 * este ficheiro puro, pequeno e fácil de testar sem depender do DOM.
 */
export type AdminNavIcon =
  | "dashboard"
  | "analytics"
  | "sales"
  | "catalog"
  | "history"
  | "alerts"
  | "categories"
  | "customers"
  | "marketing"
  | "coupon"
  | "appearance"
  | "cms"
  | "menus"
  | "settings"
  | "team";

/** Representa uma opção final de navegação dentro de uma categoria. */
export type AdminNavItem = {
  label: string;
  icon: AdminNavIcon;
};

/** Representa uma categoria expansível da navegação administrativa. */
export type AdminNavGroup = {
  id: string;
  label: string;
  icon: AdminNavIcon;
  items: AdminNavItem[];
};

/**
 * Monta a navegação por domínio funcional.
 *
 * A configuração do superadministrador é adicionada apenas quando o utilizador
 * principal está autenticado, evitando que a opção apareça para sub-admins.
 */
export function buildAdminNavGroups(isSuperAdmin: boolean): AdminNavGroup[] {
  const groups: AdminNavGroup[] = [
    {
      id: "overview",
      label: "Visão geral",
      icon: "dashboard",
      items: [{ label: "Visão geral", icon: "dashboard" }],
    },
    {
      id: "insights",
      label: "Análise & Alertas",
      icon: "analytics",
      items: [
        { label: "Estatísticas", icon: "analytics" },
        { label: "Histórico de Estoque", icon: "history" },
        { label: "Alertas de Estoque", icon: "alerts" },
      ],
    },
    {
      id: "sales",
      label: "Vendas & Clientes",
      icon: "sales",
      items: [
        { label: "Vendas", icon: "sales" },
        { label: "Pedidos", icon: "sales" },
        { label: "Clientes", icon: "customers" },
        { label: "Carrinhos Abandonados", icon: "sales" },
      ],
    },
    {
      id: "catalog",
      label: "Catálogo",
      icon: "catalog",
      items: [
        { label: "Produtos", icon: "catalog" },
        { label: "Inventário", icon: "catalog" },
        { label: "Categorias", icon: "categories" },
      ],
    },
    {
      id: "marketing",
      label: "Marketing & E-mails",
      icon: "marketing",
      items: [
        { label: "E-mail Marketing", icon: "marketing" },
        { label: "Newsletter", icon: "marketing" },
        { label: "E-mails (Resend)", icon: "marketing" },
        { label: "Cupons", icon: "coupon" },
      ],
    },
    {
      id: "appearance",
      label: "Aparência & CMS",
      icon: "appearance",
      items: [
        { label: "Aparência", icon: "appearance" },
        { label: "CMS Institucional", icon: "cms" },
        { label: "Menus Dinâmicos", icon: "menus" },
        { label: "Pedido Manual", icon: "sales" },
      ],
    },
    {
      id: "settings",
      label: "Definições & Equipa",
      icon: "settings",
      items: [{ label: "Configurações", icon: "settings" }],
    },
  ];

  if (isSuperAdmin) {
    groups[groups.length - 1].items.push({
      label: "Gestão de Equipa",
      icon: "team",
    });
  }

  return groups;
}

/** Encontra a categoria de uma página ativa para abrir o grupo correto. */
export function getAdminNavGroupId(groups: AdminNavGroup[], activeLabel: string): string | null {
  return groups.find((group) => group.items.some((item) => item.label === activeLabel))?.id ?? null;
}
