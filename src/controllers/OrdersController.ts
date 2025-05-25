/* eslint-disable @typescript-eslint/no-explicit-any */
import { Orders, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { sendResponse } from "../helpers";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const getOrders = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return sendResponse(reply, 401, {
      success: false,
      message: "Authorization header is missing",
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        roles: true,
      },
    });
    if (!user) {
      return sendResponse(reply, 404, {
        success: false,
        message: "User not found",
      });
    }

    let whereClause: any = null;

    if (user.roleId !== 1) {
      whereClause = {
        userId: user.id,
      };
    }
    let options: any = {
      include: { user: true, cart: true },
    };
    if (whereClause) {
      options.where = whereClause;
    }
    const orders = await prisma.orders.findMany(options);
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
      data: {
        userId: user.id,
        cartId: cartData.id,
        totalAmount,
        status: "pending",
      },
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

  try {
    const parts = request.parts(); // Ambil semua data dari FormData
    let address: any = "";
    let status: any = "";
    let evidenceBuffer: Buffer | null = null;

    for await (const part of parts) {
      if (part.type === "file") {
        // Jika part adalah file, simpan sebagai buffer
        const chunks: Buffer[] = [];
        for await (const chunk of part.file) {
          chunks.push(chunk);
        }
        evidenceBuffer = Buffer.concat(chunks);
      } else {
        // Jika part adalah field (bukan file)
        if (part.fieldname === "address") address = part.value;
        if (part.fieldname === "status") status = part.value;
      }
    }

    if (!address || !status) {
      return reply.status(400).send({
        success: false,
        message: "Address and status are required",
      });
    }

    // Update order di database
    const updatedOrder = await prisma.orders.update({
      where: { id: Number(id) },
      data: {
        address,
        status,
        evidence: evidenceBuffer, // Simpan sebagai BLOB/Binary di DB
      },
    });

    if (status === "paid") {
      const products = await prisma.cartItems.findMany({
        where: { cartId: Number(updatedOrder.cartId) },
        include: { product: true },
      });

      products.forEach(async (product) => {
        await prisma.products.update({
          where: { id: product.productId },
          data: { stock: product.product.stock - product.quantity },
        });
      });
    }

    return reply.send({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Error updating order",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const reviewOrder = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };
  const { rating, comments } = request.body as {
    rating: number;
    comments: string;
  };

  try {
    const validatedOrder = await _validateOrderId(id, reply);
    if (!validatedOrder) return;

    const updatedOrder = await prisma.orders.update({
      where: { id: validatedOrder.orderId },
      data: { rating, comments, isReviewed: true },
    });
    return sendResponse(reply, 200, {
      success: true,
      message: "Order reviewed successfully",
      data: updatedOrder,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error reviewing order",
      error: error,
    });
  }
};

export const sendReceiptOrder = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };

  try {
    const parts = request.parts(); // Ambil semua data dari FormData
    let receiptBuffer: Buffer | null = null;

    for await (const part of parts) {
      if (part.type === "file" && part.fieldname === "receipt") {
        // Jika part adalah file dan nama field-nya 'receipt'
        const chunks: Buffer[] = [];
        for await (const chunk of part.file) {
          chunks.push(chunk);
        }
        receiptBuffer = Buffer.concat(chunks);
      }
    }

    if (!receiptBuffer) {
      return reply.status(400).send({
        success: false,
        message: "No receipt file uploaded",
      });
    }

    // Update order di database
    const updatedOrder = await prisma.orders.update({
      where: { id: Number(id) },
      data: {
        receipt: receiptBuffer, // Simpan sebagai BLOB/Binary di DB
      },
    });

    return reply.send({
      success: true,
      message: "Send receipt successfully",
      data: updatedOrder,
    });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Error sending receipt",
      error: error instanceof Error ? error.message : error,
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
