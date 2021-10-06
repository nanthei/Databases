const express = require("express");
const hbs = require("express-handlebars");
const app = express();
const path = require("path");
// const db = require('./db/connection');
const clientsController = require("./controllers/clients");
const companiesController = require("./controllers/companies");
const loginController = require("./controllers/login");

const session = require('express-session');

app.use(session({
secret: 'secret',
resave: true,
saveUninitialized: true
}));

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
app.use("/", loginController);

//Controlleris vedantis index puslapi

app.get("/", (req, res) => {
  res.render("template/login");
});

app.listen("3000");
