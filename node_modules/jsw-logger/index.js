"use strict";
var JSW_Logger_1 = require("./src/JSW-Logger");
exports.JSWLogger = JSW_Logger_1.JSWLogger;
var decorators_1 = require("./src/decorators");
exports.LogMethod = decorators_1.LogMethod;
try {
    if (window) {
        window["JSWLogger"] = JSW_Logger_1.JSWLogger; // Logger.default;
    }
}
catch (e) {
    (console.debug || console.log)("window not found -> not a browser environment");
}

//# sourceMappingURL=index.js.map
