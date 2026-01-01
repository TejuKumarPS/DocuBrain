// import 'dotenv/config';
import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
const { Pool } = pkg;

// const connectionString = process.env.DATABASE_URL;

// if (!connectionString) {
//   console.log("⚠️ DATABASE_URL is missing. DB features will not work.");
// }

// const pool = new Pool({
//   connectionString,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // host: process.env.PG_HOST,
  // port: process.env.PG_PORT,
  // user: process.env.PG_USER,
  // password: process.env.PG_PASSWORD,
  // database: process.env.PG_DATABASE,
  // For cloud DBs like Supabase/Render/Heroku:
  // ssl: { rejectUnauthorized: false },
});

export default pool;
