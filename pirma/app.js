const connection = require("./model");
const express = require("express");
const application = express();
const path = require("path");
const expressHandlebars = require("express-handlebars");

// expressHandlebars.registerHelper('dateFormat', require('handlebars-dateformat'));
const irasaiController =  require('./controllers/irasai');

application.use(
  express.urlencoded({
    extended: false,
  })
);

application.set('views', path.join(__dirname,'/views/'));

application.engine('hbs', expressHandlebars({
    extname: 'hbs',
    defaultLayout: 'mainlayout',
    layoutsDir: __dirname + '/views/layouts',
    // helpers: registerHelper('dateFormat', require('handlebars-dateformat'))
}));

application.set('view engine','hbs');

application.get("/", (req, res) => {
  res.render("index");
});


application.use('/irasai',irasaiController);
// application.get("/irasai", (req, res) => {
//   res.send("irasu puslapis");
// });

application.listen("3000", () => {
  console.log("Server ON");
});
