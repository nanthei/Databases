const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const irasaimodel = mongoose.model('irasai');

router.get('/', (req, res) => {
    //Irasu paemimas

    irasaimodel.find( (erroras, informacija) => {
        if(!erroras) {

            //res.send('zinute') - Graziname fiksuota zinute i puslapi
            //res.json(informacija) - Graziname objekta informacija, kuri pasiimame callback iniciacijos pradzioje
            //res.render() - Graziname hbs sablone suformuota informacija
            //res.json(informacija);

            informacija.forEach(function(item) {
                var data = new Date(item.data);
                item.data = data.toLocaleDateString('lt-LT');
                item._id = item._id.toString();
            });

            res.render('list', {data: informacija});

        } else {
            res.send('Ivyko klaida');
        }
    })
    //Pakeiciame modelio kalbos atpazinima i lietuviska
    .collation({locale: "lt" })
    //isrusiuojame gauta informacija zemejimo tvarka (jeigu norime atvirksciai rasome -1)
    .sort({pavadinimas : 1})
    //grazina apdorota informacijos paketa 
    //https://mongoosejs.com/docs/tutorials/lean.html
    .lean();

    
});

router.get('/rusiavimas/desc', (req, res) => {
    irasaimodel.find( (erroras, informacija) => {
        if(!erroras) {
            informacija.forEach(function(item) {
                var data = new Date(item.data);
                item.data = data.toLocaleDateString('lt-LT');
                item._id = item._id.toString();
            });

            res.render('list', {data: informacija});

        } else {
            res.send('Ivyko klaida');
        }
    })
    .collation({locale: "lt" })
    .sort({pavadinimas : -1})
    .lean();
});

router.get('/pridejimas', (req, res) => {

    var date = new Date();
    date = date.toLocaleDateString('lt-LT');

    res.render('add', {data: date});
    
});

router.post('/edit_submit', (req, res) => {

    irasaimodel.findByIdAndUpdate(req.body.id, {
        pavadinimas: req.body.pavadinimas,
        turinys: req.body.turinys,
        data: req.body.data
    })
    .then(data => {
        console.log(data);
        res.redirect('/irasai');
    });

});

router.get('/edit/:id', (req, res) => {
    const id = req.params.id;

    irasaimodel.findById(id).lean()
    .then(info => {

        var data = new Date(info.data);
        info.data = data.toLocaleDateString('lt-LT');
        
        res.render('edit', { edit : info });
    })
    .catch(err => {
        res.json({
            response: 'fail',
            message: err.message
        });
    });

});

router.post('/submit', (req, res) => {

    //Irasu pridejimas

    var irasas = new irasaimodel();
    irasas.pavadinimas = req.body.pavadinimas;
    irasas.turinys = req.body.turinys;
    irasas.data = req.body.data;
    irasas.save();

    // console.log(req.body);
    res.redirect('/irasai');
});

router.post('/paieska', (req, res) => {
    const s = req.body.s;
   
    irasaimodel.find( {$text: { $search: s}}, (erroras, informacija) => {
        if(!erroras) {
            
            informacija.forEach(function(item) {
                var data = new Date(item.data);
                item.data = data.toLocaleDateString('lt-LT');
                item._id = item._id.toString();
            });

            res.render('paieska', {s: s, data: informacija});
        } else {
            console.log(erroras);
            res.send('Ivyko klaida');
        }
    })
    //Pakeiciame modelio kalbos atpazinima i lietuviska
    .collation({locale: "lt" })
    //isrusiuojame gauta informacija zemejimo tvarka (jeigu norime atvirksciai rasome -1)
    .sort({pavadinimas : -1})
    //grazina apdorota informacijos paketa 
    //https://mongoosejs.com/docs/tutorials/lean.html
    .lean();
});

module.exports = router;