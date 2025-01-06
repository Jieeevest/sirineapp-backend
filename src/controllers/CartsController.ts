import { Carts, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { sendResponse } from "../helpers";

const prisma = new PrismaClient();

export const getCarts = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const carts = await prisma.carts.findMany({
      include: { user: true, cartItems: { include: { product: true } } },
    });
    sendResponse(reply, 200, {
      success: true,
      message: "Carts fetched successfully",
      data: carts,
    });
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error fetching carts",
      error: error,
    });
  }
};

export const getCartById = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };
  try {
    const validatedCart = await _validateCartId(id, reply);
    if (!validatedCart) return;

    sendResponse(reply, 200, {
      success: true,
      message: "Cart fetched successfully",
      data: validatedCart.cart,
    });
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error fetching cart",
      error: error,
    });
  }
};

export const createCart = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { userId } = request.body as { userId: number };
  try {
    const newCart = await prisma.carts.create({
      data: { userId },
    });
    sendResponse(reply, 201, {
      success: true,
      message: "Cart created successfully",
      data: newCart,
    });
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error creating cart",
      error: error,
    });
  }
};

export const updateCart = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };
  const { status } = request.body as { status: string };
  try {
    const validatedCart = await _validateCartId(id, reply);
    if (!validatedCart) return;

    const updatedCart = await prisma.carts.update({
      where: { id: validatedCart.cartId },
      data: { status },
    });
    sendResponse(reply, 200, {
      success: true,
      message: "Cart updated successfully",
      data: updatedCart,
    });
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error updating cart",
      error: error,
    });
  }
};

export const deleteCart = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };
  try {
    const validatedCart = await _validateCartId(id, reply);
    if (!validatedCart) return;

    const deletedCart = await prisma.carts.delete({
      where: { id: validatedCart.cartId },
    });

    sendResponse(reply, 200, {
      success: true,
      message: "Cart deleted successfully",
      data: deletedCart,
    });
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error deleting cart",
      error: error,
    });
  }
};

const _validateCartId = async (
  id: string,
  reply: FastifyReply
): Promise<{ cartId: number; cart: Carts } | null> => {
  const cartId = parseInt(id, 10);
  if (isNaN(cartId)) {
    sendResponse(reply, 400, {
      success: false,
      message: "Invalid ID format",
    });
    return null;
  }

  try {
    const cart = await prisma.carts.findUnique({
      where: { id: cartId },
      include: { user: true, cartItems: { include: { product: true } } },
    });

    if (!cart) {
      sendResponse(reply, 404, {
        success: false,
        message: "Cart not found",
      });
      return null;
    }

    return { cartId, cart };
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error validating cart ID",
      error: error,
    });
    return null;
  }
};
