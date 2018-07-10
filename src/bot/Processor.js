"use strict";
//===================================================================================
//The aim of this module is to do raw processing of input, in a non-contextual manner.
//===================================================================================
exports.__esModule = true;
var natural = require("natural");
var chrono = require("chrono-node");
var stemmer = natural.LancasterStemmer;
//VALUES
var VALUE_NULL = 'null';
//TYPES
var TYPE_UNDEFINED = 'undefined';
//PROPERTIES
var PROPERTY_CONTEXTUAL = 'contextual';
var PROPERTY_DATE = 'date';
var Processor = /** @class */ (function () {
    function Processor() {
        this._properties = {}; //Keys are properties, identifiers are classifiers
        this._error_handler = null;
    }
    /**
     * Add a property to the processor. Each input will have a property mapped to it
     * @param identifier
     */
    Processor.prototype.addProperty = function (identifier, is_optional) {
        //Checking of identifier before adding
        if (!identifier) {
            this.raiseError(this.ERROR_PROPERTY_EXISTS(identifier));
            return false;
        }
        if (typeof this._properties[identifier] !== TYPE_UNDEFINED) {
            this.raiseError(this.ERROR_PROPERTY_EXISTS(identifier));
            return false;
        }
        //Configure the classifier
        var classifier = new natural.BayesClassifier(stemmer);
        classifier.setOptions({ keepStops: true });
        //Initialize the classifiers with sufficient weight to warrant null as default for mismatch
        classifier.addDocument(VALUE_NULL, VALUE_NULL);
        //Store the classifier
        var property = new Property(classifier, is_optional);
        this._properties[identifier] = property;
    };
    /**
     * Add a document to the classifier for an identifier based on action type
     * @param identifier
     * @param action_type
     * @param sample_data
     */
    Processor.prototype.addDocument = function (identifier, action_type, sample_data) {
        var classifier = (this._properties[identifier]) ? this._properties[identifier] : null;
        if (!classifier) {
            this.raiseError(this.ERROR_PROPERTY_NOT_EXISTS(identifier));
            return;
        }
        //Initialize the classifiers with sufficient weight to warrant null as default for mismatch
        this._properties[identifier].classifier.addDocument(VALUE_NULL, VALUE_NULL);
        this._properties[identifier].classifier.addDocument(sample_data, action_type);
    };
    /**
     * Train all the classifiers when this method is called
     */
    Processor.prototype.train = function () {
        for (var identifier in this._properties) {
            this._properties[identifier].classifier.train();
        }
    };
    //INPUT PROCESSORS
    Processor.prototype.process = function (input) {
        return this.process_meta_1(input, this.process_meta_0(input)).flatten();
    };
    Processor.prototype.process_meta_0 = function (input) {
        var output = {};
        for (var identifier in this._properties) {
            output[identifier] = this._properties[identifier].classifier.classify(input);
        }
        return new Meta_0_Output(output);
    };
    Processor.prototype.process_meta_1 = function (input, meta_0_output) {
        var is_contextual = this.is_contextual(meta_0_output);
        var start_date = this.get_date(input);
        var end_date = this.get_end_date(input);
        return new Meta_1_Output(meta_0_output, is_contextual, start_date, this.get_end_date(input));
    };
    //PRIVATE INTERNAL FUNCTIONS
    Processor.prototype.is_contextual = function (meta_0_output) {
        var null_props = meta_0_output.get_null_properties();
        for (var key in null_props) {
            var null_prop = null_props[key];
            //We determine the meta_0 output to be contextual when a non optional property is null
            if (this._properties[null_prop] && (!this._properties[null_prop].optional)) {
                return true;
            }
        }
        return false;
    };
    Processor.prototype.get_date = function (input) {
        var op = VALUE_NULL;
        var date = chrono.parseDate(input);
        if (date) {
            var dt = new Date(date);
            if (dt) {
                op = dt.getDate() + '/' + (dt.getMonth() + 1) + '/' + dt.getFullYear();
            }
        }
        return op;
    };
    Processor.prototype.get_end_date = function (input) {
        var results = chrono.parse(input);
        if (!results[0] || !results[0].end) {
            return VALUE_NULL;
        }
        var op = VALUE_NULL;
        var date = results[0].end.date();
        var dt = new Date(date);
        if (dt) {
            op = dt.getDate() + '/' + (dt.getMonth() + 1) + '/' + dt.getFullYear();
        }
        return op;
    };
    //ERROR HANDLING
    Processor.prototype.ERROR_PROPERTY_EXISTS = function (identifier) {
        return "Error: The property " + identifier + " already exists.";
    };
    ;
    Processor.prototype.ERROR_INVALID_PROPERTY = function (identifier) {
        return "Error: The property " + identifier + " is invalid.";
    };
    ;
    Processor.prototype.ERROR_PROPERTY_NOT_EXISTS = function (identifier) {
        return "Error: The property " + identifier + " does not exist.";
    };
    ;
    Processor.prototype.raiseError = function (error) {
        var t = typeof this._error_handler;
        if (typeof this._error_handler == 'function') {
            this._error_handler(error);
        }
    };
    Processor.prototype.onError = function (handler) {
        this._error_handler = handler;
    };
    return Processor;
}());
exports.Processor = Processor;
var Property = /** @class */ (function () {
    function Property(classifier, optional) {
        this.classifier = classifier;
        this.optional = optional;
    }
    return Property;
}());
var Meta_0_Output = /** @class */ (function () {
    function Meta_0_Output(data) {
        this.data = data;
    }
    Meta_0_Output.prototype.get_null_properties = function () {
        var nulls = [];
        for (var prop in this.data) {
            if (this.data[prop] === VALUE_NULL) {
                nulls.push(prop);
            }
        }
        return nulls;
    };
    Meta_0_Output.prototype.flatten = function () {
        return this.data;
    };
    return Meta_0_Output;
}());
var Meta_1_Output = /** @class */ (function () {
    function Meta_1_Output(meta_0_output, contextual, starttime, endtime) {
        if (starttime === void 0) { starttime = VALUE_NULL; }
        if (endtime === void 0) { endtime = VALUE_NULL; }
        this.meta_0_output = meta_0_output;
        this.contextual = contextual;
        this.starttime = starttime;
        this.endtime = endtime;
    }
    //Return start time as the default
    Meta_1_Output.prototype.get_time = function () {
        return this.starttime;
    };
    Meta_1_Output.prototype.flatten = function () {
        var output = this.meta_0_output.data;
        output.contextual = String(this.contextual);
        output.starttime = this.starttime;
        output.endtime = this.endtime;
        return output;
    };
    return Meta_1_Output;
}());
