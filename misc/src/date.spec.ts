/**
 * @description Unit tests for date
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */
import { parseDate } from "./date";

describe("date", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("parseDate", () => {
        it("Should parse string date", () => {
            const date = parseDate("2021-01-01");
            expect(date).toBeInstanceOf(Date);
            expect(date.getFullYear()).toBe(2021);
            expect(date.getMonth()).toBe(0);
            expect(date.getDate()).toBe(1);  
        })
    
        it("Should parse timestamps", () => {
            const date = parseDate(1580860800000); //2020-02-05
            expect(date).toBeInstanceOf(Date);
            expect(date.getFullYear()).toBe(2020);
            expect(date.getMonth()).toBe(1);
            expect(date.getDate()).toBe(5);  
        })

        it("Should return the same object if it's already a Date object", () => {
            const date = new Date();
            expect(parseDate(date)).toBe(date);
        })
    })
})