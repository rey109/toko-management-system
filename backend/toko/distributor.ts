import { api, APIError } from "encore.dev/api";
import { tokoDB } from "./db";
import type { Distributor, CreateDistributorRequest, UpdateDistributorRequest } from "./types";

interface ListDistributorResponse {
  distributors: Distributor[];
}

interface GetDistributorParams {
  id: number;
}

// Retrieves all distributors.
export const listDistributors = api<void, ListDistributorResponse>(
  { expose: true, method: "GET", path: "/distributors" },
  async () => {
    const rows = await tokoDB.queryAll<Distributor>`
      SELECT * FROM distributor ORDER BY nama_distributor
    `;
    return { distributors: rows };
  }
);

// Retrieves a specific distributor by ID.
export const getDistributor = api<GetDistributorParams, Distributor>(
  { expose: true, method: "GET", path: "/distributors/:id" },
  async ({ id }) => {
    const row = await tokoDB.queryRow<Distributor>`
      SELECT * FROM distributor WHERE id_distributor = ${id}
    `;
    if (!row) {
      throw APIError.notFound("Distributor not found");
    }
    return row;
  }
);

// Creates a new distributor.
export const createDistributor = api<CreateDistributorRequest, Distributor>(
  { expose: true, method: "POST", path: "/distributors" },
  async (req) => {
    const row = await tokoDB.queryRow<Distributor>`
      INSERT INTO distributor (nama_distributor, alamat, telepon)
      VALUES (${req.nama_distributor}, ${req.alamat || null}, ${req.telepon || null})
      RETURNING *
    `;
    if (!row) {
      throw APIError.internal("Failed to create distributor");
    }
    return row;
  }
);

// Updates an existing distributor.
export const updateDistributor = api<UpdateDistributorRequest, Distributor>(
  { expose: true, method: "PUT", path: "/distributors/:id" },
  async (req) => {
    const { id, ...updates } = req;
    
    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.nama_distributor !== undefined) {
      setParts.push(`nama_distributor = $${paramIndex++}`);
      values.push(updates.nama_distributor);
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
    const query = `UPDATE distributor SET ${setParts.join(", ")} WHERE id_distributor = $${paramIndex} RETURNING *`;
    
    const row = await tokoDB.rawQueryRow<Distributor>(query, ...values);
    if (!row) {
      throw APIError.notFound("Distributor not found");
    }
    return row;
  }
);

// Deletes a distributor.
export const deleteDistributor = api<GetDistributorParams, void>(
  { expose: true, method: "DELETE", path: "/distributors/:id" },
  async ({ id }) => {
    const result = await tokoDB.queryRow<{ count: number }>`
      DELETE FROM distributor WHERE id_distributor = ${id} RETURNING 1 as count
    `;
    if (!result) {
      throw APIError.notFound("Distributor not found");
    }
  }
);
