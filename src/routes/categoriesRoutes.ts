import { FastifyInstance } from "fastify";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/CategoriesController";

async function categoriesRoutes(server: FastifyInstance) {
  server.get("/", getCategories);
  server.post("/", createCategory);
  server.put("/:id", updateCategory);
  server.delete("/:id", deleteCategory);
}

export default categoriesRoutes;
