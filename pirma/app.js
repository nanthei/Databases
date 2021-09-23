//    .\mongod.exe --dbpath='C:\Users\toshiba satellite\Desktop\BIT\mongoDB\data'

/* 2021-09-20 */
//Paimam is model folderio index js faila
require('./model');
//Paimam express moduli
const express = require('express');
//Pajungiam nauja express aplikacija
const application = express();
//Prijungiame nodejs biblioteka path
const path = require('path');
//Prijungiame express-handlebars
const expressHandlebars = require('express-handlebars');
//Pajungiame controllers direktorija
const irasaicontroller = require('./controllers/irasai');

application.use(express.urlencoded({
    extended: false
}));

//Aplikacijai priskiriame views direktorija is kurios imsime sablonus
application.set('views', path.join(__dirname, '/views/'));

//aplikacijai prisikiriame handlebars papildini ir jam nustatoteme pagrindini sablona,
//kuris apims visa atvaizduojamos aplikacijos turini
application.engine('hbs', expressHandlebars({
    extname: 'hbs',
    defaultLayout: 'mainlayout',
    layoutsDir: __dirname + '/views/layouts'
}));

//ijungiame templeitu engine
application.set('view engine', 'hbs');

//Sukuriame pirma routeri skirta atvaizduoti turini tituliniame puslapyje
application.get('/', (req, res) => {
    res.render('index');
});

//Pajungiame controllers/irasai.js faila adresui /irasai
application.use('/irasai', irasaicontroller)

//Ijungiame aplikacija ja paleidziant 3000 porte
application.listen('3000', ()=> {
    console.log('Serveris veikia');
});