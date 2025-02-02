import { PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { sendResponse } from "../helpers"; // Ensure this is properly defined

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Ensure you use an env variable for security

/**
 * Login function - Direct password comparison
 */
export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  const { client_url, email, password } = request.body as {
    client_url: string;
    email: string;
    password: string;
  };

  try {
    // Find user by email
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

    // Check if user exists and password matches directly
    if (!user || user.password !== password) {
      return sendResponse(reply, 401, {
        success: false,
        message: "Invalid email or password",
      });
    }

    // If password matches, generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "365d",
    });

    // Send response with the token and user info
    sendResponse(reply, 200, {
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
    sendResponse(reply, 500, {
      success: false,
      message: "Error during login",
      error,
    });
  }
};

/**
 * Get Current User function - Retrieves the current user based on the JWT token
 */
export const getCurrentUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const authHeader = request.headers.authorization;

  // Check if authorization header is present and starts with "Bearer"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendResponse(reply, 401, {
      success: false,
      message: "Authorization header is missing or invalid",
    });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(" ")[1];

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
    };

    // Retrieve user information based on the decoded ID
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

    // Check if the user was found
    if (!user) {
      return sendResponse(reply, 404, {
        success: false,
        message: "User not found",
      });
    }

    // Send the response with user data
    sendResponse(reply, 200, {
      success: true,
      message: "Current user retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    sendResponse(reply, 401, {
      success: false,
      message: "You are not authenticated",
      error,
    });
  }
};
