var DataManager = require('./../training/data_manager');
var Time = require('./../processors/time');

module.exports.process = function (message) {
    try {
        var input = message;

        //Static training
        var training_output = DataManager.matchTraining(input);
        var output = training_output ? training_output : {};

        //Dynamic training properties are always contextual
        var context = {
            date: Time.stringToDate(input)
        }
        output['context'] = context;
    } catch (err) {
        return {
            err: err
        }
    }
    return output;
}