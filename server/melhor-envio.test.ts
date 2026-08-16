import { describe, it, expect } from "vitest";
import { calculateMelhorEnvioShipping } from "./melhor-envio";

describe("Melhor Envio Shipping Integration & Sales", () => {
  it("should throw error when token is missing or unauthorized", async () => {
    await expect(
      calculateMelhorEnvioShipping({
        from: { postal_code: "50000000" },
        to: { postal_code: "01001000" },
        products: [
          {
            id: "1",
            width: 15,
            height: 10,
            length: 20,
            weight: 0.5,
            insurance_value: 100,
            quantity: 1,
          },
        ],
      })
    ).rejects.toThrow();
  });
});
