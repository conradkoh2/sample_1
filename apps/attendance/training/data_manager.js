var Fs = require('fs');
var Path = require('path');
var Natural = require('natural');
var dir = __dirname + '/data/classifier_maps';
var paths = Fs.readdirSync(dir);
var training = {};
var classifiers = {};
//Non-recursively load the training data
paths.map(function (path) {
    if (Fs.lstatSync(dir + '/' + path).isFile()) {
        var content = Fs.readFileSync(dir + '/' + path);

        //Get the name of the file
        var pathinfo = Path.parse(path);
        var key = pathinfo.name;

        //Load the training data
        var training_data = JSON.parse(content);
        training[key] = training_data;

        //Load the classifiers
        classifiers[key] = makeClassifier(key, training_data);
    }
});

function makeClassifier(key, training_data) {
    var classifier = new Natural.BayesClassifier();
    classifier.setOptions({
        keepStops: true
    });

    for (var i in training_data) {
        var simplified_scenario = training_data[i].join(" ");
        console.log(`Training ${i} for simplified scenario "${simplified_scenario}"`);
        classifier.addDocument(simplified_scenario, i); //Training for a particular scenario
    }
    classifier.train();
    return classifier;
}

/**
 * Pass the input to all the classifiers, and specify the output as an object based on classifiers in the system
 * @param {*} input 
 */
function matchTraining(input) {
    if (!input) {
        throw "ERROR: No input provided for training.";
    }
    var output = {};
    for (key in classifiers) {
        output[key] = classifiers[key].classify(input);
    }
    return output;
}

//Exports
var DataManager = function () {}
DataManager.training = training;
DataManager.matchTraining = matchTraining;
module.exports = DataManager;