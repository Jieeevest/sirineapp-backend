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

export const getCatalogs = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const products = await prisma.products.findMany({
      where: { isPublic: true },
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
  try {
    const parts = request.parts(); // Ambil semua data dari FormData
    let name: any = "";
    let description: any = "";
    let price: any = null;
    let stock: any = null;
    let categoryId: any = null;
    let isPublic: boolean = false;
    let imageBuffer: Buffer | null = null;

    // Loop untuk mengambil field dan file dari FormData
    for await (const part of parts) {
      if (part.type === "file") {
        const chunks: Buffer[] = [];
        for await (const chunk of part.file) {
          chunks.push(chunk);
        }
        imageBuffer = Buffer.concat(chunks);
      } else if (part.type === "field") {
        switch (part.fieldname) {
          case "name":
            name = part.value as string;
            break;
          case "description":
            description = part.value as string;
            break;
          case "price":
            price = parseFloat(part.value as string);
            break;
          case "stock":
            stock = parseInt(part.value as string, 10);
            break;
          case "categoryId":
            categoryId = parseInt(part.value as string, 10);
            break;
          case "isPublic":
            isPublic = (part.value as string) === "true";
            break;
        }
      }
    }

    // Validasi input yang diperlukan
    if (!name || price === null || stock === null || categoryId === null) {
      return sendResponse(reply, 400, {
        success: false,
        message: "Missing required fields (name, price, stock, categoryId)",
      });
    }

    // Pastikan harga, stok, dan categoryId adalah angka valid
    if (isNaN(price) || isNaN(stock) || isNaN(categoryId)) {
      return sendResponse(reply, 400, {
        success: false,
        message: "Invalid numeric values for price, stock, or categoryId",
      });
    }

    // Pastikan ada gambar sebelum melanjutkan
    if (!imageBuffer) {
      return sendResponse(reply, 400, {
        success: false,
        message: "Image file is required",
      });
    }

    // Simpan ke database
    const newProduct = await prisma.products.create({
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
        isPublic,
        image: imageBuffer,
      },
    });

    return sendResponse(reply, 201, {
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return sendResponse(reply, 500, {
      success: false,
      message: "Error creating product",
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const updateProduct = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params as { id: string };

    // Validasi apakah produk dengan ID tersebut ada
    const validatedProduct = await _validateProductId(id, reply);
    if (!validatedProduct) return;

    const parts = request.parts(); // Ambil semua data dari FormData
    let updateData: Partial<{
      name: string;
      description: string;
      price: number;
      stock: number;
      categoryId: number;
      isPublic: boolean;
      image: Buffer;
    }> = {};

    // Loop untuk mengambil field dan file dari FormData
    for await (const part of parts) {
      if (part.type === "file") {
        const chunks: Buffer[] = [];
        for await (const chunk of part.file) {
          chunks.push(chunk);
        }
        updateData.image = Buffer.concat(chunks);
      } else if (part.type === "field") {
        switch (part.fieldname) {
          case "name":
            updateData.name = part.value as string;
            break;
          case "description":
            updateData.description = part.value as string;
            break;
          case "price":
            updateData.price = parseFloat(part.value as string);
            break;
          case "stock":
            updateData.stock = parseInt(part.value as string, 10);
            break;
          case "categoryId":
            updateData.categoryId = parseInt(part.value as string, 10);
            break;
          case "isPublic":
            updateData.isPublic = (part.value as string) === "true";
            break;
        }
      }
    }

    // Pastikan harga, stok, dan categoryId adalah angka valid jika diberikan
    if (
      (updateData.price !== undefined && isNaN(updateData.price)) ||
      (updateData.stock !== undefined && isNaN(updateData.stock)) ||
      (updateData.categoryId !== undefined && isNaN(updateData.categoryId))
    ) {
      return sendResponse(reply, 400, {
        success: false,
        message: "Invalid numeric values for price, stock, or categoryId",
      });
    }

    // Update hanya jika ada perubahan data
    if (Object.keys(updateData).length === 0) {
      return sendResponse(reply, 400, {
        success: false,
        message: "No valid fields provided for update",
      });
    }

    // Update produk di database
    const updatedProduct = await prisma.products.update({
      where: { id: validatedProduct.productId },
      data: updateData,
    });

    return sendResponse(reply, 200, {
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return sendResponse(reply, 500, {
      success: false,
      message: "Error updating product",
      error: error instanceof Error ? error.message : error,
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
      include: { category: true },
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
