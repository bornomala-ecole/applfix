import { getAdminProductFormData } from "@/lib/services/adminFormDataService"

export async function GET() {
  try {
    const data = await getAdminProductFormData()

    return Response.json(data)
  } catch (error) {
    console.error("ADMIN PRODUCT FORM DATA ERROR:", error)

    return Response.json(
      {
        success: false,
        message: "Error loading product form data",
      },
      {
        status: 500,
      }
    )
  }
}