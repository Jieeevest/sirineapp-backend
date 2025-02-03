import { PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { sendResponse } from "../helpers";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  const { client_url, email, password } = request.body as {
    client_url: string;
    email: string;
    password: string;
  };

  try {
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        roleId: true,
        roles: true,
      },
    });

    if (!user || user.password !== password) {
      return sendResponse(reply, 401, {
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "365d",
    });

    return sendResponse(reply, 200, {
      success: true,
      message: "Login successful",
      data: {
        token,
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.roles,
        client_url,
        authorized_url: `http://${client_url}/${token}`,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return sendResponse(reply, 500, {
      success: false,
      message: "Error during login",
      error,
    });
  }
};

export const getCurrentUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendResponse(reply, 401, {
      success: false,
      message: "Authorization header is missing or invalid",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
    };

    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return sendResponse(reply, 404, {
        success: false,
        message: "User not found",
      });
    }

    return sendResponse(reply, 200, {
      success: true,
      message: "Current user retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return sendResponse(reply, 401, {
      success: false,
      message: "You are not authenticated",
      error,
    });
  }
};
