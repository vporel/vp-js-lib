import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { MongooseError } from "mongoose";

/**
 * @description This class is used to catch all unhandled exceptions and return a proper response to the client
 */
@Catch()
export default class UnhandledExceptionsFilter implements ExceptionFilter {
	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	catch(exception: any, host: ArgumentsHost): void {
		// In certain situations `httpAdapter` might not be available in the
		// constructor method, thus we should resolve it here.
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();
		let message: any = exception["response"]
			? exception["response"].message
				? exception["response"].message
				: exception["response"]
			: exception.message;
		let statusCode =
			exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
		console.log(exception);
		if (exception instanceof MongooseError && exception.constructor.name == "ValidationError") {
			const errors = {};
			for (const prop in exception["errors"])
				errors[prop] = exception["errors"][prop].properties.message;
			message = errors;
			statusCode = HttpStatus.BAD_REQUEST;
		}

		httpAdapter.reply(ctx.getResponse(), { status: 0, statusCode, message }, statusCode);
	}
}
