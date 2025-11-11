"use strict";
/**
 * @description Methods for objects manipulation
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepMerge = deepMerge;
exports.objectFromProperties = objectFromProperties;
exports.getKeysDeepJoined = getKeysDeepJoined;
/**
 * @description Merge two objects deeply, the source object will override the target object
 */
function deepMerge(target, source, options) {
    if (!source || !target)
        return target;
    const _target = target;
    const _source = source;
    for (let key in _source) {
        if (target.hasOwnProperty(key) || !options?.onlyExistingKeys) {
            if (typeof _source[key] === 'object' && !Array.isArray(_source[key])) {
                if (!_target[key])
                    _target[key] = {};
                deepMerge(_target[key], _source[key]);
            }
            else {
                _target[key] = _source[key];
            }
        }
    }
    return _target;
}
;
/**
 * @description Extract an object from another object using a list of keys
 */
function objectFromProperties(keys, sourceObject) {
    const extractedObject = {};
    for (let key of keys)
        extractedObject[key] = sourceObject ? sourceObject[key] : "";
    return extractedObject;
}
/**
 * @description Get an array with the object keys joined by dots
 * @param obj
 * @returns
 */
function getKeysDeepJoined(obj, seperator = ".") {
    const list = [];
    for (const key in obj) {
        if (obj[key] == null || typeof obj[key] != "object")
            list.push(key);
        else {
            const nestedObjectKeysJoined = getKeysDeepJoined(obj[key]);
            for (const key2 of nestedObjectKeysJoined)
                list.push(key + seperator + key2);
        }
    }
    return list;
}
