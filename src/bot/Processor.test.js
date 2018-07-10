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
var input = 'attendance summary 2nd September 2017';
var op = processor.process(input);
if (
    op.directive === 'null' &&
    op.module === 'attendance' &&
    op.action === 'summarize' &&
    op.contextual === 'false' &&
    op.starttime === '2/9/2017' &&
    op.endtime === 'null'
) { console.log('pass') } else { console.log('failed'); console.log(op) };


var input = 'update attendance for 2nd September 2017';
var op = processor.process(input);
if (
    op.directive === 'null' &&
    op.module === 'attendance' &&
    op.action === 'insert' &&
    op.contextual === 'false' &&
    op.starttime === '2/9/2017' &&
    op.endtime === 'null'
) { console.log('pass') } else { console.log('failed'); console.log(op) };

var input = 'get attendance for 2nd September 2017';
var op = processor.process(input);
if (
    op.directive === 'null' &&
    op.module === 'attendance' &&
    op.action === 'get' &&
    op.contextual === 'false' &&
    op.starttime === '2/9/2017' &&
    op.endtime === 'null'
) { console.log('pass') } else { console.log('failed'); console.log(op) };

var input = 'end';
var op = processor.process(input);
if (
    op.directive === 'escape' &&
    op.module === 'null' &&
    op.action === 'null' &&
    op.contextual === 'true' &&
    op.starttime === 'null' &&
    op.endtime === 'null'
) { console.log('pass') } else { console.log('failed'); console.log(op) };

var input = 'terminate';
var op = processor.process(input);
if (
    op.directive === 'escape' &&
    op.module === 'null' &&
    op.action === 'null' &&
    op.contextual === 'true' &&
    op.starttime === 'null' &&
    op.endtime === 'null'
) { console.log('pass') } else { console.log('failed'); console.log(op) };

var input = 'quit';
var op = processor.process(input);
if (
    op.directive === 'escape' &&
    op.module === 'null' &&
    op.action === 'null' &&
    op.contextual === 'true' &&
    op.starttime === 'null' &&
    op.endtime === 'null'
) { console.log('pass') } else { console.log('failed'); console.log(op) };
