import { Orders, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { sendResponse } from "../helpers";

const prisma = new PrismaClient();

export const getOrders = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const orders = await prisma.orders.findMany({
      include: { user: true, cart: true }, // Includes user who placed the order
    });
    return sendResponse(reply, 200, {
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error fetching orders",
      error: error,
    });
  }
};

export const getOrderById = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };

  try {
    const validatedOrder = await _validateOrderId(id, reply);
    if (!validatedOrder) return;

    return sendResponse(reply, 200, {
      success: true,
      message: "Order fetched successfully",
      data: {
        order: validatedOrder.order,
        orderItems: validatedOrder.orderItems,
      },
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error fetching order",
      error: error,
    });
  }
};

export const createOrder = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { userEmail, cart } = request.body as {
    userEmail: string;
    cart: { productId: number; quantity: number; price: number }[];
  };

  try {
    const user = await prisma.users.findFirst({ where: { email: userEmail } });

    if (!user) {
      return sendResponse(reply, 404, {
        success: false,
        message: "User not found",
      });
    }
    const cartData = await prisma.carts.create({
      data: { userId: user.id, status: "active" },
    });

    await prisma.cartItems.createMany({
      data: cart.map((item) => ({
        cartId: cartData.id,
        productId: item.productId,
        quantity: item.quantity,
      })),
      skipDuplicates: true,
    });

    const cartWithItems = await prisma.carts.findUnique({
      where: { id: cartData.id },
      include: { cartItems: { include: { product: true } } },
    });

    if (!cartWithItems || cartWithItems.cartItems.length === 0) {
      return sendResponse(reply, 400, {
        success: false,
        message: "Cart is empty or not found",
      });
    }

    const totalAmount = cartWithItems.cartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    const newOrder = await prisma.orders.create({
      data: { userId: user.id, totalAmount, status: "pending" },
    });

    await prisma.carts.update({
      where: { id: cartData.id },
      data: { status: "checked_out" },
    });

    return sendResponse(reply, 201, {
      success: true,
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error creating order",
      error: error,
    });
  }
};

export const updateOrder = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };
  const { status } = request.body as { status: string };
  try {
    const validatedOrder = await _validateOrderId(id, reply);
    if (!validatedOrder) return;

    const updatedOrder = await prisma.orders.update({
      where: { id: validatedOrder.orderId },
      data: { status },
    });
    return sendResponse(reply, 200, {
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error updating order",
      error: error,
    });
  }
};

export const deleteOrder = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };
  try {
    const validatedOrder = await _validateOrderId(id, reply);
    if (!validatedOrder) return;

    const deletedOrder = await prisma.orders.delete({
      where: { id: validatedOrder.orderId },
    });

    return sendResponse(reply, 200, {
      success: true,
      message: "Order deleted successfully",
      data: deletedOrder,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error deleting order",
      error: error,
    });
  }
};

const _validateOrderId = async (
  id: string,
  reply: FastifyReply
): Promise<{ orderId: number; order: Orders; orderItems: any } | null> => {
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    sendResponse(reply, 400, {
      success: false,
      message: "Invalid Order ID format",
    });
    return null;
  }

  try {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: { user: true, cart: true },
    });

    const orderItems = await prisma.cartItems.findMany({
      where: { cartId: Number(order?.cartId) },
      include: { product: true },
    });

    if (!order) {
      sendResponse(reply, 404, {
        success: false,
        message: "Order not found",
      });
      return null;
    }

    return { orderId, order, orderItems };
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error validating order ID",
      error: error,
    });
    return null;
  }
};
