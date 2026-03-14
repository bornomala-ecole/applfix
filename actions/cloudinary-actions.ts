"use server";

import cloudinary from "@/lib/cloudinary";

type DeleteImageResult = {
  success: boolean;
  message?: string;
};

export async function deleteCloudinaryImageAction(
  publicId: string
): Promise<DeleteImageResult> {
  try {
    if (!publicId) {
      return { success: false, message: "Missing public_id" };
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result === "ok" || result.result === "not found") {
      return { success: true };
    }

    return {
      success: false,
      message: "Cloudinary could not delete the image.",
    };
  } catch (error) {
    console.error("deleteCloudinaryImageAction error:", error);
    return {
      success: false,
      message: "Failed to delete image from Cloudinary.",
    };
  }
}