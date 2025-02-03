import { FastifyInstance } from "fastify";
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/RolesController";
import { checkSession } from "../middlewares";

async function rolesRoutes(server: FastifyInstance) {
  server.get("/", { preHandler: [checkSession] }, getRoles);
  server.get("/:id", { preHandler: [checkSession] }, getRoleById);
  server.post("/", { preHandler: [checkSession] }, createRole);
  server.put("/:id", { preHandler: [checkSession] }, updateRole);
  server.delete("/:id", { preHandler: [checkSession] }, deleteRole);
}

export default rolesRoutes;
