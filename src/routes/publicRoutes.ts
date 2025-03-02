import { FastifyInstance } from "fastify";
import { getCatalogs } from "../controllers/ProductController";
import { getPublicCategories } from "../controllers/CategoriesController";

async function publicRoutes(server: FastifyInstance) {
  server.get("/products", getCatalogs);
  server.get("/categories", getPublicCategories);
}

export default publicRoutes;
