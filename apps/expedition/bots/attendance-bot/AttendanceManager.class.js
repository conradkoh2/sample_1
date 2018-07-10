"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const HEADER_DATE = 'Date';
const HEADER_CONTEXT = 'Context';
const HEADER_NAME = 'Name';
const HEADER_TYPE = 'Type';
class AttendanceManager {
    constructor(attendance_records_db, members_db) {
        this._attendance_records_db = attendance_records_db;
        this._members_db = members_db;
    }
    get_members() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
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
            });
        });
    }
    acquire_record(date, context, name) {
        return __awaiter(this, void 0, void 0, function* () {
            var members = yield this.get_members();
            var matches = yield this.get_closest_matches(name, members);
            for (var key in matches) {
                var record = new Record(date, context, matches[key]['name'], matches[key]['role']);
                return record;
            }
            return new Record(date, context, name, 'NEW');
        });
    }
    insert_attendance(record) {
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
        });
    }
    get_attendance_summary(date) {
        return new Promise((resolve, reject) => {
            this._attendance_records_db.get_rows((err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                var results = {};
                for (var index in res) {
                    var group = res[index][3];
                    if (typeof (group) != 'undefined') {
                        if (res[index][0] == date) {
                            results[group] = (results[group]) ? results[group] : 0;
                            results[group] += 1;
                        }
                    }
                }
                var op = "";
                for (var group in results) {
                    op += group + ": " + results[group] + "\n";
                }
                resolve(op.trim());
            });
        });
    }
    get_attendance(query) {
        return new Promise((resolve, reject) => {
            this._attendance_records_db.get_rows((err, attendance_records) => {
                this._members_db.get_rows((err, members) => {
                    this.generate_attendance_report(query, attendance_records, members).then((results) => {
                        resolve(results);
                    }, (err) => {
                        reject(err);
                    });
                });
            });
        });
    }
    format_rows_as_report(rows) {
        this._members_db.get_rows((err, members_raw) => {
            var report_store = {};
            for (var key in members_raw) {
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
        });
    }
    generate_attendance_report(query, attendees, members) {
        return __awaiter(this, void 0, void 0, function* () {
            var report = {};
            var summary = "";
            var groups_summary = {};
            var query_attendees = [];
            for (var att_idx in attendees) {
                if (query == attendees[att_idx][0]) {
                    query_attendees.push(attendees[att_idx]);
                    if (groups_summary[attendees[att_idx][3]] === undefined) {
                        groups_summary[attendees[att_idx][3]] = 1;
                    }
                    else {
                        groups_summary[attendees[att_idx][3]]++;
                    }
                }
            }
            var last = Object.keys(groups_summary).length - 1;
            Object.keys(groups_summary).map((key, index) => {
                summary += `${key}:${groups_summary[key]}`;
                if (index != last) {
                    summary += ", ";
                }
            });
            for (var key in members) {
                var record = {
                    name: members[key][0],
                    attend: 'A'
                };
                if ((report[members[key][1]] === undefined)) {
                    report[members[key][1]] = [];
                }
                report[members[key][1]].push(record);
            }
            for (var store_idx in report) {
                for (var usr_idx in report[store_idx]) {
                    var formalname = report[store_idx][usr_idx]['name'];
                    for (var qattend_idx in query_attendees) {
                        var informalname = query_attendees[qattend_idx][2];
                        if (this.strings_match(formalname, informalname)) {
                            report[store_idx][usr_idx]['attend'] = 'P';
                        }
                    }
                }
            }
            var report_string = "";
            for (var store_idx in report) {
                report_string += '[' + store_idx + ']' + '\n';
                for (var usr_idx in report[store_idx]) {
                    var usr = report[store_idx][usr_idx];
                    report_string += usr['name'] + ' - ' + usr['attend'] + '\n';
                }
                report_string += '\n';
            }
            return "Summary:\n" + summary.trim() + "\n\n" + report_string.trim();
        });
    }
    first_closest_member_match(name, members) {
        return __awaiter(this, void 0, void 0, function* () {
            var matches = yield this.get_closest_matches(name, members);
            if (matches.length === 0) {
                return;
            }
            return matches[0];
        });
    }
    get_date() {
        var date = new Date();
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
    }
    strings_match(s1, s2) {
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
    get_closest_matches(name, userlist) {
        return new Promise(function (resolve, reject) {
            var users = [];
            userlist.forEach(function (user) {
                var token_matches = 0;
                var official_name_tokens = user.name.split(' ');
                var name_tokens = name.split(' ');
                var name_tokens_index = {};
                name_tokens.forEach(function (name_token) {
                    name_tokens_index[name_token.toLowerCase()] = 1;
                });
                for (var official_name_token_i in official_name_tokens) {
                    var key = official_name_tokens[official_name_token_i].toLowerCase();
                    if (name_tokens_index[key] === 1) {
                        delete name_tokens_index[key];
                        token_matches++;
                    }
                    if (token_matches === name_tokens.length) {
                        users.push(user);
                        break;
                    }
                }
            });
            resolve(users);
        });
    }
}
exports.AttendanceManager = AttendanceManager;
class Record {
    constructor(date, context, name, type) {
        this._date = date;
        this._context = context;
        this._name = name;
        this._type = type;
    }
    get_name() {
        return this._name;
    }
    get_type() {
        return this._type;
    }
    format_as_row() {
        var row = [];
        row[0] = this._date;
        row[1] = this._context;
        row[2] = this._name;
        row[3] = this._type;
        return row;
    }
}
exports.Record = Record;
//# sourceMappingURL=AttendanceManager.class.js.map