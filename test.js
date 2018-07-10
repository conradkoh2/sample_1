// var AttendanceManager = require('./apps/expedition/bots/attendance-bot/AttendanceManager.class').AttendanceManager;
// var attdb = require('./apps/expedition/sheets/attendance').db;
// var memdb = require('./apps/expedition/sheets/members').db;
// var attendance_manager = new AttendanceManager(attdb, memdb);
// var response = {
//     date: '123',
//     context: {
//         data: '123'
//     },
//     data: 'conrad'
// };
// attendance_manager.acquire_record(response.date, response.context.data, response.data).then((record) => {
//         //Insert data if the context of the conversation has been set.
//         attendance_manager.insert_attendance(record).then(
//             //Resolved
//             (data) => {
//                 console.log('Response recorded for ' + response.data);
//             },
//             //Rejected
//             (err) => {
//                 console.log('Error: ' + err);
//                 console.log('Failed to record response for ' + response.data);
//             });
//     },
//     (err) => {
//         console.log('Failed to record response: ' + err);
//     });

var process = require('process');
var stdin = process.openStdin();
var bot = require('./apps/expedition/bots/attendance-bot/bot');
var sessions = [];
var p1 = {
    text: 'mark attendance for today'
}

var p2 = {
    text: 'abel'
}
bot.process_input(p1).then((data) => {
    console.log(data);
    bot.process_input(p2).then((data) => {
        console.log(data);
    })
})