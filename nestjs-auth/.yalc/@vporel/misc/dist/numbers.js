"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.formatXAF = formatXAF;
function formatCurrency(number, currency = "EUR") {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(parseInt(number));
}
function formatXAF(number) {
    return formatCurrency(number, "XAF");
}
