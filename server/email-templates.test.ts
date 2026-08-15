import { describe, expect, it } from "vitest";
import { newsletterWelcomeEmail, orderConfirmationEmail } from "./email-templates";

const order = {
  orderNumber: "ER-2026-1234",
  customerName: "Ana <Teste>",
  customerEmail: "ana@example.com",
  paymentMethod: "pix" as const,
  items: [{ productId: 1, name: "Camiseta <Era>", size: "M", quantity: 2, price: 100 }],
  subtotal: 200,
  shippingCost: 0,
  discount: 20,
  total: 180,
  address: { street: "Rua Teste", number: "10", city: "Recife", state: "PE", cep: "50000000" },
};

describe("Eras Label email templates", () => {
  it("renders an order confirmation with escaped customer and product values", () => {
    const email = orderConfirmationEmail(order);

    expect(email.subject).toContain("ER-2026-1234");
    expect(email.html).toContain("Ana &lt;Teste&gt;");
    expect(email.html).toContain("Camiseta &lt;Era&gt;");
    expect(email.html).toContain("R$ 180,00");
    expect(email.html).not.toContain("<Teste>");
    expect(email.text).toContain("Camiseta <Era>");
  });

  it("includes the welcome coupon in both HTML and plain text", () => {
    const email = newsletterWelcomeEmail("Kinho", "ERAS10-ABCDE");

    expect(email.html).toContain("ERAS10-ABCDE");
    expect(email.text).toContain("ERAS10-ABCDE");
    expect(email.subject).toContain("Eras Label");
  });
});
