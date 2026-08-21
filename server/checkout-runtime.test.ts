import { beforeEach, describe, expect, it, vi } from "vitest";

const generateNextOrderNumber = vi.fn();
const validateCoupon = vi.fn();
const createOrder = vi.fn();
const createNotification = vi.fn();
const getCommercialConfig = vi.fn();
const createMercadoPagoPayment = vi.fn();
const calculateMelhorEnvioShipping = vi.fn();
const sendResendEmail = vi.fn();
let variationExists = true;

const product = {
  id: 101,
  name: "Camisa Oficial",
  status: "active",
  price: "100.00",
  promotionalPrice: null,
};

const variation = { productId: 101, size: "M", stock: 10 };

const fakeDb = {
  select: () => ({
    from: () => ({
      where: () => ({
        limit: async () => {
          if (fakeDbSelectCount++ === 0) return [product];
          return variationExists ? [variation] : [];
        },
      }),
    }),
  }),
  update: () => ({
    set: () => ({
      where: async () => undefined,
    }),
  }),
};
let fakeDbSelectCount = 0;

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return {
    ...actual,
    getDb: vi.fn().mockResolvedValue(fakeDb),
    generateNextOrderNumber,
    validateCoupon,
    createOrder,
    createNotification,
    getCommercialConfig,
  };
});

vi.mock("./mercadopago", async () => {
  const actual = await vi.importActual<typeof import("./mercadopago")>("./mercadopago");
  return { ...actual, createMercadoPagoPayment };
});

vi.mock("./melhor-envio", async () => {
  const actual = await vi.importActual<typeof import("./melhor-envio")>("./melhor-envio");
  return { ...actual, calculateMelhorEnvioShipping };
});

vi.mock("./resend", async () => {
  const actual = await vi.importActual<typeof import("./resend")>("./resend");
  return { ...actual, sendResendEmail };
});

const { appRouter } = await import("./routers");

const publicContext = {
  req: {} as any,
  res: {} as any,
  user: undefined,
};

const baseInput = {
  customerName: "Cliente Real",
  customerEmail: "cliente@example.com",
  customerCpf: "12345678909",
  phone: "81999999999",
  address: {
    cep: "53110380",
    street: "Rua Herculano Bandeira",
    number: "74",
    neighborhood: "Sítio Novo",
    city: "Olinda",
    state: "PE",
  },
  items: [{ productId: 101, name: "Produto adulterado", size: "M", quantity: 1, price: 1 }],
  subtotal: 1,
  shippingMethod: "PAC",
  couponCode: "WELCOME",
  shippingOptionId: "pac-1",
  paymentMethod: "pix" as const,
  clientTotal: 105,
};

describe("checkout.create em runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    variationExists = true;
    fakeDbSelectCount = 0;
    generateNextOrderNumber.mockResolvedValue("ER-2026-0999");
    validateCoupon.mockResolvedValue({ valid: true, discount: 10 });
    getCommercialConfig.mockResolvedValue({
      freeShippingThreshold: 1000,
      pixDiscountPercent: 5,
      maxInstallments: 12,
      installmentInterestRate: 0,
    });
    calculateMelhorEnvioShipping.mockResolvedValue([{ id: "pac-1", name: "PAC", price: 20 }]);
    createMercadoPagoPayment.mockResolvedValue({
      id: "payment-1",
      status: "pending",
      status_detail: "pending_waiting_transfer",
      point_of_interaction: { transaction_data: { qr_code: "pix-code" } },
    });
    createOrder.mockResolvedValue({ id: 77, orderNumber: "ER-2026-0999" });
    createNotification.mockResolvedValue(undefined);
    sendResendEmail.mockResolvedValue(undefined);
  });

  it("rejeita clientTotal adulterado antes de chamar o Mercado Pago", async () => {
    const caller = appRouter.createCaller(publicContext);

    await expect(caller.checkout.create({ ...baseInput, clientTotal: 1 })).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: expect.stringContaining("Total inconsistente"),
    });

    expect(createMercadoPagoPayment).not.toHaveBeenCalled();
    expect(createOrder).not.toHaveBeenCalled();
  });

  it("rejeita variação inexistente antes de chamar o Mercado Pago", async () => {
    variationExists = false;
    const caller = appRouter.createCaller(publicContext);

    await expect(caller.checkout.create({ ...baseInput })).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: expect.stringContaining("Variação indisponível"),
    });

    expect(createMercadoPagoPayment).not.toHaveBeenCalled();
    expect(createOrder).not.toHaveBeenCalled();
  });

  it("ignora preço, nome, subtotal e orderNumber do cliente e persiste o cálculo oficial", async () => {
    const caller = appRouter.createCaller(publicContext);
    const response = await caller.checkout.create({ ...baseInput, orderNumber: "ER-2026-0001" } as any);

    expect(response.orderNumber).toBe("ER-2026-0999");
    expect(generateNextOrderNumber).toHaveBeenCalledTimes(1);
    expect(calculateMelhorEnvioShipping).toHaveBeenCalledTimes(1);
    expect(createMercadoPagoPayment).toHaveBeenCalledWith(expect.objectContaining({
      transaction_amount: 105,
      external_reference: "ER-2026-0999",
    }));
    expect(createOrder).toHaveBeenCalledWith(expect.objectContaining({
      orderNumber: "ER-2026-0999",
      items: [expect.objectContaining({ name: "Camisa Oficial", price: 100 })],
      subtotal: "100.00",
      shippingCost: "20.00",
      discount: "10.00",
      total: "105.00",
    }), "ER-2026-0999");
  });
});
