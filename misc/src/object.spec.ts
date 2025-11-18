/**
 * @description Unit tests for object
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */

import { getKeysDeepJoined } from "./object";

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
            }
            expect(getKeysDeepJoined(obj)).toEqual(["a.b.c", "a.d", "e"]);
        });
    });
});