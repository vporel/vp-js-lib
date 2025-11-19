"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const mongoose_1 = require("mongoose");
/**
 * @description This class is used to catch all unhandled exceptions and return a proper response to the client
 */
let UnhandledExceptionsFilter = class UnhandledExceptionsFilter {
    httpAdapterHost;
    constructor(httpAdapterHost) {
        this.httpAdapterHost = httpAdapterHost;
    }
    catch(exception, host) {
        // In certain situations `httpAdapter` might not be available in the
        // constructor method, thus we should resolve it here.
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        let message = exception["response"]
            ? exception["response"].message
                ? exception["response"].message
                : exception["response"]
            : exception.message;
        let statusCode = exception instanceof common_1.HttpException ? exception.getStatus() : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        console.log(exception);
        if (exception instanceof mongoose_1.MongooseError && exception.constructor.name == "ValidationError") {
            const errors = {};
            for (const prop in exception["errors"])
                errors[prop] = exception["errors"][prop].properties.message;
            message = errors;
            statusCode = common_1.HttpStatus.BAD_REQUEST;
        }
        httpAdapter.reply(ctx.getResponse(), { status: 0, statusCode, message }, statusCode);
    }
};
UnhandledExceptionsFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [core_1.HttpAdapterHost])
], UnhandledExceptionsFilter);
exports.default = UnhandledExceptionsFilter;
