

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
module.exports = function (scopes, tokenDir, tokenPath, secretPath, sheetId, tableName, startIndex, endIndex) {

    //========================================
    //INTERNAL FUNCTIONS DEFINED BY GOOGLE
    //========================================

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     *
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    function authorize(credentials, callback) {
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

        // Check if we have previously stored a token.
        fs.readFile(tokenPath, function (err, token) {
            if (err) {
                getNewToken(oauth2Client, callback);
            } else {
                oauth2Client.credentials = JSON.parse(token);
                callback(oauth2Client);
            }
        });
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     *
     * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback to call with the authorized
     *     client.
     */
    function getNewToken(oauth2Client, callback) {
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes
        });
        console.log('Authorize this app by visiting this url: ', authUrl);
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter the code from that page here: ', function (code) {
            rl.close();
            oauth2Client.getToken(code, function (err, token) {
                if (err) {
                    console.log('Error while trying to retrieve access token', err);
                    return;
                }
                oauth2Client.credentials = token;
                storeToken(token);
                callback(oauth2Client);
            });
        });
    }

    /**
     * Store token to disk be used in later program executions.
     *
     * @param {Object} token The token to store to disk.
     */
    function storeToken(token) {
        try {
            fs.mkdirSync(tokenDir);
        } catch (err) {
            if (err.code != 'EEXIST') {
                throw err;
            }
        }
        fs.writeFile(tokenPath, JSON.stringify(token));
        console.log('Token stored to ' + tokenPath);
    }

    /**
     * Print the names and majors of students in a sample spreadsheet:
     * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
     */
    function fetch(auth, callback) {
        var sheets = google.sheets('v4');
        sheets.spreadsheets.values.get({
            auth: auth,
            spreadsheetId: sheetId,
            range: tableName + '!' + startIndex + ':' + endIndex,
        }, function (err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return;
            }
            var rows = response.values;
            callback(rows);
        });
    }

    /**
     * @param {*} rows The rows to append
     * @param {*} callback 
     */
    var insert = function (auth, rows, callback) {

        var sheets = google.sheets('v4');
        sheets.spreadsheets.values.append({
            auth: auth,
            spreadsheetId: sheetId,
            range: tableName + '!' + startIndex + ':' + endIndex,
            valueInputOption: 'USER_ENTERED',  // TODO: Update placeholder value.
        
            // How the input data should be inserted.
            insertDataOption: 'INSERT_ROWS',  // TODO: Update placeholder value.
            resource: {
                values: rows
            }
        }, function (err, response) {
            if (err) {
                callback(err, null);
                console.log('The API returned an error: ' + err);
                return;
            }
            callback(null, 'Response recorded.');
        });
        var x = 1;
    }

    //========================================
    //FUNCTIONS TARGETED FOR EXPORT
    //========================================

    var update = function (callback) {
        fs.readFile(secretPath, function processClientSecrets(err, content) {
            if (err) {
                callback(err, null);
                console.log('Error loading client secret file: ' + err);
                return;
            }
            // Authorize a client with the loaded credentials, then call the
            // Google Sheets API.
            authorize(JSON.parse(content), function (auth) {
                fetch(auth, function (data) {
                    callback(null, data);
                });
            });
        });
    }

    var get_rows = function (callback) {
        update(callback);
    }

    var row_for_key = function (key, callback) {
        const find_key = function (key, array) {
            for (index in array) {
                if (key == array[index][0]) {
                    return array[index];
                }
            }
            return null;
        }

        update(function (err, data) {
            var data = find_key(key, data);
            callback(null, data);
        });
    }

    var insert_rows = function (rows, callback) {
        fs.readFile(secretPath, function processClientSecrets(err, content) {
            if (err) {
                callback(err, null);
                console.log('Error loading client secret file: ' + err);
                return;
            }
            // Authorize a client with the loaded credentials, then call the
            // Google Sheets API.
            authorize(JSON.parse(content), function (auth) {
                insert(auth, rows, callback);
            });
        });
    }

    var exports = {};
    exports.get_rows = get_rows;
    exports.row_for_key = row_for_key;
    exports.insert_rows = insert_rows;
    return exports;
}