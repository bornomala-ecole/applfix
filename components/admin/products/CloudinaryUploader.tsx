"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type UploadedImage = {
  url: string;
  public_id: string;
  alt?: string;
};

type CloudinaryUploaderProps = {
  label?: string;
  folder: string;
  value?: UploadedImage;
  onUpload: (image: UploadedImage) => void;
  buttonText?: string;
};

export default function CloudinaryUploader({
  label,
  folder,
  value,
  onUpload,
  buttonText = "Upload Image",
}: CloudinaryUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setIsUploading(true);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error("Missing Cloudinary public env variables.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.message || "Upload failed.");
      }

      onUpload({
        url: data.secure_url,
        public_id: data.public_id,
        alt: file.name,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {label ? <p className="text-sm font-medium">{label}</p> : null}

      {value?.url ? (
        <div className="rounded-lg border p-3">
          <div className="relative h-36 w-36 overflow-hidden rounded-md border">
            <Image
              src={value.url}
              alt={value.alt || "Uploaded image"}
              fill
              className="object-cover"
            />
          </div>

          <p className="mt-2 break-all text-xs text-gray-500">
            {value.public_id}
          </p>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="rounded-lg border px-4 py-2 text-sm disabled:opacity-60"
      >
        {isUploading ? "Uploading..." : buttonText}
      </button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}