import { api, APIError } from "encore.dev/api";
import { tokoDB } from "./db";
import type { Cart, AddToCartRequest, UpdateCartRequest } from "./types";

interface ListCartResponse {
  cart: Cart[];
}

interface GetCartParams {
  id_pelanggan: number;
}

interface DeleteCartParams {
  id: number;
}

interface UpdateCartParams {
  id_cart: number;
  jumlah: number;
}

// Retrieves cart items for a specific customer.
export const getCart = api<GetCartParams, ListCartResponse>(
  { expose: true, method: "GET", path: "/cart/:id_pelanggan" },
  async ({ id_pelanggan }) => {
    const rows = await tokoDB.queryAll<Cart>`
      SELECT c.*, b.nama_barang, b.harga_jual, b.stok, b.satuan
      FROM cart c
      LEFT JOIN barang b ON c.id_barang = b.id_barang
      WHERE c.id_pelanggan = ${id_pelanggan}
      ORDER BY c.created_at DESC
    `;
    return { cart: rows };
  }
);

// Adds an item to the cart or updates quantity if item already exists.
export const addToCart = api<AddToCartRequest, Cart>(
  { expose: true, method: "POST", path: "/cart" },
  async (req) => {
    // Check if item already exists in cart
    const existingItem = await tokoDB.queryRow<Cart>`
      SELECT * FROM cart WHERE id_pelanggan = ${req.id_pelanggan} AND id_barang = ${req.id_barang}
    `;

    if (existingItem) {
      // Update quantity
      const row = await tokoDB.queryRow<Cart>`
        UPDATE cart 
        SET jumlah = jumlah + ${req.jumlah}
        WHERE id_cart = ${existingItem.id_cart}
        RETURNING *
      `;
      if (!row) {
        throw APIError.internal("Failed to update cart");
      }
      return row;
    } else {
      // Add new item
      const row = await tokoDB.queryRow<Cart>`
        INSERT INTO cart (id_pelanggan, id_barang, jumlah)
        VALUES (${req.id_pelanggan}, ${req.id_barang}, ${req.jumlah})
        RETURNING *
      `;
      if (!row) {
        throw APIError.internal("Failed to add to cart");
      }
      return row;
    }
  }
);

// Updates cart item quantity.
export const updateCart = api<UpdateCartParams, Cart>(
  { expose: true, method: "PUT", path: "/cart/:id_cart" },
  async ({ id_cart, jumlah }) => {
    const row = await tokoDB.queryRow<Cart>`
      UPDATE cart 
      SET jumlah = ${jumlah}
      WHERE id_cart = ${id_cart}
      RETURNING *
    `;
    if (!row) {
      throw APIError.notFound("Cart item not found");
    }
    return row;
  }
);

// Removes an item from the cart.
export const removeFromCart = api<DeleteCartParams, void>(
  { expose: true, method: "DELETE", path: "/cart/:id" },
  async ({ id }) => {
    const result = await tokoDB.queryRow<{ count: number }>`
      DELETE FROM cart WHERE id_cart = ${id} RETURNING 1 as count
    `;
    if (!result) {
      throw APIError.notFound("Cart item not found");
    }
  }
);

// Clears all items from a customer's cart.
export const clearCart = api<GetCartParams, void>(
  { expose: true, method: "DELETE", path: "/cart/clear/:id_pelanggan" },
  async ({ id_pelanggan }) => {
    await tokoDB.exec`
      DELETE FROM cart WHERE id_pelanggan = ${id_pelanggan}
    `;
  }
);
