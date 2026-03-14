import ProductCreateForm from "@/components/admin/products/ProductCreateForm";

export default function NewProductPage() {
  return (
    <div className="container py-8">
      <h1 className="mb-6 text-2xl font-semibold">Add New Product</h1>
      <ProductCreateForm />
    </div>
  );
}