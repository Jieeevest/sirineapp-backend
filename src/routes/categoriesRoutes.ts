import { FastifyInstance } from "fastify";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
} from "../controllers/CategoriesController";

async function categoriesRoutes(server: FastifyInstance) {
  server.get("/", getCategories);
  server.get("/:id", getCategoryById);
  server.post("/", createCategory);
  server.put("/:id", updateCategory);
  server.delete("/:id", deleteCategory);
}

export default categoriesRoutes;
