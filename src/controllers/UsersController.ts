import { PrismaClient, Users } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { sendResponse } from "../helpers";

const prisma = new PrismaClient();

export const getUsers = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const users = await prisma.users.findMany({
      include: { roles: true, carts: true, orders: true }, // Includes role, carts, and orders of users
    });
    sendResponse(reply, 200, {
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error fetching users",
      error: error,
    });
  }
};

export const createUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { name, email, password, roleId } = request.body as {
    name: string;
    email: string;
    password: string;
    roleId: number;
  };
  try {
    const newUser = await prisma.users.create({
      data: { name, email, password, roleId },
    });
    sendResponse(reply, 201, {
      success: true,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error creating user",
      error: error,
    });
  }
};

export const updateUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };
  const { name, email, password, roleId } = request.body as {
    name: string;
    email: string;
    password: string;
    roleId: number;
  };
  try {
    const validatedUser = await _validateUserId(id, reply);
    if (!validatedUser) return;

    const updatedUser = await prisma.users.update({
      where: { id: validatedUser.userId },
      data: { name, email, password, roleId },
    });
    sendResponse(reply, 200, {
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error updating user",
      error: error,
    });
  }
};

export const deleteUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };
  try {
    const validatedUser = await _validateUserId(id, reply);
    if (!validatedUser) return;

    const deletedUser = await prisma.users.delete({
      where: { id: validatedUser.userId },
    });

    sendResponse(reply, 200, {
      success: true,
      message: "User deleted successfully",
      data: deletedUser,
    });
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error deleting user",
      error: error,
    });
  }
};

const _validateUserId = async (
  id: string,
  reply: FastifyReply
): Promise<{ userId: number; user: Users } | null> => {
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    sendResponse(reply, 400, {
      success: false,
      message: "Invalid User ID format",
    });
    return null;
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { roles: true, carts: true, orders: true },
    });

    if (!user) {
      sendResponse(reply, 404, {
        success: false,
        message: "User not found",
      });
      return null;
    }

    return { userId, user };
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error validating user ID",
      error: error,
    });
    return null;
  }
};
