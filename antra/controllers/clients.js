const express = require("express");
const validator = require("validator");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    callback(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  fileFilter: function (req, file, callback) {
    if (file.mimetype != "image/jpeg" && file.mimetype != "image/png")
      return callback(new Error("Neteisingas nuotraukos formatas"));

    callback(null, true);
  },
  storage: storage,
});
const db = require("../db/connection");
const app = express.Router();

//Klientai

app.get("/list-clients", (req, res) => {
  if (!req.session.auth) {
    res.redirect("/");
    return;
  }
  let messages = req.query.m;
  let status = req.query.s;
  let company_id = req.query.company_id != -1 ? req.query.company_id : "";
  let order_by = req.query.order_by;
  let position = req.query.position;
  let query_a = company_id ? "WHERE c.company_id = " + company_id : "";
  let query_b =
    req.query.order_by && req.query.order_by != -1
      ? "ORDER BY c." + req.query.order_by
      : "";
  let query_c = "";

  if (req.query.position == 1) query_c = "ASC";

  if (req.query.position == 2) query_c = "DESC";

  //if( !company_id.isInteger() || company.id == -1)

  db.query(`SELECT * FROM companies`, (err, companies) => {
    if (!err) {
      if (company_id) {
        //Sutikriname kompanijas ar kuri nors iš jų buvo priskirta klientui,
        companies.forEach(function (val, index) {
          //Jeigu einamas kompanijos id atitinka id iš kliento informacijos, prisikiriame naują indeksą ir reikšmę
          if (company_id == val["id"]) companies[index]["selected"] = true;
        });
      }
      //(atvaizduojamu rezultatu skaiciu / parodomu rezultatu skaiciaus) * esamo puslapio
      //LIMIT 0, 10 - Limituoja gautų rezultatų skaičių nuo 0 iki 10. Pirma reikšmė reiškia nuo kurios eilutės pradedame imti rezultatus, o antroji kiek rezultatų imame.
      //Pirmas puslapis - LIMIT 0, 10
      //Antras puslapis - LIMIT 10, 20
      //ORDER BY pavadinimas - Rūšiuoja duomenis pagal pasirinktą stulpelį
      //Iš karto po ORDER BY gali sekti ASC arba DESC, kas reiškia pagal didėjimo tvarką arba atvirkščiai

      db.query(
        `SELECT c.id, c.name, 
            c.surname, c.phone, c.email, 
            c.photo, c.company_id, 
            co.name AS company_name FROM customers AS c
            LEFT JOIN companies AS co
            ON c.company_id = co.id ${query_a} ${query_b} ${query_c}`,
        (err, customers) => {
          if (!err) {
            res.render("template/clients/list-clients", {
              clients: customers,
              order_by,
              position,
              companies,
              messages,
              status,
            });
          } else {
            // console.log(`SELECT c.id, c.name,
            // c.surname, c.phone, c.email,
            // c.photo, c.company_id,
            // co.name AS company_name FROM customers AS c
            // LEFT JOIN companies AS co
            // ON c.company_id = co.id ${where} ${order_by} ${position}`);
            // res.json(req.query);
            res.redirect("/list-clients/?m=Įvyko klaida&s=danger");
          }
        }
      );
    } else {
      res.redirect("/list-clients/?m=Įvyko klaida&s=danger");
    }
  });
});

app.get("/add-client", (req, res) => {
  if (!req.session.auth) {
    res.redirect("/");
    return;
  }
  db.query(`SELECT id, name FROM companies`, (err, resp) => {
    if (err) {
      res.render("template/clients/add-client", {
        messages: "Nepavyko paimti kompanijų iš duomenų bazės.",
        status: "danger",
      });
    } else {
      res.render("template/clients/add-client", { companies: resp });
    }
  });
});

app.post("/add-client", upload.single("photo"), (req, res) => {
  if (!req.session.auth) {
    res.redirect("/");
    return;
  }
  let name = req.body.name;
  let surname = req.body.surname;
  let phone = req.body.phone;
  let email = req.body.email;
  let photo = req.file ? req.file.filename : ""; //If funkcijos trumpinys, jeigu req.files neegzistuoja, tuomet grąžiname tuščią stringą. Priešingu atveju, grąžiname failo pavadinimą.
  let comment = req.body.comment;
  let company_id = req.body.company;

  if (
    !validator.isAlpha(name, "en-US", { ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ" }) ||
    !validator.isLength(name, { min: 3, max: 50 })
  ) {
    res.redirect("/list-clients/?m=Įveskite kliento vardą&s=danger");
    return;
  }

  if (
    !validator.isAlpha(surname, "en-US", { ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ" }) ||
    !validator.isLength(name, { min: 3, max: 50 })
  ) {
    res.redirect("/list-clients/?m=Įveskite kliento pavardę&s=danger");
    return;
  }

  if (!validator.isMobilePhone(phone, "lt-LT")) {
    res.redirect("/list-clients/?m=Įveskite kliento telefono numerį&s=danger");
    return;
  }

  if (!validator.isEmail(email)) {
    res.redirect("/list-clients/?m=Įveskite kliento el. pašto adresą&s=danger");
    return;
  }

  if (!validator.isInt(company_id)) {
    res.redirect("/list-clients/?m=Pasirinkite kompaniją&s=danger");
    return;
  }

  db.query(
    `INSERT INTO customers (name, surname, phone, email, photo, comment, company_id) 
            VALUES ( '${name}', '${surname}', '${phone}', '${email}', '${photo}', '${comment}', '${company_id}' )`,
    (err) => {
      if (err) {
        res.redirect("/list-clients/?m=Nepavyko pridėti kliento&s=danger");
        return;
      }

      res.redirect("/list-clients/?m=Sėkmingai pridėjote klientą&s=success");
    }
  );
});

app.get("/edit-client/:id", (req, res) => {
  if (!req.session.auth) {
    res.redirect("/");
    return;
  }
  let id = req.params.id;
  let messages = req.query.m;
  let status = req.query.s;

  db.query(`SELECT * FROM customers WHERE id = ${id}`, (err, customer) => {
    if (!err) {
      //Išsitraukiame kompaniju sąrašą.
      db.query(`SELECT id, name FROM companies`, (err, companies) => {
        customer = customer[0];

        //Sutikriname kompanijas ar kuri nors iš jų buvo priskirta klientui,
        companies.forEach(function (val, index) {
          //Jeigu einamas kompanijos id atitinka id iš kliento informacijos, prisikiriame naują indeksą ir reikšmę
          if (customer["company_id"] == val["id"])
            companies[index]["selected"] = true;
        });

        // customer[0]['companies'] = companies;

        if (err) {
          res.render("template/clients/add-client", {
            client: customer,
            messages: "Nepavyko paimti kompanijų iš duomenų bazės.",
            status: "danger",
          });
        } else {
          res.render("template/clients/edit-client", {
            client: customer,
            companies,
            messages,
            status,
          });
        }
      });
    } else {
      res.redirect("/list-clients/?m=Tokio kliento rasti nepavyko&s=danger");
    }
  });
});

app.post("/edit-client/:id", upload.single("photo"), (req, res) => {
  if (!req.session.auth) {
    res.redirect("/");
    return;
  }
  let id = req.params.id;
  let name = req.body.name;
  let surname = req.body.surname;
  let phone = req.body.phone;
  let email = req.body.email;
  let photo = req.file ? req.file.filename : ""; //If funkcijos trumpinys, jeigu req.files neegzistuoja, tuomet grąžiname tuščią stringą. Priešingu atveju, grąžiname failo pavadinimą.
  let comment = req.body.comment;
  let company_id = req.body.company;
  let del_photo = req.body.delete_photo;
  let sql = "";
  let values = [];

  if (
    !validator.isAlpha(name, "en-US", { ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ" }) ||
    !validator.isLength(name, { min: 3, max: 50 })
  ) {
    res.redirect("/list-clients/?m=Įveskite kliento vardą&s=danger");
    return;
  }

  if (
    !validator.isAlpha(surname, "en-US", { ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ" }) ||
    !validator.isLength(name, { min: 3, max: 50 })
  ) {
    res.redirect("/list-clients/?m=Įveskite kliento pavardę&s=danger");
    return;
  }

  if (!validator.isMobilePhone(phone, "lt-LT")) {
    res.redirect("/list-clients/?m=Įveskite kliento telefono numerį&s=danger");
    return;
  }

  if (!validator.isEmail(email)) {
    res.redirect("/list-clients/?m=Įveskite kliento el. pašto adresą&s=danger");
    return;
  }

  if (!validator.isInt(company_id)) {
    res.redirect("/list-clients/?m=Pasirinkite kompaniją&s=danger");
    return;
  }

  if (photo || del_photo == 1) {
    sql = `UPDATE customers SET name = ?, surname = ?, phone = ?, email = ?, photo = ?, comment = ?, company_id = ? WHERE id = ?`;
    values = [name, surname, phone, email, photo, comment, company_id, id];
  } else {
    sql = `UPDATE customers SET name = ?, surname = ?, phone = ?, email = ?, comment = ?, company_id = ? WHERE id = ?`;
    values = [name, surname, phone, email, comment, company_id, id];
  }

  db.query(sql, values, (err) => {
    if (err) {
      res.redirect("/list-clients/?m=Nepavyko pridėti kliento&s=danger");
      return;
    }

    res.redirect("/list-clients/?m=Sėkmingai pridėjote klientą&s=success");
  });
});

app.get("/delete-client/:id", (req, res) => {
  if (!req.session.auth) {
    res.redirect("/");
    return;
  }
  let id = req.params.id;

  db.query(`SELECT photo FROM customers WHERE id = ${id}`, (err, customer) => {
    if (!err) {
      if (customer[0]["photo"]) {
        fs.unlink(
          __dirname + "../../uploads/" + customer[0]["photo"],
          (err) => {
            if (err) {
              res.redirect(
                "/list-clients/?m=Nepavyko ištrinti nuotraukos&s=danger"
              );
            }
          }
        );
      }

      db.query(`DELETE FROM customers WHERE id = ${id}`, (err, resp) => {
        if (!err) {
          res.redirect("/list-clients/?m=Įrašas sėkmingai ištrintas&s=success");
        } else {
          res.redirect("/list-clients/?m=Nepavyko ištrinti įrašo&s=danger");
        }
      });
    }
  });
});

module.exports = app;
