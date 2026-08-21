import { describe, expect, it } from "vitest";
import { notifications, orders, shipments } from "../drizzle/schema";
import { deleteOrderData, deleteOrderDataFromDb, getOrderDeletionReferences } from "./db";

describe("order deletion cleanup references", () => {
  it("maps the internal numeric order id to notification cleanup", () => {
    expect(getOrderDeletionReferences(150001)).toEqual({
      orderId: 150001,
      notificationOrderId: 150001,
    });
    expect(notifications.orderId.dataType).toBe("number");
  });

  it("executes related cleanup before deleting the order record", async () => {
    const deletedTables: unknown[] = [];
    const pendingOrder = {
      id: 150001,
      orderNumber: "ER-2026-6399",
      paymentStatus: "pending",
      fulfillmentStatus: "pending_packaging",
      items: [],
    };
    const fakeDb = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => [pendingOrder],
          }),
        }),
      }),
      delete: (table: unknown) => {
        deletedTables.push(table);
        return {
          where: async () => undefined,
        };
      },
    };

    const deleted = await deleteOrderDataFromDb(fakeDb, pendingOrder.id);

    expect(deleted?.orderNumber).toBe(pendingOrder.orderNumber);
    expect(deletedTables).toEqual([notifications, orders]);
  });

  it("executes the public deleteOrderData entrypoint and removes existing notification references", async () => {
    const pendingOrder = {
      id: 150001,
      orderNumber: "ER-2026-6399",
      paymentStatus: "pending",
      fulfillmentStatus: "pending_packaging",
      items: [],
    };
    let orderRecords = [pendingOrder];
    let notificationRecords = [{ id: 7, orderId: pendingOrder.id, type: "new_order" }];
    const deletedTables: unknown[] = [];
    const fakeDb = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => orderRecords,
          }),
        }),
      }),
      delete: (table: unknown) => ({
        where: async () => {
          deletedTables.push(table);
          if (table === notifications) notificationRecords = [];
          if (table === orders) orderRecords = [];
        },
      }),
    };

    const deleted = await deleteOrderData(pendingOrder.id, fakeDb);

    expect(deleted?.orderNumber).toBe(pendingOrder.orderNumber);
    expect(notificationRecords).toEqual([]);
    expect(orderRecords).toEqual([]);
    expect(deletedTables).toEqual([notifications, orders]);
  });

  it("does not assume a shipment relation that the schema does not define", () => {
    expect("orderId" in shipments).toBe(false);
  });
});
