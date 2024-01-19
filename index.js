let express = require('express');
let router = express.Router();
let fruits_sql = require('../sql/fruits_sql');
let searcher = require('../searcher');
let personal_sql = require('../sql/personal_sql');



// GET home page.
router.get('/', function(req, res, next) {
    res.render('home');
});

router.get('/fruits', function(req, res, next) {
    const query = req.query.q; //Get search query from URL
    let limit = 10;
    if(req.query.limit !== undefined && req.query.limit != '') {
        if(req.query.limit < 1 || req.query.limit > 50) {
            res.sendStatus(400);
            return;
        } else {
            limit = req.query.limit;
        }

    } else {
        limit = 10;
    }

    let boost = false;

    if(req.query.boost) {
        boost = true;
    }

    if (!query) {
        //render page without results
        res.render('fruits', { searchResults: [] });
    } else {
        let pages = fruits_sql.selectAllPages();
        //console.log(pages);
        const searchResults = searcher.search(pages, query, limit, boost); // performs search
        res.render('fruits', { searchResults });
    }
});

router.get('/popular', function(req, res, next) {

    const links = fruits_sql.selectPopular();

    if (req.accepts('text/html')) {
        res.render('popular', { links });
    } else if (req.accepts('application/json')) { //incase it does not render the pug file
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.json(links);
    } else {
        res.status(404);
    }
});

router.get('/page/:id', function(req, res, next) {
    const id = decodeURIComponent(req.params.id);
    const page = fruits_sql.selectLink(id);
    console.log('Requested ID:', id); 
    if (req.accepts('text/html')) {
        res.render('page', { page });
    } else if (req.accepts('application/json')) {
        res.status(200);
        res.setHeader('Content-Type', 'application/json');
        res.json(page);
    } else {
        res.status(404);
    }
});


router.get('/personal/', function( req, res, next) {
    const query = req.query.q; //Get search query from URL
    let limit = 10;
    if(req.query.limit !== undefined && req.query.limit != '') {
        if(req.query.limit < 1 || req.query.limit > 50) {
            res.sendStatus(400);
            return;
        } else {
            limit = req.query.limit;
        }

    } else {
        limit = 10;
    }

    let boost = false;

    if(req.query.boost) {
        boost = true;
    }

    if (!query) {
        //render page without results
        res.render('personal', { searchResults: [] });
    } else {
        let pages = personal_sql.selectAllPages();
        //console.log(pages);
        const searchResults = searcher.search(pages, query, limit, boost); // performs search
        res.render('personal', { searchResults });
    }
});

router.get('/personal/:id', function(req, res, next){
    const id = decodeURIComponent(req.params.id);
    const page = personal_sql.selectLink(id);
    if(!page) {
        res.send('Page not found');
        res.status(404);
    } else {
        console.log(page);
        res.render('personalPage', { page });
    }
});

module.exports = router;
