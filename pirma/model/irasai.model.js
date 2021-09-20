const mongoose = require("mongoose");

var IrasuSchema = new mongoose.Schema({
  irasoId: {
    type: String,
  },
  pavadinimas: {
    type: String,
  },
  turinys: {
    type: String,
  },
  data: {
    type: Date,
  },
});

mongoose.model("irasai", IrasuSchema);
