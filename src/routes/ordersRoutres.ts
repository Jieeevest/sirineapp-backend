import { FastifyInstance } from "fastify";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../controllers/OrdersController";
import { checkSession } from "../middlewares/checkSession";

async function ordersRoutes(server: FastifyInstance) {
  server.get("/", { preHandler: [checkSession] }, getOrders);
  server.get("/:id", { preHandler: [checkSession] }, getOrderById);
  server.post("/", { preHandler: [checkSession] }, createOrder);
  server.put("/:id", { preHandler: [checkSession] }, updateOrder);
  server.delete("/:id", { preHandler: [checkSession] }, deleteOrder);
}

export default ordersRoutes;
