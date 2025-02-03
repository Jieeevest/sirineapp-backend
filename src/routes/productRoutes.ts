import { FastifyInstance } from "fastify";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/ProductController";
import { checkSession } from "../middlewares";

async function productRoutes(server: FastifyInstance) {
  server.get("/", { preHandler: [checkSession] }, getProducts);
  server.get("/:id", { preHandler: [checkSession] }, getProductById);
  server.post("/", { preHandler: [checkSession] }, createProduct);
  server.put("/:id", { preHandler: [checkSession] }, updateProduct);
  server.delete("/:id", { preHandler: [checkSession] }, deleteProduct);
}

export default productRoutes;
