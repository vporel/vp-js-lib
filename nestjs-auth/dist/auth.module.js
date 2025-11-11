"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AuthModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_controller_1 = require("./auth.controller");
const jwt_1 = require("@nestjs/jwt");
const auth_service_1 = require("./auth.service");
const emailvalidation_controller_1 = require("./emailvalidation.controller");
const nestjs_third_party_auth_1 = require("@vporel/nestjs-third-party-auth");
const auth_guard_1 = require("./auth.guard");
const secured_properties_guard_1 = require("./secured-properties.guard");
const emailvalidation_service_1 = require("./emailvalidation.service");
let AuthModule = AuthModule_1 = class AuthModule {
    static forRoot(options) {
        const imports = [
            jwt_1.JwtModule.registerAsync({
                global: true,
                useFactory: async () => ({
                    secret: options.jwtSecretKey,
                    signOptions: { expiresIn: options.jwtExpirationTime },
                })
            }),
        ];
        if (options.thirdPartyAuthOptions)
            imports.push(nestjs_third_party_auth_1.ThirdPartyAuthModule.register(options.thirdPartyAuthOptions));
        const controllers = [auth_controller_1.AuthController];
        if (options.emailValidation)
            controllers.push(emailvalidation_controller_1.EmailValidationController);
        const providers = [
            { provide: 'AUTH_OPTIONS', useValue: options },
            auth_service_1.AuthService,
            auth_guard_1.AuthGuard,
            secured_properties_guard_1.SecuredPropertiesGuard,
            emailvalidation_service_1.EmailValidationService
        ];
        if (typeof options.userFinder == 'function')
            providers.push({ provide: 'USER_FINDER', useClass: options.userFinder });
        else
            providers.push({ provide: 'USER_FINDER', useValue: options.userFinder });
        return {
            module: AuthModule_1,
            imports,
            providers,
            controllers,
            exports: ['AUTH_OPTIONS', 'USER_FINDER', auth_service_1.AuthService, auth_guard_1.AuthGuard, secured_properties_guard_1.SecuredPropertiesGuard, emailvalidation_service_1.EmailValidationService]
        };
    }
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = AuthModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], AuthModule);
