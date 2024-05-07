import mysql from "mysql2/promise";

// LOCAL DB
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "gainup",
  connectionLimit: 10,
  maxIdle: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
}).pool;

// SERVER DB

// const pool = mysql.createPool({
//   host: "localhost",
//   user: "admin",
//   password: "GainUpTrading1@",
//   database: "gainup",
//   connectionLimit: 10,
//   maxIdle: 10,
//   queueLimit: 0,
//   enableKeepAlive: true,
//   keepAliveInitialDelay: 0,
// }).pool;

export const db = pool.promise();
