const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/blogas", (error) => {
  if (!error) {
    console.log("pajunge");
  } else {
    console.log("nepajunge");
  }
});
