import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Read the CA certificate from Vercel environment variables
const caCertificate = process.env.DB_SSL_CA
  ?.replace(/\\n/g, "\n")
  .trim();

// Temporary diagnostic: check whether the CA certificate is loaded
console.log(
  "Aiven CA loaded:",
  Boolean(caCertificate),
  "Length:",
  caCertificate?.length
);

// Create MySQL connection pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    ca: caCertificate,
    rejectUnauthorized: true,
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
export async function testDb() {
  const connection = await pool.getConnection();

  try {
    await connection.ping();
    return true;
  } finally {
    connection.release();
  }
}
