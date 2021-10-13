const express = require("express");
const db = require("../db/connection");
const app = express.Router();

app.get("/list-books", (req, res) => {
  if (!req.session.auth) {
    res.redirect("/");
    return;
  }
  let messages = req.query.m;
  let status = req.query.s;

  let aid = req.query.aid != -1 ? req.query.aid : "";
  let order_by = req.query.order_by;
  let position = req.query.position;
  let query_a = aid ? "WHERE b.aid = " + aid : "";
  let query_b =
    req.query.order_by && req.query.order_by != -1
      ? "ORDER BY b." + req.query.order_by
      : "";
  let query_c = "";

  if (req.query.position == "ASC") query_c = "ASC";

  if (req.query.position == "DESC") query_c = "DESC";

  db.query(`SELECT * FROM authors`, (err, authors) => {
    if (!err) {
      if (aid) {
        authors.forEach(function (val, index) {
          if (aid == val["id"]) authors[index]["selected"] = true;
        });
      }

      db.query(
        `SELECT b.id, b.title, 
            b.pages, b.isbn, b.short, 
            b.aid, 
            aut.name AS aut_name, aut.surname AS aut_sur FROM books AS b
            LEFT JOIN authors AS aut
            ON b.aid = aut.id ${query_a} ${query_b} ${query_c}`,
        (err, books) => {
          if (!err) {
            res.render("template/book/list-books", {
              books: books,
              order_by,
              position,
              authors,
              messages,
              status,
            });
          } else {
            res.redirect("/list-books/?m=Įvyko klaida&s=danger");
          }
        }
      );
    } else {
      res.redirect("/list-books/?m=Įvyko klaida&s=danger");
    }
  });
});

app.get("/add-book", (req, res) => {
  if (!req.session.auth) {
    res.redirect("/");
    return;
  }
  db.query(`SELECT id, name, surname FROM authors`, (err, resp) => {
    if (err) {
      res.render("template/book/add-book", {
        messages: "Nepavyko paimti kompanijų iš duomenų bazės.",
        status: "danger",
      });
    } else {
      res.render("template/book/add-book", { authors: resp });
    }
  });
});

app.post("/add-book", (req, res) => {
  if (!req.session.auth) {
    res.redirect("/");
    return;
  }
  let title = req.body.title;
  let pages = req.body.pages;
  let isbn = req.body.isbn;
  let short = req.body.short;
  let aid = req.body.aid;

  db.query(
    `INSERT INTO books (title, pages, isbn, short, aid) 
            VALUES ( '${title}', '${pages}', '${isbn}', '${short}', '${aid}')`,
    (err) => {
      if (err) {
        res.redirect("/list-books/?m=Nepavyko pridėti kliento1&s=danger");
        return;
      }

      res.redirect("/list-books/?m=Sėkmingai pridėjote klientą&s=success");
    }
  );
});

app.get("/edit-book/:id", (req, res) => {
  if (!req.session.auth) {
    res.redirect("/");
    return;
  }
  let id = req.params.id;
  let messages = req.query.m;
  let status = req.query.s;

  db.query(`SELECT * FROM books WHERE id = ${id}`, (err, book) => {
    if (!err) {
      db.query(`SELECT id, name, surname FROM authors`, (err, authors) => {
        book = book[0];

        authors.forEach(function (val, index) {
          if (book["aid"] == val["id"]) authors[index]["selected"] = true;
        });

        if (err) {
          res.render("template/book/edit-book", {
            book: book,
            messages: "Nepavyko paimti kompanijų iš duomenų bazės.",
            status: "danger",
          });
        } else {
          res.render("template/book/edit-book", {
            book: book,
            authors,
            messages,
            status,
          });
        }
      });
    } else {
      res.redirect("/list-books/?m=Tokio kliento rasti nepavyko&s=danger");
    }
  });
});

app.post("/edit-book/:id", (req, res) => {
  if (!req.session.auth) {
    res.redirect("/");
    return;
  }
  let id = req.params.id;
  let title = req.body.title;
  let pages = req.body.pages;
  let isbn = req.body.isbn;
  let short = req.body.short;
  let aid = req.body.aid;

  let sql = "";
  let values = [];

  sql = `UPDATE books SET title = ?, pages = ?, isbn = ?, short = ?, aid = ? WHERE id = ?`;
  values = [title, pages, isbn, short, aid, id];

  db.query(sql, values, (err) => {
    if (err) {
      res.redirect("/list-books/?m=Nepavyko pridėti kliento2&s=danger");
      return;
    }

    res.redirect("/list-books/?m=Sėkmingai pridėjote klientą&s=success");
  });
});

app.get("/delete-book/:id", (req, res) => {
  if (!req.session.auth) {
    res.redirect("/");
    return;
  }
  let id = req.params.id;

  db.query(`DELETE FROM books WHERE id = ${id}`, (err, resp) => {
    if (!err) {
      res.redirect("/list-books/?m=Įrašas sėkmingai ištrintas&s=success");
    } else {
      res.redirect("/list-books/?m=Nepavyko ištrinti įrašo&s=danger");
    }
  });
});

module.exports = app;
