import { FastifyInstance } from "fastify";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/UsersController";
import { checkSession } from "../middlewares";

async function usersRoutes(server: FastifyInstance) {
  server.get("/", { preHandler: [checkSession] }, getUsers);
  server.get("/:id", { preHandler: [checkSession] }, getUserById);
  server.post("/", { preHandler: [checkSession] }, createUser);
  server.put("/:id", { preHandler: [checkSession] }, updateUser);
  server.delete("/:id", { preHandler: [checkSession] }, deleteUser);
}

export default usersRoutes;
