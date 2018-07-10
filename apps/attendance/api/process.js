var Controller = require('./../controllers/process');
module.exports.process = function (query) {
    return Controller.process(query.message);
}