const express = require("express");
const validator = require("validator");
const path = require("path");
const db = require("../db/connection");
const app = express.Router();

// app.post("/login", (req, res) => {
//     let user = req.body.email;
//     let pass = req.body.password;

//     if( user && pass){
//       console.log(user + ' ' + pass);
//     }
//   });
 
  module.exports = app;