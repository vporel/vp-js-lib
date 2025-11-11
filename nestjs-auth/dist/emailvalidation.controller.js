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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailValidationController = exports.CodeDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const nestjs_mailer_1 = require("@vporel/nestjs-mailer");
const handlebars_1 = require("@vporel/handlebars");
const auth_decorators_1 = require("./auth.decorators");
const auth_guard_1 = require("./auth.guard");
const emailvalidation_service_1 = require("./emailvalidation.service");
class CodeDto {
    code;
}
exports.CodeDto = CodeDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100000),
    (0, class_validator_1.Max)(999999),
    __metadata("design:type", Number)
], CodeDto.prototype, "code", void 0);
/**
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */
let EmailValidationController = class EmailValidationController {
    mailerService;
    authOptions;
    userFinder;
    emailValidationService;
    constructor(mailerService, authOptions, userFinder, emailValidationService) {
        this.mailerService = mailerService;
        this.authOptions = authOptions;
        this.userFinder = userFinder;
        this.emailValidationService = emailValidationService;
    }
    async sendEmailValidationCode(user) {
        if (this.authOptions.emailValidation?.byPass)
            return true;
        const code = await this.emailValidationService.generateAndSaveCode(user.email);
        const sent = await this.mailerService.sendEmail(user.email, this.authOptions.emailValidation?.emailSubject, (0, handlebars_1.compileTemplate)(this.authOptions.emailValidation?.emailTemplatePath, { code }));
        if (!sent)
            throw new common_1.HttpException("Mailer error", common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        return true;
    }
    async validateCode({ code }, userClass, user) {
        if (this.authOptions.emailValidation?.byPass || await this.emailValidationService.testCode(user.email, code)) {
            return await this.userFinder.markEmailAsValidated(userClass, user._id);
        }
        else
            throw new common_1.HttpException("Wrong code", common_1.HttpStatus.UNPROCESSABLE_ENTITY);
    }
};
exports.EmailValidationController = EmailValidationController;
__decorate([
    (0, common_1.Post)('/send-email-validation-code'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailValidationController.prototype, "sendEmailValidationCode", null);
__decorate([
    (0, common_1.Post)('/validate-email-code'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_decorators_1.CurrentUserClass)()),
    __param(2, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CodeDto, Object, Object]),
    __metadata("design:returntype", Promise)
], EmailValidationController.prototype, "validateCode", null);
exports.EmailValidationController = EmailValidationController = __decorate([
    (0, common_1.Controller)("auth"),
    __param(1, (0, common_1.Inject)('AUTH_OPTIONS')),
    __param(2, (0, common_1.Inject)('USER_FINDER')),
    __metadata("design:paramtypes", [nestjs_mailer_1.MailerService, Object, Object, emailvalidation_service_1.EmailValidationService])
], EmailValidationController);
