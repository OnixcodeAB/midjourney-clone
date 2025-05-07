// PostgreSQL database connection using pg library
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
