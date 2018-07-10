var config = require(__dirname + '/../../config.js');
var attendance_db = require(config.dirroot + '/sheets/attendance.js').db;
var members_db = require(config.dirroot + '/sheets/members.js').db;

var SessionManager = require('./SessionManager.class');
var AttendanceManager = require('./AttendanceManager.class').AttendanceManager;
var AttendanceManagerRecord = require('./AttendanceManager.class').Record;
var session_manager = SessionManager.get_instance();
var attendance_manager = new AttendanceManager(attendance_db, members_db);


function process_input(body) {
    return new Promise((resolve, reject) => {
        var bot = session_manager.get_bot(body.from); //Get the user's session

        bot.parse(body.text, (err, response) => {
            //Guard against parsing errors
            if (err) {
                console.log(err);
                return;
            }

            //Check the action and respond accordingly
            switch (response.module) {
                case 'attendance':
                    switch (response.action_type) {
                        case undefined:
                        case 'default':
                            switch (response.action) {
                                case 'default': //default to get when unknown is the action
                                case 'get':
                                    attendance_manager.get_attendance(response.date).then(
                                        (resolved_data) => {
                                            var attendance_list = resolved_data;
                                            var op = 'Showing attendance record for ' + response.date + "\n";
                                            op += attendance_list;
                                            resolve(op);
                                        },
                                        (rejected_data) => {
                                            reject(rejected_data);
                                        });
                                    break;
                                case 'insert':
                                    if (response.conversation_type == 'contextual') {
                                        //Format the response
                                        attendance_manager.acquire_record(response.date, response.context.data, response.data).then((record) => {
                                                //Insert data if the context of the conversation has been set.
                                                attendance_manager.insert_attendance(record).then(
                                                    //Resolved
                                                    (user) => {
                                                        resolve('Response recorded for ' + user.name + ' with type ' + user.type);
                                                    },
                                                    //Rejected
                                                    (err) => {
                                                        console.log('Error: ' + err);
                                                        reject('Failed to record response for ' + response.data);
                                                    });
                                            },
                                            (err) => {
                                                reject('Failed to record response: ' + err);
                                            });

                                    } else {
                                        resolve('Recording attendance records for ' + response.date);
                                    }
                                    break;
                                case 'summarize':
                                    var op = 'Showing attendance summary for ' + response.date + ":\n";
                                    attendance_manager.get_attendance_summary(response.date).then(
                                        (resolved_data) => {
                                            op += (resolved_data) ? resolved_data : 'No records found.';
                                            resolve(op);
                                        },
                                        (rejected_data) => {
                                            reject(rejected_data);
                                        });
                                    break;
                                default:
                                    reject('Failed to map the action: ' + response.action);
                                    break;
                            }
                            break;
                        case 'escape':
                            resolve('Session for module ' + response.module + ' was terminated');
                            break;
                        default:
                            reject('Unhandled action type');
                            break;
                    }
                    break;
                default:
                    //Set the configurations for the default handler
                    switch (response.action_type) {
                        //Escape action types do not require modules
                        case 'escape':
                            var response = (response.module) ? 'Session for module ' + response.module + ' was terminated' : 'No module was selected.';
                            resolve(response);
                            break;
                        default:
                            reject('Unknown module');
                            break;
                    }
                    break;
            }
            //reject('Uncaught rejection occurred.');
        });
    });

}

module.exports = {
    process_input: process_input
}