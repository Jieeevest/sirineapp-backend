import { FastifyInstance } from "fastify";
import {
  getCurrentUser,
  login,
  register,
  forgotPassword,
  confirmPassword,
} from "../controllers/AuthController";
import { checkSession } from "../middlewares";

async function authRoutes(server: FastifyInstance) {
  server.post("/", login);
  server.get("/", { preHandler: [checkSession] }, getCurrentUser);
  server.post("/register", register);
  server.post("/forgot-password", forgotPassword);
  server.post("/reset-password", confirmPassword);
}

export default authRoutes;
