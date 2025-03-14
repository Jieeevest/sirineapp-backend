import { PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { sendResponse } from "../helpers";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 10;

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

export const register = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { name, email, password, phoneNumber } = request.body as {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
  };

  try {
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return sendResponse(reply, 400, {
        success: false,
        message: "Email already in use",
      });
    }

    // const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await prisma.users.create({
      data: { name, email, password, phoneNumber, roleId: 3 },
    });

    return sendResponse(reply, 201, {
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return sendResponse(reply, 500, {
      success: false,
      message: "Error during registration",
      error,
    });
  }
};

export const forgotPassword = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { email } = request.body as { email: string };

  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return sendResponse(reply, 404, {
        success: false,
        message: "User not found",
      });
    }

    const resetToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    // TODO: Send resetToken via email

    return sendResponse(reply, 200, {
      success: true,
      message: "Password reset token generated",
      data: { resetToken },
    });
  } catch (error) {
    console.error("Error during password reset request:", error);
    return sendResponse(reply, 500, {
      success: false,
      message: "Error during password reset request",
      error,
    });
  }
};

export const confirmPassword = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { token, newPassword } = request.body as {
    token: string;
    newPassword: string;
  };

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
    };
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.users.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    return sendResponse(reply, 200, {
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error confirming password:", error);
    return sendResponse(reply, 400, {
      success: false,
      message: "Invalid or expired token",
      error,
    });
  }
};
