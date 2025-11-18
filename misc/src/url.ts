
/**
 * Create a search string including the current path search options
 * @param params Options to add
 */
export function getUrlSearchString(params: Record<string, any>){
    const urlParams = new URLSearchParams(window.location.search) //Get the current parameters
    Object.keys(params).forEach(key => {
        if(params[key] != undefined && params[key] !== null && params[key] != "")
            urlParams.set(key, params[key])
        else 
            urlParams.delete(key) 
    })
    return urlParams.toString()
}