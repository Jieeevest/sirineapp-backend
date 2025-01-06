import { FastifyInstance } from "fastify";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/ProductController";

async function productRoutes(server: FastifyInstance) {
  server.get("/", getProducts);
  server.get("/:id", getProductById);
  server.post("/", createProduct);
  server.put("/:id", updateProduct);
  server.delete("/:id", deleteProduct);
}

export default productRoutes;
