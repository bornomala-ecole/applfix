"use client";

import { useState } from "react";
import { DetailedProduct } from "@/lib/types/shop";

interface ProductOptionsProps {
  product: DetailedProduct;
  initialColor: string;
  initialStorage: string;
}

export default function ProductOptions({
  product,
  initialColor,
  initialStorage,
}: ProductOptionsProps) {
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedStorage, setSelectedStorage] = useState(initialStorage);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-900">
          Color: {selectedColor}
        </h3>

        <div className="mt-3 flex gap-2">
          {product.variants.color.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => setSelectedColor(color.name)}
              className={`h-10 w-10 rounded-full border-2 transition-all ${
                selectedColor === color.name
                  ? "ring-2 ring-offset-2 ring-[var(--color-primary)]"
                  : "border-gray-300"
              }`}
              style={{ backgroundColor: color.hex }}
              aria-label={`Select ${color.name}`}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900">
          Storage: {selectedStorage}
        </h3>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {product.variants.storage.map((storage) => (
            <button
              key={storage.size}
              type="button"
              onClick={() => setSelectedStorage(storage.size)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                selectedStorage === storage.size
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {storage.size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}