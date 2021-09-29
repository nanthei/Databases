const express = require("express");
const app = express();
const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "myblog",
});

db.connect((err) => {
  if (err) {
    console.log("nepavyko pasijungt i db");
    return;
  }
  console.log("pasijungem prie db");
});

// db.query(`CREATE TABLE IF NOT EXISTS irasai(
//     id int(9) NOT NULL AUTO_INCREMENT,
//     pavadinimas varchar(256),
//     turinys text,
//     PRIMARY KEY (id)
//     ) AUTO_INCREMENT = 1 DEFAULT CHARSET = UTF8`, (err, res) => {
//       if (err) {
//           console.log(err);
//         }
//       console.log(res);
//     });

// db.query("USE myblog", (err, res) => {
//   if (err) {
//       console.log(err);
//     }
//   console.log(res);
// });

// db.query("SHOW  DATABASES", (err, res) => {
//     if (err) {
//         console.log(err);
//       }
//     console.log(res);
//   });


//1111111111111111111111111111111111
// db.query(
//   `INSERT INTO irasai(pavadinimas, turinys) VALUES ('kitas','kitas')`,
//   (err, res) => {
//     if (err) {
//       console.log(err);
//     }
//     console.log(res);
//   }
// );

//22222222222222222222222222222222222
// db.query("SELECT * FROM irasai", (err, res) => {
//     if (err) {
//         console.log(err);
//       }
//     console.log(res);
//   });

//33333333333333333333333333333333
// db.query(`UPDATE irasai 
// SET pavadinimas = 'update'
// WHERE 1`, (err, res) => {
//     if (err) {
//         console.log(err);
//       }
//     console.log(res);
//   });

//44444444444444444444444444444444
// db.query("DELETE FROM irasai WHERE id>3", (err, res) => {
//     if (err) {
//         console.log(err);
//       }
//     console.log(res);
//   });

  db.query("SELECT * FROM irasai", (err, res) => {
    if (err) {
        console.log(err);
      }
    console.log(res);
  });
