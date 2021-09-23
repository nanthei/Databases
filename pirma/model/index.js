//Paduodame reikalingus modulius musu projektui
const mongoose = require('mongoose');
const express = require('express');


//Prisijungiame prie duomenu bazes
mongoose.connect('mongodb://localhost:27017/blogas', { ignoreUndefined: true }, (error) => {

    if(!error) {

        console.log('Prisijungimas sekmingas');

    } else {

        console.log('Prisijungimas nepavyko');

    }
    
});

//Pajungiame modeli is tame paciame folderyje esanciu failu
const irasai = require('./irasai.model');