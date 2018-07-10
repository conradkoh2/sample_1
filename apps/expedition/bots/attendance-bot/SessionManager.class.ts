///<reference path="./Bot.class.ts"/>
import Bot from "./Bot.class";
class SessionManager {
    private _sessions = {};
    private static _instance = null;
    public static get_instance(): SessionManager {
        if (SessionManager._instance === null) {
            SessionManager._instance = new SessionManager();
        }
        return SessionManager._instance;
    }
    public get_bot(id): Bot {
        if (!this._sessions[id]) {
            this._sessions[id] = new Bot();
        }
        return this._sessions[id];
    }
}

export = SessionManager;