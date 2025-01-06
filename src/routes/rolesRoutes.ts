import { FastifyInstance } from "fastify";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/RolesController";

async function rolesRoutes(server: FastifyInstance) {
  server.get("/", getRoles);
  server.post("/", createRole);
  server.put("/:id", updateRole);
  server.delete("/:id", deleteRole);
}

export default rolesRoutes;
