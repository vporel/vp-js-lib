"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEntityId = getEntityId;
exports.compareEntities = compareEntities;
exports.getModelName = getModelName;
exports.transformObjectToUpdate = transformObjectToUpdate;
/**
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 * @description This file contains some helpers for mongoose
 */
const mongoose_1 = require("mongoose");
/**
 * Get a database entity id as pure string
 */
function getEntityId(obj) {
    return (0, mongoose_1.isObjectIdOrHexString)(obj)
        ? obj.toString()
        : (typeof obj == "object"
            ? obj._id.toString()
            : obj);
}
/**
 * Compare two database entities
 */
function compareEntities(objOrId1, objOrId2) {
    const obj1Id = getEntityId(objOrId1);
    const obj2Id = getEntityId(objOrId2);
    return obj1Id == obj2Id;
}
function getModelName(instance) {
    return instance.constructor.modelName;
}
/**
 * Transform an object to an object that can be used to update a document in the database
 *
 * Example
 *
 * {name: "John", address: {city: "New York", country: "USA"}} => {name: "John", "address.city": "New York", "address.country": "USA"}
 */
function transformObjectToUpdate(obj) {
    const newObj = {};
    for (const key in obj) {
        if (obj[key] == null || typeof obj[key] != "object" || Array.isArray(obj[key]) || obj[key] instanceof Date)
            newObj[key] = obj[key];
        else {
            const nestedObjectTransformed = transformObjectToUpdate(obj[key]);
            for (const key2 in nestedObjectTransformed)
                newObj[key + "." + key2] = nestedObjectTransformed[key2];
        }
    }
    return newObj;
}
