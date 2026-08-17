import { describe, expect, it } from "vitest";
import { buildAdminNavGroups, getAdminNavGroupId } from "./admin-navigation";

describe("admin navigation groups", () => {
  it("organiza todas as opções em categorias sem itens soltos", () => {
    const groups = buildAdminNavGroups(true);
    const labels = groups.flatMap((group) => group.items.map((item) => item.label));

    expect(groups.map((group) => group.label)).toEqual([
      "Visão geral",
      "Análise & Alertas",
      "Vendas & Clientes",
      "Catálogo",
      "Marketing & E-mails",
      "Aparência & CMS",
      "Definições & Equipa",
    ]);
    expect(labels).toContain("E-mails (Resend)");
    expect(labels).toContain("Gestão de Equipe");
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("não exibe Gestão de Equipe para subadministradores", () => {
    const groups = buildAdminNavGroups(false);
    const labels = groups.flatMap((group) => group.items.map((item) => item.label));

    expect(labels).not.toContain("Gestão de Equipe");
    expect(labels).toContain("Configurações");
  });

  it("encontra a categoria da página ativa", () => {
    const groups = buildAdminNavGroups(true);

    expect(getAdminNavGroupId(groups, "Produtos")).toBe("catalog");
    expect(getAdminNavGroupId(groups, "CMS Institucional")).toBe("appearance");
    expect(getAdminNavGroupId(groups, "Gestão de Equipe")).toBe("settings");
    expect(getAdminNavGroupId(groups, "Página inexistente")).toBeNull();
  });
});
