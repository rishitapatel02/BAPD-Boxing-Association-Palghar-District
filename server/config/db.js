
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { X509Certificate } from "node:crypto";

dotenv.config();

// Read the CA certificate from environment variables
const caCertificate = process.env.DB_SSL_CA
  ?.replace(/\\n/g, "\n")
  .trim();

// Safely inspect certificate metadata
if (caCertificate) {
  try {
    const certificate = new X509Certificate(caCertificate);

    console.log("Aiven CA loaded: true");
    console.log("Certificate subject:", certificate.subject);
    console.log("Certificate issuer:", certificate.issuer);
    console.log("Certificate fingerprint:", certificate.fingerprint256);
    console.log("Certificate valid from:", certificate.validFrom);
    console.log("Certificate valid to:", certificate.validTo);
  } catch (error) {
    console.error("CA certificate parsing failed:", error.message);
  }
} else {
  console.log("Aiven CA loaded: false");
}

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
