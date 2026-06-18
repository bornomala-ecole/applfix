// /api/admin/delete-image/route.ts

import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export async function POST(req: Request) {
  try {
    const { publicId } = await req.json()

    if (!publicId) {
      return new Response("Missing publicId", { status: 400 })
    }

    await cloudinary.uploader.destroy(publicId)

    return Response.json({ success: true })
  } catch (err) {
    console.error(err)
    return new Response("Delete failed", { status: 500 })
  }
}