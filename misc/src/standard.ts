
export function parseBool(value: string|number|boolean): boolean{
    return (value == "true" || value == 1 || value == true) ? true : false
}