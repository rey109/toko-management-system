import { api, APIError } from "encore.dev/api";
import { tokoDB } from "./db";
import type { Barang, CreateBarangRequest, UpdateBarangRequest } from "./types";

interface ListBarangResponse {
  barang: Barang[];
}

interface GetBarangParams {
  id: number;
}

// Retrieves all barang items.
export const listBarang = api<void, ListBarangResponse>(
  { expose: true, method: "GET", path: "/barang" },
  async () => {
    const rows = await tokoDB.queryAll<Barang>`
      SELECT * FROM barang ORDER BY nama_barang
    `;
    return { barang: rows };
  }
);

// Retrieves a specific barang by ID.
export const getBarang = api<GetBarangParams, Barang>(
  { expose: true, method: "GET", path: "/barang/:id" },
  async ({ id }) => {
    const row = await tokoDB.queryRow<Barang>`
      SELECT * FROM barang WHERE id_barang = ${id}
    `;
    if (!row) {
      throw APIError.notFound("Barang not found");
    }
    return row;
  }
);

// Creates a new barang item.
export const createBarang = api<CreateBarangRequest, Barang>(
  { expose: true, method: "POST", path: "/barang" },
  async (req) => {
    const row = await tokoDB.queryRow<Barang>`
      INSERT INTO barang (nama_barang, jenis_barang, merk, harga_beli, harga_jual, stok, satuan)
      VALUES (${req.nama_barang}, ${req.jenis_barang || null}, ${req.merk || null}, 
              ${req.harga_beli || null}, ${req.harga_jual || null}, ${req.stok || null}, ${req.satuan || null})
      RETURNING *
    `;
    if (!row) {
      throw APIError.internal("Failed to create barang");
    }
    return row;
  }
);

// Updates an existing barang item.
export const updateBarang = api<UpdateBarangRequest, Barang>(
  { expose: true, method: "PUT", path: "/barang/:id" },
  async (req) => {
    const { id, ...updates } = req;
    
    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.nama_barang !== undefined) {
      setParts.push(`nama_barang = $${paramIndex++}`);
      values.push(updates.nama_barang);
    }
    if (updates.jenis_barang !== undefined) {
      setParts.push(`jenis_barang = $${paramIndex++}`);
      values.push(updates.jenis_barang);
    }
    if (updates.merk !== undefined) {
      setParts.push(`merk = $${paramIndex++}`);
      values.push(updates.merk);
    }
    if (updates.harga_beli !== undefined) {
      setParts.push(`harga_beli = $${paramIndex++}`);
      values.push(updates.harga_beli);
    }
    if (updates.harga_jual !== undefined) {
      setParts.push(`harga_jual = $${paramIndex++}`);
      values.push(updates.harga_jual);
    }
    if (updates.stok !== undefined) {
      setParts.push(`stok = $${paramIndex++}`);
      values.push(updates.stok);
    }
    if (updates.satuan !== undefined) {
      setParts.push(`satuan = $${paramIndex++}`);
      values.push(updates.satuan);
    }

    if (setParts.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    values.push(id);
    const query = `UPDATE barang SET ${setParts.join(", ")} WHERE id_barang = $${paramIndex} RETURNING *`;
    
    const row = await tokoDB.rawQueryRow<Barang>(query, ...values);
    if (!row) {
      throw APIError.notFound("Barang not found");
    }
    return row;
  }
);

// Deletes a barang item.
export const deleteBarang = api<GetBarangParams, void>(
  { expose: true, method: "DELETE", path: "/barang/:id" },
  async ({ id }) => {
    const result = await tokoDB.queryRow<{ count: number }>`
      DELETE FROM barang WHERE id_barang = ${id} RETURNING 1 as count
    `;
    if (!result) {
      throw APIError.notFound("Barang not found");
    }
  }
);
