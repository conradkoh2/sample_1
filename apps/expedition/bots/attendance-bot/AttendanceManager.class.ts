declare var __dirname: string;

//DB Headers
const HEADER_DATE = 'Date';
const HEADER_CONTEXT = 'Context';
const HEADER_NAME = 'Name';
const HEADER_TYPE = 'Type';

export class AttendanceManager {
    private _attendance_records_db: DB;
    private _members_db: DB;

    public constructor(attendance_records_db: DB, members_db: DB) {
        this._attendance_records_db = attendance_records_db;
        this._members_db = members_db;
    }

    public async get_members() {
        return new Promise<Array<{ name: String, year: String, role: String }>>((resolve, reject) => {
            var users = [];
            this._members_db.get_rows(function (err, rows) {
                if (err) {
                    reject(err);
                }
                else {
                    for (var index in rows) {
                        var user = {
                            name: '',
                            year: '',
                            role: ''
                        };
                        user.name = rows[index][0];
                        user.year = rows[index][1];
                        user.role = rows[index][2];
                        users.push(user);
                    }
                }
                resolve(users);
            });
        })
    }

    /**
     * Attempt to acquire a record for a user
     * @param name 
     */
    public async acquire_record(date, context, name) {
        var members = await this.get_members();
        var matches = await this.get_closest_matches(name, members);
        for (var key in matches) {
            var record = new Record(date, context, matches[key]['name'], matches[key]['role']);
            return record; //return the record based on the first item in the array
        }
        return new Record(date, context, name, 'NEW');
    }
    public insert_attendance(record: Record) {
        return new Promise((resolve, reject) => {
            var rows = [];
            var row = record.format_as_row();
            var user = { name: '', type: '' };
            rows.push(row);
            this._attendance_records_db.insert_rows(rows, (err, response) => {
                if (err) {
                    reject(err);
                }
                else {
                    user.name = record.get_name();
                    user.type = record.get_type();
                    resolve(user);
                }
            });
        })
    }
    public get_attendance_summary(date: string) {
        return new Promise((resolve, reject) => {
            this._attendance_records_db.get_rows((err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                var results = {};
                for (var index in res) {
                    var group: string = res[index][3];
                    if (typeof (group) != 'undefined') {
                        if (res[index][0] == date) {
                            results[group] = (results[group]) ? results[group] : 0; //Initialize group count if not initialized
                            results[group] += 1; //Increment the group
                        }
                    }
                }

                //Format the summary
                var op = "";
                for (var group in results) {
                    op += group + ": " + results[group] + "\n";
                }
                resolve(op.trim());
            });
        })
    }
    public get_attendance(query: string) {
        return new Promise((resolve, reject) => {
            this._attendance_records_db.get_rows((err, attendance_records) => {
                this._members_db.get_rows((err, members) => {

                    this.generate_attendance_report(query, attendance_records, members).then((results) => {
                        resolve(results);
                    },
                        (err) => {
                            reject(err);
                        });
                });
            });
        })
    }

    private format_rows_as_report(rows) {
        this._members_db.get_rows((err, members_raw) => {
            var report_store = {};
            for (var key in members_raw) {
                //Initialize keys based on type
                if ((report_store[members_raw[key][3]] === undefined)) {
                    report_store[members_raw[key][3]] = [];
                }
                report_store[members_raw[3]].push(members_raw[key]);
            }
            for (var key in rows) {
                var row = rows[key];
                this.get_closest_matches(rows[key][2], members_raw).then((members) => {
                    if (members.length == 0) {

                    }
                    else {
                        var member = members[0];
                    }
                });

            }

        })
    }

    /**
     * 
     * @param query The date query as a string
     * @param attendees All the attendee records from the google spreadsheet
     * @param members All the current member records from the google spreadsheet
     */
    private async generate_attendance_report(query, attendees, members) {
        var report = {};
        var summary = "";
        var groups_summary = {}; //The key is the grou as a string, value is the number of the attendees
        //Filter out attendees based on the date
        var query_attendees = [];
        for (var att_idx in attendees) {
            if (query == attendees[att_idx][0]) {
                query_attendees.push(attendees[att_idx]);
                //Initialize group if not initialized
                if (groups_summary[attendees[att_idx][3]] === undefined) {
                    groups_summary[attendees[att_idx][3]] = 1;
                }
                else {
                    groups_summary[attendees[att_idx][3]]++;
                }
            }
        }

        //Summarize and store the group summary
        var last = Object.keys(groups_summary).length - 1;
        Object.keys(groups_summary).map((key, index) => {
            summary += `${key}:${groups_summary[key]}`;
            if (index != last) {
                summary += ", ";
            }
        })

        for (var key in members) {
            var record = {
                name: members[key][0],
                attend: 'A'
            }
            //Initialize keys based on type
            if ((report[members[key][1]] === undefined)) {
                report[members[key][1]] = [];
            }
            report[members[key][1]].push(record);
        }

        for (var store_idx in report) {
            for (var usr_idx in report[store_idx]) {
                //Check if user was present and update accordingly
                var formalname = report[store_idx][usr_idx]['name'];
                for (var qattend_idx in query_attendees) {
                    var informalname = query_attendees[qattend_idx][2];
                    if (this.strings_match(formalname, informalname)) {
                        report[store_idx][usr_idx]['attend'] = 'P';
                    }
                }
            }
        }

        //Finally, generate and format the report
        var report_string = "";
        for (var store_idx in report) {
            report_string += '[' + store_idx + ']' + '\n'; //Add the year
            for (var usr_idx in report[store_idx]) {
                var usr = report[store_idx][usr_idx];
                report_string += usr['name'] + ' - ' + usr['attend'] + '\n';
            }
            report_string += '\n'; //Add the year
        }

        return "Summary:\n" + summary.trim() + "\n\n" + report_string.trim();
    }

    private async first_closest_member_match(name, members) {
        var matches = await this.get_closest_matches(name, members);
        if (matches.length === 0) {
            return;
        }
        return matches[0];
    }

    public get_date() {
        var date = new Date();
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
    }

    private strings_match(s1, s2) {
        var s1_token_matches = 0;
        var s2_token_matches = 0;
        var s1_tokens = s1.trim().split(' ');
        var s2_tokens = s2.trim().split(' ');
        var s1_tokens_index = {};
        var s2_tokens_index = {};
        s1_tokens.forEach(element => {
            s1_tokens_index[element.toLowerCase()] = 1;
        });
        s2_tokens.forEach(element => {
            s2_tokens_index[element.toLowerCase()] = 1;
        });
        for (var s1_token_key in s1_tokens) {
            //For s1, search in s2
            var key = s1_tokens[s1_token_key].toLowerCase();
            if (s2_tokens_index[key] === 1) {
                delete s2_tokens_index[key];
                s2_token_matches++;
            }
            if (s2_token_matches === s2_tokens.length) {
                return true;
            }
        }
        for (var s2_token_key in s2_tokens) {
            //For s1, search in s2
            var key = s2_tokens[s2_token_key].toLowerCase();
            if (s1_tokens_index[key] === 1) {
                delete s1_tokens_index[key];
                s1_token_matches++;
            }
            if (s1_token_matches === s1_tokens.length) {
                return true;
            }
        }
    }
    public get_closest_matches(name: String, userlist: Array<{ name: String, year: String, role: String }>) {
        return new Promise<Array<{}>>(function (resolve, reject) {
            var users = [];
            userlist.forEach(function (user) {
                var token_matches = 0;
                var official_name_tokens = user.name.split(' ');
                var name_tokens = name.split(' ');
                var name_tokens_index = {};
                //Index the items we are trying to look for
                name_tokens.forEach(function (name_token) {
                    name_tokens_index[name_token.toLowerCase()] = 1;
                });
                //Go through the official name tokens and try to find matches
                for (var official_name_token_i in official_name_tokens) {
                    var key = official_name_tokens[official_name_token_i].toLowerCase();
                    if (name_tokens_index[key] === 1) {
                        delete name_tokens_index[key]; //ensure that each item is only matched once
                        token_matches++;
                    }
                    if (token_matches === name_tokens.length) {
                        users.push(user);
                        break; //Terminate token search once matched
                    }
                }
            });
            resolve(users);
        });
    }
}
export class Record {
    private _date;
    private _context;
    private _name;
    private _type;

    public constructor(date, context, name, type) {
        this._date = date;
        this._context = context;
        this._name = name;
        this._type = type;
    }

    public get_name() {
        return this._name;
    }

    public get_type() {
        return this._type;
    }

    public format_as_row() {
        var row = [];
        row[0] = this._date;
        row[1] = this._context;
        row[2] = this._name;
        row[3] = this._type;
        return row;
    }
}
interface DB {
    insert_rows(rows, callback);
    row_for_key(key);
    get_rows(callback);
}