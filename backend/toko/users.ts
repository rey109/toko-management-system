import { api, APIError } from "encore.dev/api";
import { tokoDB } from "./db";
import type { User, CreateUserRequest, UpdateUserRequest } from "./types";

interface ListUsersResponse {
  users: User[];
}

interface GetUserParams {
  id: number;
}

// Retrieves all users.
export const listUsers = api<void, ListUsersResponse>(
  { expose: true, method: "GET", path: "/users" },
  async () => {
    const rows = await tokoDB.queryAll<User>`
      SELECT id_user, username, nama_lengkap, level FROM users ORDER BY username
    `;
    return { users: rows };
  }
);

// Retrieves a specific user by ID.
export const getUser = api<GetUserParams, User>(
  { expose: true, method: "GET", path: "/users/:id" },
  async ({ id }) => {
    const row = await tokoDB.queryRow<User>`
      SELECT id_user, username, nama_lengkap, level FROM users WHERE id_user = ${id}
    `;
    if (!row) {
      throw APIError.notFound("User not found");
    }
    return row;
  }
);

// Creates a new user.
export const createUser = api<CreateUserRequest, User>(
  { expose: true, method: "POST", path: "/users" },
  async (req) => {
    const row = await tokoDB.queryRow<User>`
      INSERT INTO users (username, password, nama_lengkap, level)
      VALUES (${req.username}, ${req.password}, ${req.nama_lengkap || null}, ${req.level})
      RETURNING id_user, username, nama_lengkap, level
    `;
    if (!row) {
      throw APIError.internal("Failed to create user");
    }
    return row;
  }
);

// Updates an existing user.
export const updateUser = api<UpdateUserRequest, User>(
  { expose: true, method: "PUT", path: "/users/:id" },
  async (req) => {
    const { id, ...updates } = req;
    
    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.username !== undefined) {
      setParts.push(`username = $${paramIndex++}`);
      values.push(updates.username);
    }
    if (updates.password !== undefined) {
      setParts.push(`password = $${paramIndex++}`);
      values.push(updates.password);
    }
    if (updates.nama_lengkap !== undefined) {
      setParts.push(`nama_lengkap = $${paramIndex++}`);
      values.push(updates.nama_lengkap);
    }
    if (updates.level !== undefined) {
      setParts.push(`level = $${paramIndex++}`);
      values.push(updates.level);
    }

    if (setParts.length === 0) {
      throw APIError.invalidArgument("No fields to update");
    }

    values.push(id);
    const query = `UPDATE users SET ${setParts.join(", ")} WHERE id_user = $${paramIndex} RETURNING id_user, username, nama_lengkap, level`;
    
    const row = await tokoDB.rawQueryRow<User>(query, ...values);
    if (!row) {
      throw APIError.notFound("User not found");
    }
    return row;
  }
);

// Deletes a user.
export const deleteUser = api<GetUserParams, void>(
  { expose: true, method: "DELETE", path: "/users/:id" },
  async ({ id }) => {
    const result = await tokoDB.queryRow<{ count: number }>`
      DELETE FROM users WHERE id_user = ${id} RETURNING 1 as count
    `;
    if (!result) {
      throw APIError.notFound("User not found");
    }
  }
);
