import { describe, expect, it } from "vitest";
import {
  officialAboutParagraphs,
  officialBrand,
  officialPrivacySections,
  officialReturnsSections,
} from "../client/src/lib/official-brand";

describe("official brand data", () => {
  it("keeps the official contact channels and social links", () => {
    expect(officialBrand.email).toBe("theeraslabel@gmail.com");
    expect(officialBrand.phoneLabel).toBe("(81) 98329-8369");
    expect(officialBrand.whatsappUrl).toBe("https://wa.me/5581983298369");
    expect(officialBrand.instagramUrl).toBe("https://instagram.com/eraslabel");
    expect(officialBrand.tiktokUrl).toBe("https://www.tiktok.com/@eraslabel");
    expect(officialBrand.vipWhatsappUrl).toContain("chat.whatsapp.com/I9UWZ9A6MmCLVm92mF86MK");
  });

  it("contains the official privacy, returns and institutional content", () => {
    const privacyText = officialPrivacySections.flatMap((section) => section.paragraphs).join(" ");
    const privacyTitles = officialPrivacySections.map((section) => section.title).join(" ");
    const returnsText = officialReturnsSections.flatMap((section) => section.paragraphs).join(" ");
    const aboutText = officialAboutParagraphs.join(" ");

    expect(privacyTitles).toContain("Dados coletados");
    expect(returnsText).toContain("7 dias úteis");
    expect(returnsText).toContain("theeraslabel@gmail.com");
    expect(aboutText).toContain("conectar passado, presente e futuro");
  });

  it("never exposes the old placeholder contact values", () => {
    const serialized = JSON.stringify(officialBrand);
    expect(serialized).not.toContain("5500000000000");
    expect(serialized).not.toContain("atelie@eraslabel.com");
  });
});
