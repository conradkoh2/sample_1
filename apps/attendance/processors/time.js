var Chrono = require('chrono-node');
var stringToDate = function (input) {
    var op = null;
    var date = Chrono.parseDate(input);
    if (date) {
        var dt = new Date(date);
        if (dt) {
            op = dt.getDate() + '/' + (dt.getMonth() + 1) + '/' + dt.getFullYear();
        }
    }
    return op;
}
module.exports.stringToDate = stringToDate;