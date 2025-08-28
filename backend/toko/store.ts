import { api, APIError } from "encore.dev/api";
import { tokoDB } from "./db";
import type { Barang, Pemesanan, DetailPemesanan, CheckoutRequest } from "./types";

interface ListProductsResponse {
  products: Barang[];
}

interface GetProductParams {
  id: number;
}

interface SearchProductsParams {
  q?: string;
  category?: string;
}

// Retrieves all available products for customers (only items with stock > 0).
export const listProducts = api<void, ListProductsResponse>(
  { expose: true, method: "GET", path: "/store/products" },
  async () => {
    const rows = await tokoDB.queryAll<Barang>`
      SELECT * FROM barang 
      WHERE stok > 0 
      ORDER BY nama_barang
    `;
    return { products: rows };
  }
);

// Retrieves a specific product by ID.
export const getProduct = api<GetProductParams, Barang>(
  { expose: true, method: "GET", path: "/store/products/:id" },
  async ({ id }) => {
    const row = await tokoDB.queryRow<Barang>`
      SELECT * FROM barang WHERE id_barang = ${id} AND stok > 0
    `;
    if (!row) {
      throw APIError.notFound("Product not found or out of stock");
    }
    return row;
  }
);

// Searches products by name or category.
export const searchProducts = api<SearchProductsParams, ListProductsResponse>(
  { expose: true, method: "GET", path: "/store/search" },
  async ({ q, category }) => {
    let query = `SELECT * FROM barang WHERE stok > 0`;
    const params: any[] = [];
    let paramIndex = 1;

    if (q) {
      query += ` AND (nama_barang ILIKE $${paramIndex} OR merk ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (category) {
      query += ` AND jenis_barang ILIKE $${paramIndex}`;
      params.push(`%${category}%`);
      paramIndex++;
    }

    query += ` ORDER BY nama_barang`;

    const rows = await tokoDB.rawQueryAll<Barang>(query, ...params);
    return { products: rows };
  }
);

// Checkout - converts cart items to order.
export const checkout = api<CheckoutRequest, Pemesanan>(
  { expose: true, method: "POST", path: "/store/checkout" },
  async (req) => {
    // Start transaction
    const tx = await tokoDB.begin();
    
    try {
      // Get cart items
      const cartItems = await tx.queryAll<any>`
        SELECT c.*, b.harga_jual, b.stok, b.nama_barang
        FROM cart c
        JOIN barang b ON c.id_barang = b.id_barang
        WHERE c.id_pelanggan = ${req.id_pelanggan}
      `;

      if (cartItems.length === 0) {
        throw APIError.invalidArgument("Cart is empty");
      }

      // Check stock availability
      for (const item of cartItems) {
        if (item.jumlah > item.stok) {
          throw APIError.invalidArgument(`Insufficient stock for ${item.nama_barang}. Available: ${item.stok}, Requested: ${item.jumlah}`);
        }
      }

      // Calculate total
      const total = cartItems.reduce((sum, item) => sum + (item.jumlah * item.harga_jual), 0);

      // Create order
      const order = await tx.queryRow<Pemesanan>`
        INSERT INTO pemesanan (id_pelanggan, tanggal, status, total)
        VALUES (${req.id_pelanggan}, CURRENT_DATE, 'pending', ${total})
        RETURNING *
      `;

      if (!order) {
        throw APIError.internal("Failed to create order");
      }

      // Create order details and update stock
      for (const item of cartItems) {
        // Create order detail
        await tx.exec`
          INSERT INTO detail_pemesanan (id_pemesanan, id_barang, jumlah, harga)
          VALUES (${order.id_pemesanan}, ${item.id_barang}, ${item.jumlah}, ${item.harga_jual})
        `;

        // Update stock
        await tx.exec`
          UPDATE barang 
          SET stok = stok - ${item.jumlah}
          WHERE id_barang = ${item.id_barang}
        `;
      }

      // Clear cart
      await tx.exec`
        DELETE FROM cart WHERE id_pelanggan = ${req.id_pelanggan}
      `;

      await tx.commit();
      return order;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }
);

// Get customer orders.
export const getCustomerOrders = api<{ id_pelanggan: number }, { orders: Pemesanan[] }>(
  { expose: true, method: "GET", path: "/store/orders/:id_pelanggan" },
  async ({ id_pelanggan }) => {
    const rows = await tokoDB.queryAll<Pemesanan>`
      SELECT p.*, pel.nama_pelanggan
      FROM pemesanan p
      LEFT JOIN pelanggan pel ON p.id_pelanggan = pel.id_pelanggan
      WHERE p.id_pelanggan = ${id_pelanggan}
      ORDER BY p.tanggal DESC
    `;
    return { orders: rows };
  }
);

// Get order details.
export const getOrderDetails = api<{ id_pemesanan: number }, { details: DetailPemesanan[] }>(
  { expose: true, method: "GET", path: "/store/orders/details/:id_pemesanan" },
  async ({ id_pemesanan }) => {
    const rows = await tokoDB.queryAll<DetailPemesanan>`
      SELECT dp.*, b.nama_barang, b.satuan
      FROM detail_pemesanan dp
      LEFT JOIN barang b ON dp.id_barang = b.id_barang
      WHERE dp.id_pemesanan = ${id_pemesanan}
      ORDER BY dp.id_detail_pemesanan
    `;
    return { details: rows };
  }
);
