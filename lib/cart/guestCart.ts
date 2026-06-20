export type GuestCartItem = {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  image?: string;
  variantTitle: string;
  color?: string | null;
  price: number;
  quantity: number;
  stock: number;
};

const CART_KEY = "guest_cart";

export function getGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveGuestCart(items: GuestCartItem[]) {
  if (typeof window === "undefined") return;

  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addGuestCartItem(item: GuestCartItem) {
  const cart = getGuestCart();

  const existingIndex = cart.findIndex(
    (cartItem) => cartItem.variantId === item.variantId
  );

  if (existingIndex >= 0) {
    const currentQuantity = cart[existingIndex].quantity;
    const nextQuantity = currentQuantity + item.quantity;

    cart[existingIndex].quantity = Math.min(nextQuantity, item.stock);
  } else {
    cart.push({
      ...item,
      quantity: Math.min(item.quantity, item.stock),
    });
  }

  saveGuestCart(cart);
}

export function updateGuestCartItemQuantity(
  variantId: string,
  quantity: number
) {
  const cart = getGuestCart();

  const updatedCart = cart
    .map((item) => {
      if (item.variantId !== variantId) return item;

      return {
        ...item,
        quantity: Math.min(Math.max(quantity, 1), item.stock),
      };
    })
    .filter((item) => item.quantity > 0);

  saveGuestCart(updatedCart);
}

export function removeGuestCartItem(variantId: string) {
  const cart = getGuestCart();

  const updatedCart = cart.filter(
    (item) => item.variantId !== variantId
  );

  saveGuestCart(updatedCart);
}

export function clearGuestCart() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("cart-updated"));
}

export function getGuestCartCount() {
  return getGuestCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getGuestCartSubtotal() {
  return getGuestCart().reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}