import { api, APIError } from "encore.dev/api";
import { tokoDB } from "./db";
import type { Kurir, CreateKurirRequest, UpdateKurirRequest } from "./types";

interface ListKurirResponse {
  kurir: Kurir[];
}

interface GetKurirParams {
  id: number;
}

// Retrieves all couriers.
export const listKurir = api<void, ListKurirResponse>(
  { expose: true, method: "GET", path: "/kurir" },
  async () => {
    const rows = await tokoDB.queryAll<Kurir>`
      SELECT * FROM kurir ORDER BY nama_kurir
    `;
    return { kurir: rows };
  }
);

// Retrieves a specific courier by ID.
export const getKurir = api<GetKurirParams, Kurir>(
  { expose: true, method: "GET", path: "/kurir/:id" },
  async ({ id }) => {
    const row = await tokoDB.queryRow<Kurir>`
      SELECT * FROM kurir WHERE id_kurir = ${id}
    `;
    if (!row) {
      throw APIError.notFound("Kurir not found");
    }
    return row;
  }
);

// Creates a new courier.
export const createKurir = api<CreateKurirRequest, Kurir>(
  { expose: true, method: "POST", path: "/kurir" },
  async (req) => {
    const row = await tokoDB.queryRow<Kurir>`
      INSERT INTO kurir (nama_kurir, telepon)
      VALUES (${req.nama_kurir}, ${req.telepon || null})
      RETURNING *
    `;
    if (!row) {
      throw APIError.internal("Failed to create kurir");
    }
    return row;
  }
);

// Updates an existing courier.
export const updateKurir = api<UpdateKurirRequest, Kurir>(
  { expose: true, method: "PUT", path: "/kurir/:id" },
  async (req) => {
    const { id, ...updates } = req;
    
    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.nama_kurir !== undefined) {
      setParts.push(`nama_kurir = $${paramIndex++}`);
      values.push(updates.nama_kurir);
    }
    if (updates.telepon !== undefined) {
      setParts.push(`telepon = $${paramIndex++}`);
      values.push(updates.telepon);
    }

    if (setParts.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    values.push(id);
    const query = `UPDATE kurir SET ${setParts.join(", ")} WHERE id_kurir = $${paramIndex} RETURNING *`;
    
    const row = await tokoDB.rawQueryRow<Kurir>(query, ...values);
    if (!row) {
      throw APIError.notFound("Kurir not found");
    }
    return row;
  }
);

// Deletes a courier.
export const deleteKurir = api<GetKurirParams, void>(
  { expose: true, method: "DELETE", path: "/kurir/:id" },
  async ({ id }) => {
    const result = await tokoDB.queryRow<{ count: number }>`
      DELETE FROM kurir WHERE id_kurir = ${id} RETURNING 1 as count
    `;
    if (!result) {
      throw APIError.notFound("Kurir not found");
    }
  }
);
