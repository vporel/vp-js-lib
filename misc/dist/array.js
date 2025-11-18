"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.range = range;
function range(min, max) {
    const array = [];
    for (let i = min; i <= max; i++)
        array.push(i);
    return array;
}
