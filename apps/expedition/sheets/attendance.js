//Config
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR = __dirname + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'expedition-db-token.json';
var SECRET_PATH = __dirname + '/secrets/client_secret.json';
var sheetId = '1a1CUxZyZZSEoutufdZu2FDzin1_TNQYkm8J3Yhrs4_8';
var tableName = 'attendance';
var startIndex = 'A2';
var endIndex = 'D';


var db = require(__dirname + '/db.js')(
    SCOPES, TOKEN_DIR, TOKEN_PATH, SECRET_PATH, sheetId, tableName, startIndex, endIndex
);

module.exports = {
    db: db
}