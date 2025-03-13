import { PrismaClient, Roles } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { sendResponse } from "../helpers";

const prisma = new PrismaClient();

export const getRoles = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const roles = await prisma.roles.findMany();
    return sendResponse(reply, 200, {
      success: true,
      message: "Roles fetched successfully",
      data: roles,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error fetching roles",
      error: error,
    });
  }
};

export const getRoleById = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };

  try {
    const validatedRole = await _validateRoleId(id, reply);
    if (!validatedRole) return;

    return sendResponse(reply, 200, {
      success: true,
      message: "Role fetched successfully",
      data: validatedRole.role,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error fetching role",
      error: error,
    });
  }
};

export const createRole = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { name, description } = request.body as {
    name: string;
    description: string;
  };
  try {
    const newRole = await prisma.roles.create({
      data: { name, description },
    });
    return sendResponse(reply, 201, {
      success: true,
      message: "Role created successfully",
      data: newRole,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error creating role",
      error: error,
    });
  }
};

export const updateRole = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };
  const { name, description } = request.body as {
    name: string;
    description: string;
  };
  try {
    const validatedRole = await _validateRoleId(id, reply);
    if (!validatedRole) return;

    const updatedRole = await prisma.roles.update({
      where: { id: validatedRole.roleId },
      data: { name, description },
    });
    return sendResponse(reply, 200, {
      success: true,
      message: "Role updated successfully",
      data: updatedRole,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error updating role",
      error: error,
    });
  }
};

export const deleteRole = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };
  try {
    const validatedRole = await _validateRoleId(id, reply);
    if (!validatedRole) return;

    const deletedRole = await prisma.roles.delete({
      where: { id: validatedRole.roleId },
    });

    return sendResponse(reply, 200, {
      success: true,
      message: "Role deleted successfully",
      data: deletedRole,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error deleting role",
      error: error,
    });
  }
};

const _validateRoleId = async (
  id: string,
  reply: FastifyReply
): Promise<{ roleId: number; role: Roles } | null> => {
  const roleId = parseInt(id, 10);
  if (isNaN(roleId)) {
    sendResponse(reply, 400, {
      success: false,
      message: "Invalid Role ID format",
    });
    return null;
  }

  try {
    const role = await prisma.roles.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      sendResponse(reply, 404, {
        success: false,
        message: "Role not found",
      });
      return null;
    }

    return { roleId, role };
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error validating role ID",
      error: error,
    });
    return null;
  }
};
