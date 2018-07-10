var process = require('process');
var stdin = process.openStdin();
var bot = require('./apps/expedition/bots/attendance-bot/bot');
var sessions = [];

stdin.addListener("data", function (d) {
    var body = {
        text: d.toString().trim()
    }
    bot.process_input(body).then(
        (resolved) => {
            console.log(resolved);
        },
        (rejected) => {
            console.log(rejected);
        }
    );
});