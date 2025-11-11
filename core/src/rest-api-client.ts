"use client";
/**
 * Basic functions for a server request (GET, POST, POST WITH FILES, PATCH, PATCH WITH FILES, DELETE)
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */

/**
 * The data is the error content if ok == false
 */
export type RestApiResponse<DataType> =
	| {
			ok: true;
			data: DataType;
	  }
	| {
			ok: false;
			data: { message: string; statusCode: number; error?: Error };
	  };

type QueryOptions<DataType> = {
	transformResponseData?: (data: any) => DataType;
	Authorization?: string;
};

async function manageResponse<DataType>(response: Response, queryOptions?: QueryOptions<DataType>) {
	let responseData = await response.json();
	//Transform the data
	if (
		response.ok &&
		response.status >= 200 &&
		response.status < 300 &&
		queryOptions?.transformResponseData
	) {
		responseData = queryOptions.transformResponseData(responseData);
	}
	return {
		ok: response.ok,
		data: responseData,
	};
}

async function serverQuery<DataType>(
	method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
	url: string,
	data?: Record<string, any>,
	options?: QueryOptions<DataType>
): Promise<RestApiResponse<DataType>> {
	const requestOptions: RequestInit = { method };
	if (method != "GET") requestOptions.body = JSON.stringify(data ?? {});
	requestOptions.headers = {
		"Content-Type": "application/json",
		accept: "application/json",
	};
	if (options?.Authorization) requestOptions.headers.Authorization = options.Authorization;
	try {
		return await manageResponse<DataType>(await fetch(url, requestOptions), options);
	} catch (error) {
		return {
			ok: false,
			data: { message: error.message, statusCode: 0, error: error },
		};
	}
}

export type FileType = File | { name: string; uri: string; type: string } | Blob | undefined;

type FileStruct = {
	name: string;
	file: File | { name: string; uri: string; type: string } | Blob | undefined;
};

/**
 *
 * @param method
 * @param url The data are stringified and sent as form data
 * @param data
 * @param files
 * @param options
 * @returns
 */
async function serverQueryWithFiles<DataType>(
	method: "POST" | "PATCH",
	url: string,
	data: Record<string, any>,
	files: FileStruct[],
	options?: QueryOptions<DataType>
): Promise<RestApiResponse<DataType>> {
	const formData = new FormData();
	if (data) formData.append("data", JSON.stringify(data));
	for (let file of files) {
		if (file.file) formData.append(file.name, file.file as any);
	}
	const requestOptions: RequestInit = {
		method,
		body: formData,
	};
	requestOptions.headers = {
		accept: "application/json",
	};
	if (options?.Authorization) requestOptions.headers.Authorization = options.Authorization;
	return await manageResponse<DataType>(await fetch(url, requestOptions), options);
}

const RestApiClient = ({
	host,
	Authorization,
}: {
	host: string | { dev: string; prod: string };
	Authorization?: () => Promise<string>;
}) => {
	let _host =
		typeof host == "string" ? host : process.env.NODE_ENV === "development" ? host.dev : host.prod;

	function addHostToUrl(url: string) {
		return _host + (url.startsWith("/") || _host.endsWith("/") ? url : "/" + url);
	}

	return {
		async get<DataType>(
			url: string,
			urlData?: Record<string, any>,
			options?: Omit<QueryOptions<DataType>, "Authorization">
		) {
			if (urlData) {
				const formattedUrlData: any = {};
				//If the url data has nested objects, create one unique object with the keys joined by '_'
				for (let key in urlData) {
					if (typeof urlData[key] == "object") {
						for (let key2 in urlData[key])
							formattedUrlData[key + "_" + key2] = urlData[key][key2];
					} else formattedUrlData[key] = urlData[key];
				}
				url = url + "?" + new URLSearchParams(formattedUrlData).toString();
			}
			return await serverQuery<DataType>("GET", addHostToUrl(url), undefined, {
				...options,
				Authorization: Authorization ? await Authorization() : "",
			});
		},
		async post<DataType>(
			url: string,
			data?: Record<string, any>,
			options?: Omit<QueryOptions<DataType>, "Authorization">
		) {
			return await serverQuery<DataType>("POST", addHostToUrl(url), data, {
				...options,
				Authorization: Authorization ? await Authorization() : "",
			});
		},
		async postWithFiles<DataType>(
			url: string,
			data: Record<string, any>,
			files: FileStruct[],
			options?: Omit<QueryOptions<DataType>, "Authorization">
		) {
			return await serverQueryWithFiles<DataType>("POST", addHostToUrl(url), data, files, {
				...options,
				Authorization: Authorization ? await Authorization() : "",
			});
		},
		async patch<DataType>(
			url: string,
			data: Record<string, any>,
			options?: Omit<QueryOptions<DataType>, "Authorization">
		) {
			return await serverQuery<DataType>("PATCH", addHostToUrl(url), data, {
				...options,
				Authorization: Authorization ? await Authorization() : "",
			});
		},
		async patchWithFiles<DataType>(
			url: string,
			data: Record<string, any>,
			files: FileStruct[],
			options?: Omit<QueryOptions<DataType>, "Authorization">
		) {
			return await serverQueryWithFiles<DataType>("PATCH", addHostToUrl(url), data, files, {
				...options,
				Authorization: Authorization ? await Authorization() : "",
			});
		},
		async delete<DataType>(
			url: string,
			data?: Record<string, any>,
			options?: Omit<QueryOptions<DataType>, "Authorization">
		) {
			return await serverQuery<DataType>("DELETE", addHostToUrl(url), data, {
				...options,
				Authorization: Authorization ? await Authorization() : "",
			});
		},
	};
};

export default RestApiClient;
