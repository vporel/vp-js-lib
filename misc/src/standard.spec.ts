/**
 * @description Unit tests for standard
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */
import { parseBool } from './standard';

describe('parseBool', () => {
    it('should return true for string "true" or number 1 or boolean true', () => {
        expect(parseBool("true")).toBe(true);
        expect(parseBool(1)).toBe(true);
        expect(parseBool(true)).toBe(true);
    });

    it('should return false for string "false", number 0 or boolean false', () => {
        expect(parseBool("false")).toBe(false);
        expect(parseBool(0)).toBe(false);
        expect(parseBool(false)).toBe(false);
    });

    it('should return false for an empty string, other string or other number', () => {
        expect(parseBool("")).toBe(false);
        expect(parseBool("random")).toBe(false);
        expect(parseBool(123)).toBe(false);
    });
});