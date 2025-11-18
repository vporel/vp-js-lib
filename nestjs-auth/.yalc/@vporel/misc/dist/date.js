"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = parseDate;
exports.formatDate = formatDate;
const date_fns_1 = require("date-fns");
function parseDate(date) {
    return typeof date == "string" ? (0, date_fns_1.parseISO)(date) : (typeof date == "number" ? new Date(date) : date);
}
function formatDate(date, format) {
    if (date == undefined)
        return "undefined";
    return (0, date_fns_1.format)(parseDate(date), format);
}
