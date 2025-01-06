import { CartItems, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { sendResponse } from "../helpers";

const prisma = new PrismaClient();
export const addItemToCart = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { cartId, productId, quantity } = request.body as {
    cartId: number;
    productId: number;
    quantity: number;
  };
  try {
    const newItem = await prisma.cartItems.create({
      data: { cartId, productId, quantity },
    });
    sendResponse(reply, 201, {
      success: true,
      message: "Item added to cart successfully",
      data: newItem,
    });
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error adding item to cart",
      error: error,
    });
  }
};

export const updateCartItem = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };
  const { quantity } = request.body as { quantity: number };
  try {
    const validatedItem = await _validateCartItemId(id, reply);
    if (!validatedItem) return;

    const updatedItem = await prisma.cartItems.update({
      where: { id: validatedItem.cartItemId },
      data: { quantity },
    });
    sendResponse(reply, 200, {
      success: true,
      message: "Cart item updated successfully",
      data: updatedItem,
    });
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error updating cart item",
      error: error,
    });
  }
};

export const removeItemFromCart = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };
  try {
    const validatedItem = await _validateCartItemId(id, reply);
    if (!validatedItem) return;

    const removedItem = await prisma.cartItems.delete({
      where: { id: validatedItem.cartItemId },
    });

    sendResponse(reply, 200, {
      success: true,
      message: "Cart item removed successfully",
      data: removedItem,
    });
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error removing cart item",
      error: error,
    });
  }
};

const _validateCartItemId = async (
  id: string,
  reply: FastifyReply
): Promise<{ cartItemId: number; cartItem: CartItems } | null> => {
  const cartItemId = parseInt(id, 10);
  if (isNaN(cartItemId)) {
    sendResponse(reply, 400, {
      success: false,
      message: "Invalid Item ID format",
    });
    return null;
  }

  try {
    const cartItem = await prisma.cartItems.findUnique({
      where: { id: cartItemId },
      include: { cart: true, product: true },
    });

    if (!cartItem) {
      sendResponse(reply, 404, {
        success: false,
        message: "Cart item not found",
      });
      return null;
    }

    return { cartItemId, cartItem };
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error validating cart item ID",
      error: error,
    });
    return null;
  }
};
