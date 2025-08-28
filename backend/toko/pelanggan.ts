import { api, APIError } from "encore.dev/api";
import { tokoDB } from "./db";
import type { Pelanggan, CreatePelangganRequest, UpdatePelangganRequest } from "./types";

interface ListPelangganResponse {
  pelanggan: Pelanggan[];
}

interface GetPelangganParams {
  id: number;
}

// Retrieves all customers.
export const listPelanggan = api<void, ListPelangganResponse>(
  { expose: true, method: "GET", path: "/pelanggan" },
  async () => {
    const rows = await tokoDB.queryAll<Pelanggan>`
      SELECT * FROM pelanggan ORDER BY nama_pelanggan
    `;
    return { pelanggan: rows };
  }
);

// Retrieves a specific customer by ID.
export const getPelanggan = api<GetPelangganParams, Pelanggan>(
  { expose: true, method: "GET", path: "/pelanggan/:id" },
  async ({ id }) => {
    const row = await tokoDB.queryRow<Pelanggan>`
      SELECT * FROM pelanggan WHERE id_pelanggan = ${id}
    `;
    if (!row) {
      throw APIError.notFound("Pelanggan not found");
    }
    return row;
  }
);

// Creates a new customer.
export const createPelanggan = api<CreatePelangganRequest, Pelanggan>(
  { expose: true, method: "POST", path: "/pelanggan" },
  async (req) => {
    const row = await tokoDB.queryRow<Pelanggan>`
      INSERT INTO pelanggan (nama_pelanggan, alamat, telepon)
      VALUES (${req.nama_pelanggan}, ${req.alamat || null}, ${req.telepon || null})
      RETURNING *
    `;
    if (!row) {
      throw APIError.internal("Failed to create pelanggan");
    }
    return row;
  }
);

// Updates an existing customer.
export const updatePelanggan = api<UpdatePelangganRequest, Pelanggan>(
  { expose: true, method: "PUT", path: "/pelanggan/:id" },
  async (req) => {
    const { id, ...updates } = req;
    
    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.nama_pelanggan !== undefined) {
      setParts.push(`nama_pelanggan = $${paramIndex++}`);
      values.push(updates.nama_pelanggan);
    }
    if (updates.alamat !== undefined) {
      setParts.push(`alamat = $${paramIndex++}`);
      values.push(updates.alamat);
    }
    if (updates.telepon !== undefined) {
      setParts.push(`telepon = $${paramIndex++}`);
      values.push(updates.telepon);
    }

    if (setParts.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    values.push(id);
    const query = `UPDATE pelanggan SET ${setParts.join(", ")} WHERE id_pelanggan = $${paramIndex} RETURNING *`;
    
    const row = await tokoDB.rawQueryRow<Pelanggan>(query, ...values);
    if (!row) {
      throw APIError.notFound("Pelanggan not found");
    }
    return row;
  }
);

// Deletes a customer.
export const deletePelanggan = api<GetPelangganParams, void>(
  { expose: true, method: "DELETE", path: "/pelanggan/:id" },
  async ({ id }) => {
    const result = await tokoDB.queryRow<{ count: number }>`
      DELETE FROM pelanggan WHERE id_pelanggan = ${id} RETURNING 1 as count
    `;
    if (!result) {
      throw APIError.notFound("Pelanggan not found");
    }
  }
);
