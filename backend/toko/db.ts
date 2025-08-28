import { SQLDatabase } from "encore.dev/storage/sqldb";

export const tokoDB = new SQLDatabase("toko", {
  migrations: "./migrations",
});
