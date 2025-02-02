import { FastifyInstance } from "fastify";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
} from "../controllers/CategoriesController";
import { checkSession } from "../middlewares/checkSession";

async function categoriesRoutes(server: FastifyInstance) {
  server.get("/", { preHandler: [checkSession] }, getCategories);
  server.get("/:id", { preHandler: [checkSession] }, getCategoryById);
  server.post("/", { preHandler: [checkSession] }, createCategory);
  server.put("/:id", { preHandler: [checkSession] }, updateCategory);
  server.delete("/:id", { preHandler: [checkSession] }, deleteCategory);
}

export default categoriesRoutes;
