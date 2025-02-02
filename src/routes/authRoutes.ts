import { FastifyInstance } from "fastify";
import { getCurrentUser, login } from "../controllers/AuthController";
import { checkSession } from "../middlewares/checkSession";

async function authRoutes(server: FastifyInstance) {
  server.post("/", login);
  server.get("/", { preHandler: [checkSession] }, getCurrentUser);
}

export default authRoutes;
