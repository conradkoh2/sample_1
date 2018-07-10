//===================================================================================
//The aim of this module is to do raw processing of input, in a non-contextual manner.
//===================================================================================

import natural = require('natural');
import chrono = require('chrono-node');
var stemmer = natural.LancasterStemmer;
//VALUES
const VALUE_NULL = 'null';

//TYPES
const TYPE_UNDEFINED = 'undefined';

//PROPERTIES
const PROPERTY_CONTEXTUAL = 'contextual';
const PROPERTY_DATE = 'date';

export class Processor {

    private _properties: { [identifier: string]: Property } = {}; //Keys are properties, identifiers are classifiers

    /**
     * Add a property to the processor. Each input will have a property mapped to it
     * @param identifier 
     */
    public addProperty(identifier: string, is_optional: boolean) {

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
    }

    /**
     * Add a document to the classifier for an identifier based on action type
     * @param identifier 
     * @param action_type 
     * @param sample_data 
     */
    public addDocument(identifier, action_type, sample_data) {
        var classifier = (this._properties[identifier]) ? this._properties[identifier] : null;
        if (!classifier) {
            this.raiseError(this.ERROR_PROPERTY_NOT_EXISTS(identifier));
            return;
        }
        //Initialize the classifiers with sufficient weight to warrant null as default for mismatch
        this._properties[identifier].classifier.addDocument(VALUE_NULL, VALUE_NULL);
        this._properties[identifier].classifier.addDocument(sample_data, action_type);
    }

    /**
     * Train all the classifiers when this method is called
     */
    public train() {
        for (var identifier in this._properties) {
            this._properties[identifier].classifier.train();
        }
    }

    //INPUT PROCESSORS
    public process(input): {[key:string] :string} {
        return this.process_meta_1(input, this.process_meta_0(input)).flatten();
    }

    private process_meta_0(input): Meta_0_Output {
        var output = {};
        for (var identifier in this._properties) {
            output[identifier] = this._properties[identifier].classifier.classify(input);
        }
        return new Meta_0_Output(output);
    }

    private process_meta_1(input, meta_0_output: Meta_0_Output): Meta_1_Output {
        var is_contextual = this.is_contextual(meta_0_output);
        var start_date = this.get_date(input);
        var end_date = this.get_end_date(input);
        return new Meta_1_Output(meta_0_output, is_contextual, start_date, this.get_end_date(input));
    }

    //PRIVATE INTERNAL FUNCTIONS
    private is_contextual(meta_0_output: Meta_0_Output): boolean {
        var null_props = meta_0_output.get_null_properties();
        for (var key in null_props) {
            var null_prop = null_props[key];
            //We determine the meta_0 output to be contextual when a non optional property is null
            if (this._properties[null_prop] && (!this._properties[null_prop].optional)) {
                return true;
            }
        }
        return false;
    }

    private get_date(input: string): string {
        var op = VALUE_NULL;
        var date = chrono.parseDate(input);
        if (date) {
            var dt = new Date(date);
            if (dt) {
                op = dt.getDate() + '/' + (dt.getMonth() + 1) + '/' + dt.getFullYear();
            }
        }
        return op;
    }

    private get_end_date(input: string): string {
        var results = chrono.parse(input)
        if (!results[0] || !results[0].end) {
            return VALUE_NULL;
        }
        var op = VALUE_NULL;
        var date = results[0].end.date()
        var dt = new Date(date);
        if (dt) {
            op = dt.getDate() + '/' + (dt.getMonth() + 1) + '/' + dt.getFullYear();
        }
        return op;
    }

    //ERROR HANDLING
    private ERROR_PROPERTY_EXISTS(identifier) {
        return `Error: The property ${identifier} already exists.`
    };
    private ERROR_INVALID_PROPERTY(identifier) {
        return `Error: The property ${identifier} is invalid.`
    };
    private ERROR_PROPERTY_NOT_EXISTS(identifier) {
        return `Error: The property ${identifier} does not exist.`
    };
    private _error_handler = null;

    private raiseError(error) {
        var t = typeof this._error_handler;
        if (typeof this._error_handler == 'function') {
            this._error_handler(error);
        }

    }
    public onError(handler: Function) {
        this._error_handler = handler;
    }
}

class Property {
    public classifier: natural.BayesClassifier;
    public optional: boolean;
    constructor(classifier, optional) {
        this.classifier = classifier;
        this.optional = optional;
    }
}

class Meta_0_Output implements Meta_n_Output{
    public data: { [idenitifier: string]: string }
    constructor(data: { [idenitifier: string]: string }) {
        this.data = data;
    }

    public get_null_properties(): string[] {
        var nulls = [];
        for (var prop in this.data) {
            if (this.data[prop] === VALUE_NULL) {
                nulls.push(prop);
            }
        }
        return nulls;
    }

    flatten(){
        return this.data;
    }
}
class Meta_1_Output implements Meta_n_Output {
    public meta_0_output: Meta_0_Output;
    public contextual: boolean;
    public starttime: string;
    public endtime: string;

    constructor(meta_0_output: Meta_0_Output, contextual: boolean, starttime: string = VALUE_NULL, endtime: string = VALUE_NULL) {
        this.meta_0_output = meta_0_output;
        this.contextual = contextual;
        this.starttime = starttime;
        this.endtime = endtime;
    }
    //Return start time as the default
    public get_time() {
        return this.starttime;
    }

    public flatten(){
        var output = this.meta_0_output.data;
        output.contextual = String(this.contextual);
        output.starttime = this.starttime;
        output.endtime = this.endtime;
        return output;
    }
}

interface Meta_n_Output {
    flatten():{[key:string] :string};
}