"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBool = parseBool;
function parseBool(value) {
    return (value == "true" || value == 1 || value == true) ? true : false;
}
