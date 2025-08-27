import sql from "mssql";
import dbConfig from "../config/db.js";

let pool;

export async function initializeDbConnection() {
  if (pool) return pool;

  try {
    console.log("Connecting with server:", dbConfig.server);
    pool = await sql.connect(dbConfig);
    console.log("SQL Server connected");
    return pool;
  } catch (err) {
    console.error("Connection failed:", err);
    throw err;
  }
}

export function getConnection() {
  if (!pool) throw new Error("Database not initialized. Call initializeDbConnection() first.");
  return pool;
}
