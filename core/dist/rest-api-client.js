"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function manageResponse(response, queryOptions) {
    let responseData = await response.json();
    //Transform the data
    if (response.ok &&
        response.status >= 200 &&
        response.status < 300 &&
        queryOptions?.transformResponseData) {
        responseData = queryOptions.transformResponseData(responseData);
    }
    return {
        ok: response.ok,
        data: responseData,
    };
}
async function serverQuery(method, url, data, options) {
    const requestOptions = { method };
    if (method != "GET")
        requestOptions.body = JSON.stringify(data ?? {});
    requestOptions.headers = {
        "Content-Type": "application/json",
        accept: "application/json",
    };
    if (options?.Authorization)
        requestOptions.headers.Authorization = options.Authorization;
    try {
        return await manageResponse(await fetch(url, requestOptions), options);
    }
    catch (error) {
        return {
            ok: false,
            data: { message: error.message, statusCode: 0, error: error },
        };
    }
}
/**
 *
 * @param method
 * @param url The data are stringified and sent as form data
 * @param data
 * @param files
 * @param options
 * @returns
 */
async function serverQueryWithFiles(method, url, data, files, options) {
    const formData = new FormData();
    if (data)
        formData.append("data", JSON.stringify(data));
    for (let file of files) {
        if (file.file)
            formData.append(file.name, file.file);
    }
    const requestOptions = {
        method,
        body: formData,
    };
    requestOptions.headers = {
        accept: "application/json",
    };
    if (options?.Authorization)
        requestOptions.headers.Authorization = options.Authorization;
    return await manageResponse(await fetch(url, requestOptions), options);
}
const RestApiClient = ({ host, Authorization, }) => {
    let _host = typeof host == "string" ? host : process.env.NODE_ENV == "development" ? host.dev : host.prod;
    function addHostToUrl(url) {
        return _host + (url.startsWith("/") || _host.endsWith("/") ? url : "/" + url);
    }
    return {
        async get(url, urlData, options) {
            if (urlData) {
                const formattedUrlData = {};
                //If the url data has nested objects, create one unique object with the keys joined by '_'
                for (let key in urlData) {
                    if (typeof urlData[key] == "object") {
                        for (let key2 in urlData[key])
                            formattedUrlData[key + "_" + key2] = urlData[key][key2];
                    }
                    else
                        formattedUrlData[key] = urlData[key];
                }
                url = url + "?" + new URLSearchParams(formattedUrlData).toString();
            }
            return await serverQuery("GET", addHostToUrl(url), undefined, {
                ...options,
                Authorization: Authorization ? await Authorization() : "",
            });
        },
        async post(url, data, options) {
            return await serverQuery("POST", addHostToUrl(url), data, {
                ...options,
                Authorization: Authorization ? await Authorization() : "",
            });
        },
        async postWithFiles(url, data, files, options) {
            return await serverQueryWithFiles("POST", addHostToUrl(url), data, files, {
                ...options,
                Authorization: Authorization ? await Authorization() : "",
            });
        },
        async patch(url, data, options) {
            return await serverQuery("PATCH", addHostToUrl(url), data, {
                ...options,
                Authorization: Authorization ? await Authorization() : "",
            });
        },
        async patchWithFiles(url, data, files, options) {
            return await serverQueryWithFiles("PATCH", addHostToUrl(url), data, files, {
                ...options,
                Authorization: Authorization ? await Authorization() : "",
            });
        },
        async delete(url, data, options) {
            return await serverQuery("DELETE", addHostToUrl(url), data, {
                ...options,
                Authorization: Authorization ? await Authorization() : "",
            });
        },
    };
};
exports.default = RestApiClient;
