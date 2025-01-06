import { FastifyInstance } from "fastify";
import {
  getCarts,
  getCartById,
  createCart,
  updateCart,
  deleteCart,
} from "../controllers/CartsController";

async function cartsRoutes(server: FastifyInstance) {
  server.get("/", getCarts);
  server.get("/:id", getCartById);
  server.post("/", createCart);
  server.put("/:id", updateCart);
  server.delete("/:id", deleteCart);
}

export default cartsRoutes;
