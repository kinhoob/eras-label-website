import { describe, expect, it } from "vitest";
import { collectCollectionRecipients } from "./marketing-audience";

describe("collection marketing audience", () => {
  it("returns unique buyers of the requested collection", () => {
    const recipients = collectCollectionRecipients(
      "  PARADOX COLLECTION ",
      [
        { id: 1, collection: "Paradox Collection" },
        { id: 2, collection: "Raízes" },
      ],
      [
        { customerEmail: "A@EXAMPLE.COM ", customerName: "Ana", items: [{ productId: 1 }] },
        { customerEmail: "a@example.com", customerName: "Ana", items: [{ productId: 1 }] },
        { customerEmail: "b@example.com", customerName: "Bia", items: [{ productId: 2 }] },
      ],
    );

    expect(recipients).toEqual([{ email: "a@example.com", name: "Ana" }]);
  });

  it("does not match malformed items or unknown collections", () => {
    expect(collectCollectionRecipients("Inexistente", [{ id: 1, collection: "Raízes" }], [])).toEqual([]);
    expect(
      collectCollectionRecipients(
        "Raízes",
        [{ id: 1, collection: "Raízes" }],
        [
          { customerEmail: "invalid", customerName: null, items: [{ productId: "not-a-number" }] },
          { customerEmail: "  ", customerName: null, items: [{ productId: 1 }] },
          { customerEmail: "buyer@example.com", customerName: null, items: "invalid" },
        ],
      ),
    ).toEqual([]);
  });
});
