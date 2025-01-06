import { FastifyInstance } from "fastify";
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../controllers/OrdersController";

async function ordersRoutes(server: FastifyInstance) {
  server.get("/", getOrders);
  server.post("/", createOrder);
  server.put("/:id", updateOrder);
  server.delete("/:id", deleteOrder);
}

export default ordersRoutes;
