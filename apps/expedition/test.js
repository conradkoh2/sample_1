//Config
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var config = require(__dirname + '/config.js');
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR = config.dirroot + '/sheets/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'expedition-db-token.json';
var SECRET_PATH = config.dirroot + '/sheets/secrets/client_secret.json';
var sheetId = '1a1CUxZyZZSEoutufdZu2FDzin1_TNQYkm8J3Yhrs4_8';
var tableName = 'attendance';
var startIndex = 'A2';
var endIndex = 'C';


var db = require(__dirname + '/sheets/db.js')(
    SCOPES, TOKEN_DIR, TOKEN_PATH, SECRET_PATH, sheetId, tableName, startIndex, endIndex
);

// db.get_rows(function (err, data) {
//     console.log(data);
// });

// db.insert_rows([["my-date", "my-name", "my-role"], ["my-date2", "my-name2", "my-role2"]]);
// db.row_for_key('a', function(err, data){
//     console.log(data);
// })