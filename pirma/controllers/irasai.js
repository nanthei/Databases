const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const irasaimodel = mongoose.model("irasai");

router.get("/", (req, res) => {


  irasaimodel.find((error, informacija) => {
    if (!error) {

        informacija.forEach(function(item){
            var data = new Date(item.data);
            item.data = data.toLocaleDateString('lt-LT');
        })

      res.render("list", { data: informacija });
    } else {
      res.send("ivyko klaida");
    }
  }).lean();

});

module.exports = router;
