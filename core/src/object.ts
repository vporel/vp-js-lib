
/**
 * @description Methods for objects manipulation
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */

/**
 * @description Merge two objects deeply, the source object will override the target object
 */
export function deepMerge<TargetType = any, SourceType = any>(target: TargetType, source: SourceType, options?: {onlyExistingKeys?: boolean}): TargetType{
    if(!source || !target) return target
    const _target: any = target 
    const _source: any = source 
    for (let key in _source) {
        if ((target as Object).hasOwnProperty(key) || !options?.onlyExistingKeys) {
            if (typeof _source[key] === 'object' && !Array.isArray(_source[key])) {
                if (!_target[key]) _target[key] = {};
                deepMerge(_target[key], _source[key]);
            } else {
                _target[key] = _source[key];
            }
        }
    }
    return _target;
};

/**
 * @description Extract an object from another object using a list of keys
 */
export function objectFromProperties(keys: string[], sourceObject: any|undefined|null): object{
    const extractedObject: any = {}
    for(let key of keys) extractedObject[key] = sourceObject ? sourceObject[key] : ""
    return extractedObject as object
}

/**
 * @description Get an array with the object keys joined by dots
 * @param obj 
 * @returns 
 */
export function getKeysDeepJoined(obj: object, seperator: string = "."): string[]{
    const list = []
    for(const key in obj){
        if((obj as any)[key] == null || typeof (obj as any)[key] != "object")
            list.push(key)
        else{
            const nestedObjectKeysJoined = getKeysDeepJoined((obj as any)[key])
            for(const key2 of nestedObjectKeysJoined)
                list.push(key+seperator+key2)
        }
    }
    return list
}