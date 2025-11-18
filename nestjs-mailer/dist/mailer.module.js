"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MailerModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerModule = exports.MAILER_OPTIONS = void 0;
const common_1 = require("@nestjs/common");
const mailer_service_1 = require("./mailer.service");
exports.MAILER_OPTIONS = "MAILER_OPTIONS";
let MailerModule = MailerModule_1 = class MailerModule {
    static forRoot(options) {
        if (options.apiService == "gmail" && !options.gmail)
            throw new Error("The configuration is missing for the service 'gmail'");
        if (options.apiService == "mailjet" && !options.mailjet)
            throw new Error("The configuration is missing for the service 'mailjet'");
        return {
            module: MailerModule_1,
            providers: [
                {
                    provide: exports.MAILER_OPTIONS,
                    useValue: options
                },
                mailer_service_1.MailerService
            ],
            exports: [exports.MAILER_OPTIONS, mailer_service_1.MailerService]
        };
    }
};
exports.MailerModule = MailerModule;
exports.MailerModule = MailerModule = MailerModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], MailerModule);
