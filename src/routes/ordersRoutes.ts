import { FastifyInstance } from "fastify";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  reviewOrder,
  sendReceiptOrder,
  deliveredOrder,
} from "../controllers/OrdersController";
import { checkSession } from "../middlewares";

async function ordersRoutes(server: FastifyInstance) {
  server.get("/", { preHandler: [checkSession] }, getOrders);
  server.get("/:id", { preHandler: [checkSession] }, getOrderById);
  server.post("/", { preHandler: [checkSession] }, createOrder);
  server.put("/:id", { preHandler: [checkSession] }, updateOrder);
  server.delete("/:id", { preHandler: [checkSession] }, deleteOrder);
  server.put("/:id/review", { preHandler: [checkSession] }, reviewOrder);
  server.put("/:id/delivered", { preHandler: [checkSession] }, deliveredOrder);
  server.post(
    "/:id/send-receipt",
    { preHandler: [checkSession] },
    sendReceiptOrder
  );
}

export default ordersRoutes;
