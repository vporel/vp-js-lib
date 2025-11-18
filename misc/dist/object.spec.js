"use strict";
/**
 * @description Unit tests for object
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
const object_1 = require("./object");
describe("object", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe("getKeysDeepJoined", () => {
        it("Should return the keys of an object", () => {
            const obj = {
                a: {
                    b: {
                        c: 1
                    },
                    d: 2
                },
                e: 3
            };
            expect((0, object_1.getKeysDeepJoined)(obj)).toEqual(["a.b.c", "a.d", "e"]);
        });
    });
});
