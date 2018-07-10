"use strict";
///<reference path="./Bot.class.ts"/>
var Bot_class_1 = require("./Bot.class");
var SessionManager = (function () {
    function SessionManager() {
        this._sessions = {};
    }
    SessionManager.get_instance = function () {
        if (SessionManager._instance === null) {
            SessionManager._instance = new SessionManager();
        }
        return SessionManager._instance;
    };
    SessionManager.prototype.get_bot = function (id) {
        if (!this._sessions[id]) {
            this._sessions[id] = new Bot_class_1["default"]();
        }
        return this._sessions[id];
    };
    SessionManager._instance = null;
    return SessionManager;
}());
module.exports = SessionManager;
