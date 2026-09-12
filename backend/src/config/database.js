const { Pool } = require("pg");

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
              connectionString: process.env.DATABASE_URL,
              ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false }
          }
        : {
              host: process.env.DB_HOST || "localhost",
              port: Number(process.env.DB_PORT) || 5432,
              user: process.env.DB_USER || "postgres",
              password: process.env.DB_PASSWORD,
              database: process.env.DB_NAME || "sentinelx"
          }
);

pool.on("error", (err) => {
    console.error("Unexpected error on idle PostgreSQL client:", err.message);
});

module.exports = pool;