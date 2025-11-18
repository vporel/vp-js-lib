/**
 * @description Methods for objects manipulation
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */
/**
 * @description Merge two objects deeply, the source object will override the target object
 */
export declare function deepMerge<TargetType = any, SourceType = any>(target: TargetType, source: SourceType, options?: {
    onlyExistingKeys?: boolean;
}): TargetType;
/**
 * @description Extract an object from another object using a list of keys
 */
export declare function objectFromProperties(keys: string[], sourceObject: any | undefined | null): object;
/**
 * @description Get an array with the object keys joined by dots
 * @param obj
 * @returns
 */
export declare function getKeysDeepJoined(obj: object, seperator?: string): string[];
