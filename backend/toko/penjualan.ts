import { api, APIError } from "encore.dev/api";
import { tokoDB } from "./db";
import type { Penjualan, CreatePenjualanRequest, DetailPenjualan, CreateDetailPenjualanRequest } from "./types";

interface ListPenjualanResponse {
  penjualan: Penjualan[];
}

interface GetPenjualanParams {
  id: number;
}

interface ListDetailPenjualanResponse {
  details: DetailPenjualan[];
}

// Retrieves all sales transactions.
export const listPenjualan = api<void, ListPenjualanResponse>(
  { expose: true, method: "GET", path: "/penjualan" },
  async () => {
    const rows = await tokoDB.queryAll<Penjualan>`
      SELECT p.*, 
             pel.nama_pelanggan,
             u.username, u.nama_lengkap,
             k.nama_kurir
      FROM penjualan p
      LEFT JOIN pelanggan pel ON p.id_pelanggan = pel.id_pelanggan
      LEFT JOIN users u ON p.id_user = u.id_user
      LEFT JOIN kurir k ON p.id_kurir = k.id_kurir
      ORDER BY p.tanggal DESC
    `;
    return { penjualan: rows };
  }
);

// Retrieves a specific sales transaction by ID.
export const getPenjualan = api<GetPenjualanParams, Penjualan>(
  { expose: true, method: "GET", path: "/penjualan/:id" },
  async ({ id }) => {
    const row = await tokoDB.queryRow<Penjualan>`
      SELECT p.*, 
             pel.nama_pelanggan,
             u.username, u.nama_lengkap,
             k.nama_kurir
      FROM penjualan p
      LEFT JOIN pelanggan pel ON p.id_pelanggan = pel.id_pelanggan
      LEFT JOIN users u ON p.id_user = u.id_user
      LEFT JOIN kurir k ON p.id_kurir = k.id_kurir
      WHERE p.id_penjualan = ${id}
    `;
    if (!row) {
      throw APIError.notFound("Penjualan not found");
    }
    return row;
  }
);

// Creates a new sales transaction.
export const createPenjualan = api<CreatePenjualanRequest, Penjualan>(
  { expose: true, method: "POST", path: "/penjualan" },
  async (req) => {
    const row = await tokoDB.queryRow<Penjualan>`
      INSERT INTO penjualan (id_pelanggan, id_user, id_kurir, tanggal, total)
      VALUES (${req.id_pelanggan || null}, ${req.id_user || null}, ${req.id_kurir || null}, 
              ${req.tanggal || null}, ${req.total || null})
      RETURNING *
    `;
    if (!row) {
      throw APIError.internal("Failed to create penjualan");
    }
    return row;
  }
);

// Deletes a sales transaction.
export const deletePenjualan = api<GetPenjualanParams, void>(
  { expose: true, method: "DELETE", path: "/penjualan/:id" },
  async ({ id }) => {
    const result = await tokoDB.queryRow<{ count: number }>`
      DELETE FROM penjualan WHERE id_penjualan = ${id} RETURNING 1 as count
    `;
    if (!result) {
      throw APIError.notFound("Penjualan not found");
    }
  }
);

// Retrieves details for a specific sales transaction.
export const getDetailPenjualan = api<GetPenjualanParams, ListDetailPenjualanResponse>(
  { expose: true, method: "GET", path: "/penjualan/:id/details" },
  async ({ id }) => {
    const rows = await tokoDB.queryAll<DetailPenjualan>`
      SELECT dp.*, b.nama_barang, b.satuan
      FROM detail_penjualan dp
      LEFT JOIN barang b ON dp.id_barang = b.id_barang
      WHERE dp.id_penjualan = ${id}
      ORDER BY dp.id_detail_penjualan
    `;
    return { details: rows };
  }
);

// Creates a new sales transaction detail.
export const createDetailPenjualan = api<CreateDetailPenjualanRequest, DetailPenjualan>(
  { expose: true, method: "POST", path: "/penjualan/details" },
  async (req) => {
    const row = await tokoDB.queryRow<DetailPenjualan>`
      INSERT INTO detail_penjualan (id_penjualan, id_barang, jumlah, harga)
      VALUES (${req.id_penjualan}, ${req.id_barang}, ${req.jumlah || null}, ${req.harga || null})
      RETURNING *
    `;
    if (!row) {
      throw APIError.internal("Failed to create detail penjualan");
    }
    return row;
  }
);
