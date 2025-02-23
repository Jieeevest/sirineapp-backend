/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { sendResponse } from "../helpers";

const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });

export const getProducts = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const products = await prisma.products.findMany({
      include: { category: true },
    });
    return sendResponse(reply, 200, {
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error fetching products",
      error: error,
    });
  }
};

export const getProductById = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };
  try {
    const validatedProduct = await _validateProductId(id, reply);
    if (!validatedProduct) return;

    return sendResponse(reply, 200, {
      success: true,
      message: "Product fetched successfully",
      data: validatedProduct.product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return sendResponse(reply, 500, {
      success: false,
      message: "Error fetching product",
      error: error,
    });
  }
};

export const createProduct = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { name, description, price, stock, categoryId } = request.body as {
    name: string;
    description?: string;
    price: number;
    stock: number;
    categoryId: number;
  };
  try {
    const newProduct = await prisma.products.create({
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
      },
    });
    return sendResponse(reply, 201, {
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error creating product",
      error: error,
    });
  }
};

export const updateProduct = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };
  const { name, description, price, stock, categoryId } = request.body as {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    categoryId?: number;
  };
  try {
    const validatedProduct = await _validateProductId(id, reply);
    if (!validatedProduct) return;

    const updatedProduct = await prisma.products.update({
      where: { id: validatedProduct.productId },
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
      },
    });
    return sendResponse(reply, 200, {
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error updating product",
      error: error,
    });
  }
};

export const deleteProduct = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };
  try {
    const validatedProduct = await _validateProductId(id, reply);
    if (!validatedProduct) return;

    const deletedProduct = await prisma.products.delete({
      where: { id: validatedProduct.productId },
    });

    return sendResponse(reply, 200, {
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error deleting product",
      error: error,
    });
  }
};

const _validateProductId = async (
  id: string,
  reply: FastifyReply
): Promise<{ productId: number; product: any } | null> => {
  const productId = parseInt(id, 10);
  if (isNaN(productId)) {
    sendResponse(reply, 400, {
      success: false,
      message: "Invalid ID format",
    });
    return null;
  }

  try {
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      sendResponse(reply, 404, {
        success: false,
        message: "Product not found",
      });
      return null;
    }

    return { productId, product };
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error validating product ID",
      error: error,
    });
    return null;
  }
};
