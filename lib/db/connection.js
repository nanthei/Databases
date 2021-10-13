const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "lib",
});

db.connect((err) => {
  if (err) {
    console.log("nepavyko pasijungt i db");
    return;
  }
  console.log("pasijungem prie db");
});

module.exports = db;
