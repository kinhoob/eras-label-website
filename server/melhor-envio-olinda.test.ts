import { describe, expect, it } from "vitest";

describe("melhor envio olinda sender address", () => {
  it("contains correct address and document for Eras Label", () => {
    const sender = {
      name: "Eras Label Oficial",
      phone: "8183298369",
      email: "contato@eraslabel.com",
      document: "13985751439",
      address: "Rua Herculano Bandeira",
      number: "74",
      district: "Sítio Novo",
      city: "Olinda",
      state_abbr: "PE",
      postal_code: "53110380",
    };

    expect(sender.address).toBe("Rua Herculano Bandeira");
    expect(sender.number).toBe("74");
    expect(sender.district).toBe("Sítio Novo");
    expect(sender.city).toBe("Olinda");
    expect(sender.state_abbr).toBe("PE");
    expect(sender.postal_code).toBe("53110380");
    expect(sender.document).toBe("13985751439");
  });
});
