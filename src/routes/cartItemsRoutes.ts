import { FastifyInstance } from "fastify";
import {
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
} from "../controllers/CartItems";

async function cartItemsRoutes(server: FastifyInstance) {
  server.post("/", addItemToCart);
  server.put("/:id", updateCartItem);
  server.delete("/:id", removeItemFromCart);
}

export default cartItemsRoutes;
