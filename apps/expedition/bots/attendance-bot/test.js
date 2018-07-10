var bot = require('./bot.js');
var process_input = bot.process_input;

process_input({
    from: 'test',
    text: 'get attendance for today'
}).then(
    (data) => {
        console.log(data);
    }, (err) => {
        console.log(err);
    });

// process_input({ from: 'test', text: 'for Saturday 27th Feb insert attendance' }).then(
//     (data) => {
//         console.log(data);
//     }, (err) => {
//         console.log(err);
//     });
// process_input({ from: 'test', text: 'Elliot Koh' }).then(
//     (response) => {
//         console.log(response);
//     }, (err) => {
//         console.log('An error has occurred');
//         console.log(err);
//     });
// process_input({ from: 'test', text: 'Conrad Koh' }).then(
//     (response) => {
//         console.log(response);
//     }, (err) => {
//         console.log('An error has occurred');
//         console.log(err);
//     });
// process_input({ from: 'test', text: 'end' }).then(
//     (data) => {
//         console.log(data);
//     }, (err) => {
//         console.log(err);
//     });