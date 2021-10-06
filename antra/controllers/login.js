const express = require("express");
const validator = require("validator");
const path = require("path");
const db = require("../db/connection");
const app = express.Router();

app.post("/login", (req, res) => {
    res.render("template/login");
  });

  module.exports = app;