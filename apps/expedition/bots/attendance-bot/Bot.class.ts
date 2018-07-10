import natural = require('natural');
import chrono = require('chrono-node');

export default class Bot {
    private ERROR_UNMAPPED_CONVERSATION_TYPE = "Error: Conversation type unmatched.";
    private ACTIONTYPE_ESCAPE = 'escape';
    private module_classifier = new natural.BayesClassifier();
    private action_classifier = new natural.BayesClassifier();
    private time_classifier = new natural.BayesClassifier();
    private actiontype_classifier = new natural.BayesClassifier();

    private modules_map = { 'default': ['default'], 'attendance': ['attendance'] }; //key is the source word, value is the target module
    private actions_map = { 'default': ['default'], 'get': ['get'], 'insert': ['mark', 'insert', 'update'], 'summarize': ['summary','summarize'] };
    private actiontypes_map = { 'default': ['default'], 'escape': ['terminate', 'end'] };
    private conversation_types = { 'default': 'default', 'contextual': 'contextual' }
    private months = [
        'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
        'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
    ];
    private times_map = {
        'present': 'present',
        'past': 'past'
    }
    private contextManager: ContextManager = new ContextManager();

    //Event handlers
    private listeners = {}; //Key is eventid, Value is callback
    private completion_handler = null;
    private error_handler = null;

    constructor() {
        this.init();
    }

    private init() {
        //Set the classifier options
        this.module_classifier.setOptions({ keepStops: true });
        this.action_classifier.setOptions({ keepStops: true });
        this.time_classifier.setOptions({ keepStops: true });
        this.actiontype_classifier.setOptions({ keepStops: true });

        //Load the training programme
        for (var i in this.modules_map) {
            //the key is the input, and the value is the training result
            this.module_classifier.addDocument(this.modules_map[i].join(" "), i); //We choose to join here because the classifier will use the stemmer if it is a raw string
        }

        for (var i in this.actions_map) {
            //the key is the input, and the value is the training result
            this.action_classifier.addDocument(this.actions_map[i].join(" "), i); //We choose to join here because the classifier will use the stemmer if it is a raw string
        }

        for (var i in this.actiontypes_map) {
            this.actiontype_classifier.addDocument(this.actiontypes_map[i].join(" "), i); //We choose to join here because the classifier will use the stemmer if it is a raw string
        }

        this.time_classifier.addDocument(this.months.join(" "), this.times_map.past); //Anything that has time attached assume as past
        this.time_classifier.addDocument('now', this.times_map.present);
        this.time_classifier.addDocument('today', this.times_map.present);

        this.module_classifier.train();
        this.action_classifier.train();
        this.time_classifier.train();
        this.actiontype_classifier.train();
    }

    public parse(input, callback: CallBack) {
        var context = new Context();
        var data = null;
        var lastContext = this.contextManager.current();
        var conversation_type = (lastContext) ? this.conversation_types.contextual : this.conversation_types.default; //If the context is set, process contextually
        var actiontype = this.actiontype_classifier.classify(input);
        var date = Bot.get_date(input);

        switch (conversation_type) {
            case this.conversation_types.contextual:
                context = lastContext;
                if (actiontype == this.ACTIONTYPE_ESCAPE) {
                    //If terminate is called in a contextual conversation, we terminate the current context
                    this.contextManager.clearData();
                }
                else {
                    context.date = (date) ? date : lastContext.date; //Update the date of the current context if there is an entry
                    data = input; //Set the data as the input when the data is contextual
                }
                break;
            case this.conversation_types.default:
                switch (actiontype) {
                    case this.ACTIONTYPE_ESCAPE:
                        //Do nothing
                        break;
                    default: //Check if escape was given. If so, do not record as a context
                        //If the context is not set, then set the context
                        context.module = this.module_classifier.classify(input);
                        context.action = this.action_classifier.classify(input);
                        context.time = this.time_classifier.classify(input);
                        context.date = date;

                        //Process the input and remove classified tokens
                        var remove_tokens = [context.module, context.action];
                        var tokens = input.split(" ");
                        data = tokens.filter(function (item) {
                            var index = remove_tokens.indexOf(item.toLowerCase());
                            if (index < 0) {
                                return true; //Include tokens that are not found
                            }
                            else {
                                remove_tokens.splice(index, 1); //Remove the found token only the first time it was been found
                                return false; //Do not include tokens that are found
                            }
                        }).join(" ");

                        //Preseve the processed context data
                        context.data = data;
                        if(context.module && context.action){
                            this.contextManager.push(context); // Add the context if context was processed
                        }
                        break;
                }
                break;
            default:
                break;
        }
        callback(null, new Response(context.module, context.action, conversation_type, actiontype, data, lastContext, context.date));
    }

    /**
     * Process date time to a standardized format
     * @param date 
     */
    private static get_date(date){
        var op = null;
        var date = chrono.parseDate(date);
        if(date){
            var dt = new Date(date);
            if(dt){
                op = dt.getDate() + '/' + (dt.getMonth() + 1) + '/' + dt.getFullYear();
            }
        }
        return op;
    }
}
export class Context {
    public module; //A feature of the bot the user is accessing
    public action; //The requested action for the bot to perform
    public time; //A time reference 
    public actiontype; //The descriptor for the action
    public data; //The data that the context contains
    public date; //The date that was stored in the context
}

export class ContextManager {
    private data: Context[]; //Output should be used as a queue
    constructor() {
        this.data = [];
    }
    public push(val: Context) {
        this.data.push(val); //Add an item to the queue
    }
    public clearData() {
        this.data = [];
    }
    public shift(): Context {
        return this.data.shift(); //Remove an item from the queue
    }
    public isEmpty() {
        return (this.data.length === 0);
    }
    public current() {
        return (this.data.length === 0) ? null : this.data[0];
    }
}

export class DIRECTIVES {
    public static end = 'end';
}

export class Response {
    public action;
    public module;
    public conversation_type;
    public action_type;
    public data;
    public context: Context;
    public date;

    constructor(module, action, conversation_type, action_type, data, context, date = null) {
        this.action = action;
        this.module = module;
        this.conversation_type = conversation_type;
        this.action_type = action_type;
        this.data = data;
        this.context = context;
        this.date = date;
    }
}

export interface CallBack { (err: string, response: Response) }