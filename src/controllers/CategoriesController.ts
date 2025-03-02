import { Category, PrismaClient } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";
import { sendResponse } from "../helpers";

const prisma = new PrismaClient();

export const getCategories = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const categories = await prisma.category.findMany({
      include: { products: true }, // Includes products under each category
    });
    return sendResponse(reply, 200, {
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error fetching categories",
      error: error,
    });
  }
};

export const getPublicCategories = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const categories = await prisma.category.findMany({
      include: { products: true }, // Includes products under each category
    });
    return sendResponse(reply, 200, {
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error fetching categories",
      error: error,
    });
  }
};

export const getCategoryById = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };

  try {
    const validatedCategory = await _validateCategoryId(id, reply);
    if (!validatedCategory) return;

    return sendResponse(reply, 200, {
      success: true,
      message: "Category fetched successfully",
      data: validatedCategory.category,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error fetching category",
      error: error,
    });
  }
};

export const createCategory = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { name } = request.body as { name: string };
  try {
    const newCategory = await prisma.category.create({
      data: { name },
    });
    return sendResponse(reply, 201, {
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error creating category",
      error: error,
    });
  }
};

export const updateCategory = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };
  const { name } = request.body as { name: string };
  try {
    const validatedCategory = await _validateCategoryId(id, reply);
    if (!validatedCategory) return;

    const updatedCategory = await prisma.category.update({
      where: { id: validatedCategory.categoryId },
      data: { name },
    });
    return sendResponse(reply, 200, {
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error updating category",
      error: error,
    });
  }
};

export const deleteCategory = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id } = request.params as { id: string };
  try {
    const validatedCategory = await _validateCategoryId(id, reply);
    if (!validatedCategory) return;

    const deletedCategory = await prisma.category.delete({
      where: { id: validatedCategory.categoryId },
    });

    return sendResponse(reply, 200, {
      success: true,
      message: "Category deleted successfully",
      data: deletedCategory,
    });
  } catch (error) {
    return sendResponse(reply, 500, {
      success: false,
      message: "Error deleting category",
      error: error,
    });
  }
};

const _validateCategoryId = async (
  id: string,
  reply: FastifyReply
): Promise<{ categoryId: number; category: Category } | null> => {
  const categoryId = parseInt(id, 10);
  if (isNaN(categoryId)) {
    sendResponse(reply, 400, {
      success: false,
      message: "Invalid Category ID format",
    });
    return null;
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { products: true },
    });

    if (!category) {
      sendResponse(reply, 404, {
        success: false,
        message: "Category not found",
      });
      return null;
    }

    return { categoryId, category };
  } catch (error) {
    sendResponse(reply, 500, {
      success: false,
      message: "Error validating category ID",
      error: error,
    });
    return null;
  }
};
