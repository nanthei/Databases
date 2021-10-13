const express = require("express");
const hbs = require("express-handlebars");
const app = express();
const path = require("path");
const db = require("./db/connection");
const clientsController = require("./controllers/books");
const companiesController = require("./controllers/authors");
const md5 = require("md5");
const validator = require("validator");

//express-session
const session = require("express-session");

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(function (req, res, next) {
  app.locals.auth = req.session.auth ? true : false;
  next();
});

app.use(
  express.urlencoded({
    extended: false,
  })
);

app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/template",
    helpers: require("./config/handlebars-helpers"),
  })
);

app.set("views", path.join(__dirname, "/views/"));

app.set("view engine", "hbs");

app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("static"));
app.use(
  "/static/css",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/css"))
);
app.use(
  "/static/js",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist/js"))
);

app.use("/", clientsController);
app.use("/", companiesController);

//Controlleris vedantis index puslapi

app.get("/", (req, res) => {
  if (req.session.auth) res.render("template/index");
  else res.render("template/login");
});

app.post("/login", (req, res) => {
  let user = req.body.email;
  let pass = md5(req.body.password);

  if (user && pass) {
    db.query(
      `SELECT * FROM users WHERE email = '${user}' AND password = '${pass}'`,
      (err, user) => {
        if (!err && user.length > 0) {
          req.session.auth = true;
          req.session.user = user;

          let hour = 3600000;
          req.session.cookie.expires = new Date(Date.now() + hour);
          req.session.cookie.maxAge = hour;

          req.session.save();
        }
      }
    );
  }

  res.redirect("/");
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  let name = req.body.name;
  let email = req.body.email;
  let password = md5(req.body.password);

  if (
    !validator.isAlpha(name, "en-US", { ignore: " .ąĄčČęĘėĖįĮšŠųŲūŪ" }) ||
    !validator.isLength(name, { min: 3, max: 50 })
  ) {
    res.redirect("/register/?m=Įveskite kliento vardą&s=danger");
    return;
  }

  if (!validator.isEmail(email)) {
    res.redirect("/register/?m=Įveskite kliento el. pašto adresą&s=danger");
    return;
  }

  if (!validator.isAlphanumeric(password)) {
    res.redirect("/register/?m=Iveskite slaptazodi&s=danger");
    return;
  }

  db.query(
    `INSERT INTO users (name, email, password) 
              VALUES ( '${name}', '${email}', '${password}')`,
    (err) => {
      if (err) {
        res.redirect("/register/?m=Nepavyko pridėti kliento&s=danger");
        return;
      }

      res.redirect("/");
    }
  );
});

app.listen("3000");
