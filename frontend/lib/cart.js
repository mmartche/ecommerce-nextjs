export const CART_KEY = "ecommerce_cart";

export function getCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const cart = localStorage.getItem(CART_KEY);

    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));

  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(item) {
  const cart = getCart();

  const existingIndex = cart.findIndex(
    (cartItem) =>
      cartItem.productId === item.productId &&
      cartItem.keys === item.keys &&
      cartItem.color?.id === item.color?.id &&
      cartItem.font?.id === item.font?.id
  );

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += item.quantity;
  } else {
    cart.push({
      ...item,
      cartItemId: `${Date.now()}-${Math.random().toString(36).slice(2)}`
    });
  }

  saveCart(cart);
}

export function removeFromCart(cartItemId) {
  const cart = getCart();

  const updatedCart = cart.filter(
    (item) => item.cartItemId !== cartItemId
  );

  saveCart(updatedCart);
}

export function updateCartQuantity(cartItemId, quantity) {
  const cart = getCart();

  const updatedCart = cart.map((item) => {
    if (item.cartItemId !== cartItemId) {
      return item;
    }

    return {
      ...item,
      quantity: Math.max(1, quantity)
    };
  });

  saveCart(updatedCart);
}

export function clearCart() {
  saveCart([]);
}

export function getCartCount() {
  return getCart().reduce(
    (total, item) => total + item.quantity,
    0
  );
}