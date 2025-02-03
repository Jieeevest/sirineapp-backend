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
      include: { user: true }, // Includes user who placed the order
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
      data: validatedOrder.order,
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
  const { userId, totalAmount, status } = request.body as {
    userId: number;
    totalAmount: number;
    status: string;
  };
  try {
    const newOrder = await prisma.orders.create({
      data: { userId, totalAmount, status },
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
): Promise<{ orderId: number; order: Orders } | null> => {
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
      include: { user: true },
    });

    if (!order) {
      sendResponse(reply, 404, {
        success: false,
        message: "Order not found",
      });
      return null;
    }

    return { orderId, order };
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error validating order ID",
      error: error,
    });
    return null;
  }
};
