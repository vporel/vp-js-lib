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
exports.ThirdPartyAuthService = void 0;
const common_1 = require("@nestjs/common");
const third_party_google_service_1 = require("./third-party.google.service");
/**
 * @description Service for third-party authentication
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */
let ThirdPartyAuthService = class ThirdPartyAuthService {
    apis;
    services;
    constructor(apis, googleService) {
        this.apis = apis;
        this.services = {};
        if (apis.google)
            this.services["google"] = googleService;
    }
    async isTokenValid(service, token) {
        return this.getServiceByName(service).isTokenValid(token);
    }
    /**
     * @throws HttpException If the token is invalid
     */
    async getUserInfos(service, token) {
        const infos = this.getServiceByName(service).getUserInfos(token);
        if (!infos)
            throw new common_1.HttpException(`Invalid ${service} access token`, common_1.HttpStatus.UNAUTHORIZED);
        return infos;
    }
    getServiceByName(name) {
        if (!this.services[name])
            throw new Error(`No service configured with the name ${name}`);
        return this.services[name];
    }
};
exports.ThirdPartyAuthService = ThirdPartyAuthService;
exports.ThirdPartyAuthService = ThirdPartyAuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)("THIRD_PARTY_APIS_CONFIG")),
    __metadata("design:paramtypes", [Object, third_party_google_service_1.GoogleService])
], ThirdPartyAuthService);
