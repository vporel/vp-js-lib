/**
 * Basic functions for a server request (GET, POST, POST WITH FILES, PATCH, PATCH WITH FILES, DELETE)
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */
/**
 * The data is the error content if ok == false
 */
export type RestApiResponse<DataType> = {
    ok: true;
    data: DataType;
} | {
    ok: false;
    data: {
        message: string;
        statusCode: number;
        error?: Error;
    };
};
type QueryOptions<DataType> = {
    transformResponseData?: (data: any) => DataType;
    Authorization?: string;
};
export type FileType = File | {
    name: string;
    uri: string;
    type: string;
} | Blob | undefined;
type FileStruct = {
    name: string;
    file: File | {
        name: string;
        uri: string;
        type: string;
    } | Blob | undefined;
};
declare const RestApiClient: ({ host, Authorization, }: {
    host: string | {
        dev: string;
        prod: string;
    };
    Authorization?: () => Promise<string>;
}) => {
    get<DataType>(url: string, urlData?: Record<string, any>, options?: Omit<QueryOptions<DataType>, "Authorization">): Promise<RestApiResponse<DataType>>;
    post<DataType>(url: string, data?: Record<string, any>, options?: Omit<QueryOptions<DataType>, "Authorization">): Promise<RestApiResponse<DataType>>;
    postWithFiles<DataType>(url: string, data: Record<string, any>, files: FileStruct[], options?: Omit<QueryOptions<DataType>, "Authorization">): Promise<RestApiResponse<DataType>>;
    patch<DataType>(url: string, data: Record<string, any>, options?: Omit<QueryOptions<DataType>, "Authorization">): Promise<RestApiResponse<DataType>>;
    patchWithFiles<DataType>(url: string, data: Record<string, any>, files: FileStruct[], options?: Omit<QueryOptions<DataType>, "Authorization">): Promise<RestApiResponse<DataType>>;
    delete<DataType>(url: string, data?: Record<string, any>, options?: Omit<QueryOptions<DataType>, "Authorization">): Promise<RestApiResponse<DataType>>;
};
export default RestApiClient;
