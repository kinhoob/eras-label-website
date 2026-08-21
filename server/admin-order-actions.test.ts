import { describe, expect, it, vi } from "vitest";

const mockedOrder = {
  id: 42,
  orderNumber: "ER-2026-0042",
  customerName: "Cliente de teste controlado",
  customerEmail: "qa-order-actions@example.com",
  paymentStatus: "pending",
  fulfillmentStatus: "packed",
  status: "Embalado",
};

const updateOrderFulfillmentStatus = vi.fn();
const deleteOrderData = vi.fn();

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return {
    ...actual,
    updateOrderFulfillmentStatus,
    deleteOrderData,
  };
});

const { appRouter } = await import("./routers");

const adminContext = {
  req: {} as any,
  res: {} as any,
  user: {
    id: 1,
    openId: "qa-admin-order-actions",
    name: "QA Admin",
    email: "qa-admin@example.com",
    role: "admin",
    loginMethod: "test",
    lastSignedIn: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

describe("mutations administrativas de pedidos", () => {
  it("atualiza fulfillment e devolve o pedido em JSON pelo contrato tRPC", async () => {
    updateOrderFulfillmentStatus.mockResolvedValueOnce(mockedOrder);
    const caller = appRouter.createCaller(adminContext);

    const response = await caller.admin.updateFulfillmentStatus({
      orderId: mockedOrder.id,
      status: "packed",
    });

    expect(response).toEqual({ success: true, order: mockedOrder });
    expect(updateOrderFulfillmentStatus).toHaveBeenCalledWith(mockedOrder.id, "packed");
  });

  it("exclui definitivamente um pedido pendente sem consultar ou condicionar ao pagamento", async () => {
    deleteOrderData.mockResolvedValueOnce(mockedOrder);
    const caller = appRouter.createCaller(adminContext);

    const response = await caller.admin.deleteOrder({ orderId: mockedOrder.id });

    expect(response).toEqual({ success: true, order: mockedOrder });
    expect(deleteOrderData).toHaveBeenCalledWith(mockedOrder.id);
  });

  it("devolve NOT_FOUND quando a exclusão não encontra o pedido", async () => {
    deleteOrderData.mockResolvedValueOnce(undefined);
    const caller = appRouter.createCaller(adminContext);

    await expect(caller.admin.deleteOrder({ orderId: mockedOrder.id })).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Pedido não encontrado.",
    });
  });
});
