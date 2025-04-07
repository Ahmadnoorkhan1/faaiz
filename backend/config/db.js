import pkg from "pg";
import dotenv from "dotenv";

dotenv.config(); // ✅ Load env variables early

const { Client } = pkg;

const client = new Client({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

let isConnected = false; // ✅ Prevent multiple connections

const connectDB = async () => {
  if (isConnected) return;

  try {
    await client.connect();
    isConnected = true;
    console.log("✅ Connected to PostgreSQL");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
};

export { connectDB, client };
