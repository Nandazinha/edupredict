import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "260908",
  database: "edupredict",
});

db.connect((err) => {
  if (err) console.log(err);
  else console.log("MySQL conectado!");
});

export default db;
