const mongoose = require("mongoose");
const express = require('express');

mongoose.connect("mongodb://localhost:27017/blogas", (error) => {
  if (!error) {
    console.log("pajunge");
  } else {
    console.log("nepajunge");
  }
});

const irasai = require('./irasai.model');
const failai = require('./failai.model');