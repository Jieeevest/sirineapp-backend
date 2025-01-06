import { FastifyInstance } from "fastify";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/UsersController";

async function usersRoutes(server: FastifyInstance) {
  server.get("/", getUsers);
  server.post("/", createUser);
  server.put("/:id", updateUser);
  server.delete("/:id", deleteUser);
}

export default usersRoutes;
