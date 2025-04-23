/* import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

const dbPromise = open({
  filename: path.join(process.cwd(),"src", "db", "data.sqlite"),
  driver: sqlite3.Database,
});

export default dbPromise;
 */

import { Pool } from "pg";

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use .env for connection
  ssl: false, // Optional for production
});

// Export query function (recommended)
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export default pool;
