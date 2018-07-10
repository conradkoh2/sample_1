var express = require('express');
var fs = require('fs');
var router = express.Router();
var bodyParser = require('body-parser');
var attendance_bot = require(__dirname + '/bots/attendance-bot/router.js');

//SEARCH INDEX
const filename_searchindex = 'search-index.json';
const directory_data = __dirname + '/data/';
const filepath_searchindex = directory_data + filename_searchindex;
var search_index = [];
const REFRESH_INTERVAL = 20000;
//Load the search index into memory
var loadSearchIndex = function(){
    console.log('Fetching search index');
    var db = require(__dirname + '/sheets/search-index.js').db;
    const rows = db.get_rows(function(err, data){
        search_index = [];
        for(key in data){
            var object = {};
            object.title = data[key][0];
            object.link = data[key][1];
            search_index.push(object);
        }
        console.log('Search index fetched. %s items found in index.', data.length);
    })
}
loadSearchIndex(); //Load first time
setInterval(loadSearchIndex, REFRESH_INTERVAL); //Refresh regularly

//Initialize router settings
router.use(bodyParser.json({ limit: '100mb' }));
router.use(bodyParser.urlencoded({
    extended: true
}));

//Enable cross origin headers
router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Configure routes

router.use('/', express.static(__dirname + '/public'));
router.get('/search', function (req, res) {
    var query = req.query.q;
    if (query != "") {
        var results = [];
        for (search_index_key in search_index) {
            if (search_index[search_index_key].title.toLowerCase().indexOf(query.toLowerCase()) != -1) {
                results = results.concat(search_index[search_index_key]);
            }
        }
        //var results = (typeof search_index[req.query.q] == 'undefined') ? [] : search_index[req.query.q];
        var content = JSON.stringify(results);
        res.send(content);
    }
    else {
        res.send([]);
    }
})
router.get('/search/get_index', function (req, res) {
    res.send(JSON.stringify(search_index));
})

router.post('/search/update', function (req, res) {
    search_index[req.body.index] = req.body;
    save_state();
    res.send('success');
})

router.post('/search/remove', function (req, res) {
    search_index.splice(req.body.index, 1);
    save_state();
    res.send('success')
})
router.post('/search/add', function (req, res) {
    var search_result = {};
    search_result.title = req.body.title;
    search_result.link = req.body.link;

    //Update the index
    search_index.push(search_result);
    save_state();
    res.send('success');
})

router.use('/bots/attendance', attendance_bot.router);

function save_state() {
    const content = JSON.stringify(search_index);
    //Save to file async
    if(!fs.existsSync(directory_data)){
        var shell = require('shelljs');
        shell.mkdir('-p', directory_data);
    }
    fs.writeFile(filepath_searchindex, content);
}
module.exports = { router: router }