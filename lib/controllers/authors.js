const express = require("express");
const db = require("../db/connection");
const app = express.Router();

app.get("/add-author", (req, res) => {
  if (!req.session.auth) {
    res.redirect("/");
    return;
  }
  res.render("template/author/add-author");
});

app.post("/add-author", (req, res) => {
  if (!req.session.auth) {
    res.redirect("/");
    return;
  }
  let autName = req.body.name;
  let autSur = req.body.surname;

  db.query(`SELECT * FROM authors WHERE name = '${autName}'`, (err, resp) => {
    if (err) {
      res.redirect("/list-authors/?m=Įvyko klaida&s=danger");
      return;
    }

    if (resp.length == 0) {
      db.query(
        `INSERT INTO authors (name, surname) 
                    VALUES ( '${autName}' , '${autSur}' )`,
        (err) => {
          if (err) {
            console.log(err);
            return;
          }

          res.redirect("/list-authors/?m=Sėkmingai pridėjote įrašą&s=success");
        }
      );
    } else {
      res.redirect("/list-authors/?m=Toks įrašas jau egzistuoja&s=warning");
    }
  });
});

app.get("/list-authors", (req, res) => {
  if (!req.session.auth) {
    res.redirect("/");
    return;
  }
  let messages = req.query.m;
  let status = req.query.s;

  db.query(`SELECT * FROM authors`, (err, resp) => {
    if (!err) {
      res.render("template/author/list-authors", {
        authors: resp,
        messages,
        status,
      });
    }
  });
});

app.get("/edit-author/:id", (req, res) => {
  if (!req.session.auth) {
    res.redirect("/");
    return;
  }
  let id = req.params.id;
  let messages = req.query.m;
  let status = req.query.s;

  db.query(`SELECT * FROM authors WHERE id = ${id}`, (err, resp) => {
    if (!err) {
      res.render("template/author/edit-author", {
        author: resp[0],
        messages,
        status,
      });
    }
  });
});

app.get("/page/:id", (req, res) => {
  if (!req.session.auth) {
    res.redirect("/");
    return;
  }
  let puslapio_nr = req.params.id;

  res.send("Test " + puslapio_nr);
});

app.post("/edit-author/:id", (req, res) => {
  if (!req.session.auth) {
    res.redirect("/");
    return;
  }
  let id = req.params.id;
  let autName = req.body.name;
  let autSur = req.body.surname;

  db.query(
    `SELECT COUNT(*) kiekis FROM authors WHERE name = '${autName}' AND id != ${id}`,
    (err, dbresp) => {
      if (!err) {
        if (dbresp[0].kiekis == 0) {
          db.query(
            `UPDATE authors SET name = '${autName}', surname = '${autSur}' WHERE id = ${id}`,
            (err, resp) => {
              if (!err) {
                res.redirect(
                  "/list-authors/?m=Įrašas sėkmingai išsaugotas&s=success"
                );
              } else {
                res.redirect("/list-authors/?m=Įvyko klaida&s=danger");
              }
            }
          );
        } else {
          res.redirect(
            "/edit-author/" +
              id +
              "/?m=Toks kompanijos pavadinimas jau įrašytas&s=warning"
          );
        }
      } else {
        res.redirect("/list-authors/?m=Įvyko klaida&s=danger");
      }
    }
  );
});

app.get("/delete-author/:id", (req, res) => {
  if (!req.session.auth) {
    res.redirect("/");
    return;
  }
  let id = req.params.id;

  db.query(`DELETE FROM authors WHERE id = ${id}`, (err, resp) => {
    if (!err) {
      res.redirect("/list-authors/?m=Įrašas sėkmingai ištrintas&s=success");
    } else {
      res.redirect("/list-authors/?m=Nepavyko ištrinti įrašo&s=danger");
    }
  });
});

module.exports = app;
