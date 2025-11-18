"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @description Unit tests for standard
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */
const standard_1 = require("./standard");
describe('parseBool', () => {
    it('should return true for string "true" or number 1 or boolean true', () => {
        expect((0, standard_1.parseBool)("true")).toBe(true);
        expect((0, standard_1.parseBool)(1)).toBe(true);
        expect((0, standard_1.parseBool)(true)).toBe(true);
    });
    it('should return false for string "false", number 0 or boolean false', () => {
        expect((0, standard_1.parseBool)("false")).toBe(false);
        expect((0, standard_1.parseBool)(0)).toBe(false);
        expect((0, standard_1.parseBool)(false)).toBe(false);
    });
    it('should return false for an empty string, other string or other number', () => {
        expect((0, standard_1.parseBool)("")).toBe(false);
        expect((0, standard_1.parseBool)("random")).toBe(false);
        expect((0, standard_1.parseBool)(123)).toBe(false);
    });
});
