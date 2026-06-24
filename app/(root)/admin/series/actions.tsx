"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createSeriesAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const brandId = String(formData.get("brandId") || "").trim();
  const sortOrderValue = String(formData.get("sortOrder") || "0");

  const sortOrder = Number(sortOrderValue) || 0;

  if (!name) {
    throw new Error("Series name is required.");
  }

  if (!brandId) {
    throw new Error("Brand is required.");
  }

  await prisma.series.create({
    data: {
      name,
      brandId,
      sortOrder,
    },
  });

  revalidatePath("/admin/series");
}

export async function updateSeriesAction(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const brandId = String(formData.get("brandId") || "").trim();
  const sortOrderValue = String(formData.get("sortOrder") || "0");

  const sortOrder = Number(sortOrderValue) || 0;

  if (!id) {
    throw new Error("Series ID is required.");
  }

  if (!name) {
    throw new Error("Series name is required.");
  }

  if (!brandId) {
    throw new Error("Brand is required.");
  }

  await prisma.series.update({
    where: {
      id,
    },
    data: {
      name,
      brandId,
      sortOrder,
    },
  });

  revalidatePath("/admin/series");
}

export async function deleteSeriesAction(formData: FormData) {
  const id = String(formData.get("id") || "").trim();

  if (!id) {
    throw new Error("Series ID is required.");
  }

  await prisma.series.delete({
    where: {
      id,
    },
  });

  revalidatePath("/admin/series");
}