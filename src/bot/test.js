// var Processor = require('./Processor').Processor;
// var processor = new Processor();
// processor.onError((error) => {
//     console.log(error);
// })
// const PROPERTY_DIRECTIVE = 'directive';
// const PROPERTY_MODULE = 'module';
// const PROPERTY_CONVERSATION_TYPE = 'conversation_type';
// const PROPERTY_ACTION = 'action';

// processor.addProperty(PROPERTY_DIRECTIVE);
// processor.addDocument(PROPERTY_DIRECTIVE, 'escape', 'end');
// processor.addDocument(PROPERTY_DIRECTIVE, 'escape', 'terminate');
// processor.addDocument(PROPERTY_DIRECTIVE, 'escape', 'quit');

// processor.addProperty(PROPERTY_MODULE);
// processor.addDocument(PROPERTY_MODULE, 'attendance', 'attendance');

// processor.addProperty(PROPERTY_ACTION);
// processor.addDocument(PROPERTY_ACTION, 'get', 'get');
// processor.addDocument(PROPERTY_ACTION, 'insert', 'insert');
// processor.addDocument(PROPERTY_ACTION, 'insert', 'update');
// processor.addDocument(PROPERTY_ACTION, 'summarize', 'summarize');
// processor.addDocument(PROPERTY_ACTION, 'summarize', 'summary');

// processor.train();
// var x = processor.process('attendance for 19th july');
// console.log(x);

var Processor = require('./Processor').Processor;
var processor = new Processor();
processor.onError((error) => {
    console.log(error);
})
const PROPERTY_DIRECTIVE = 'directive';
const PROPERTY_MODULE = 'module';
const PROPERTY_CONVERSATION_TYPE = 'conversation_type';
const PROPERTY_ACTION = 'action';

processor.addProperty(PROPERTY_DIRECTIVE, true);
processor.addDocument(PROPERTY_DIRECTIVE, 'escape', 'end');
processor.addDocument(PROPERTY_DIRECTIVE, 'escape', 'terminate');
processor.addDocument(PROPERTY_DIRECTIVE, 'escape', 'quit');

processor.addProperty(PROPERTY_MODULE);
processor.addDocument(PROPERTY_MODULE, 'attendance', 'attendance');

processor.addProperty(PROPERTY_ACTION);
processor.addDocument(PROPERTY_ACTION, 'get', 'get');
processor.addDocument(PROPERTY_ACTION, 'insert', 'insert');
processor.addDocument(PROPERTY_ACTION, 'insert', 'update');
processor.addDocument(PROPERTY_ACTION, 'summarize', 'summarize');
processor.addDocument(PROPERTY_ACTION, 'summarize', 'summary');

processor.train();
var x = processor.process('attendance summary for friendship day');
console.log(x);