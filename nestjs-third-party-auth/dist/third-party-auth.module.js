"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ThirdPartyAuthModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThirdPartyAuthModule = void 0;
const common_1 = require("@nestjs/common");
const third_party_google_service_1 = require("./third-party.google.service");
const third_party_auth_service_1 = require("./third-party-auth.service");
let ThirdPartyAuthModule = ThirdPartyAuthModule_1 = class ThirdPartyAuthModule {
    static register(options) {
        return {
            module: ThirdPartyAuthModule_1,
            providers: [
                {
                    provide: "THIRD_PARTY_APIS_CONFIG",
                    useValue: options.apis
                },
                third_party_auth_service_1.ThirdPartyAuthService,
                third_party_google_service_1.GoogleService,
            ],
            exports: [third_party_google_service_1.GoogleService, third_party_auth_service_1.ThirdPartyAuthService],
        };
    }
};
exports.ThirdPartyAuthModule = ThirdPartyAuthModule;
exports.ThirdPartyAuthModule = ThirdPartyAuthModule = ThirdPartyAuthModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], ThirdPartyAuthModule);
