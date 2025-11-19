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
exports.SecuredPropertiesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const misc_1 = require("@vporel/misc");
const secured_properties_decorator_1 = require("./secured-properties.decorator");
/**
 * Can be used to force the user to provide a password to update some properties
 */
let SecuredPropertiesGuard = class SecuredPropertiesGuard {
    reflector;
    userFinder;
    constructor(reflector, userFinder) {
        this.reflector = reflector;
        this.userFinder = userFinder;
    }
    async canActivate(context) {
        const securedProperties = this.reflector.getAllAndOverride(secured_properties_decorator_1.SECURED_PROPERTIES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        const request = context.switchToHttp().getRequest();
        if (securedProperties.length == 0)
            return true;
        let passwordTestNeeded = false;
        for (let securedProp of securedProperties) {
            if ((0, misc_1.getKeysDeepJoined)(request.body).includes(securedProp)) {
                passwordTestNeeded = true;
                break;
            }
        }
        if (!passwordTestNeeded)
            return true;
        if (!request.body.password || request.body.password == "")
            throw new common_1.ForbiddenException("password_required_for_secured_properties: " + securedProperties.join(", "));
        let testOk = await this.userFinder.comparePasswords(request.body.password, request.user?.password);
        if (!testOk)
            throw new common_1.ForbiddenException("invalid_password_for_secured_properties: " + securedProperties.join(", "));
        //Remove the password from the request
        delete request.body.password;
        return true;
    }
};
exports.SecuredPropertiesGuard = SecuredPropertiesGuard;
exports.SecuredPropertiesGuard = SecuredPropertiesGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)("USER_FINDER")),
    __metadata("design:paramtypes", [core_1.Reflector, Object])
], SecuredPropertiesGuard);
