"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("./auth.service");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const nestjs_third_party_auth_1 = require("@vporel/nestjs-third-party-auth");
const jest_mock_extended_1 = require("jest-mock-extended");
describe('AuthService', () => {
    const testEmail = 'test@example.com';
    const testThirdPartyServiceAccessToken = 'xxxx';
    let service;
    let authOptions;
    let userFinder;
    let jwtService;
    let thirdPartyAuthService;
    beforeEach(async () => {
        const thirdPartyAuthServiceMock = (0, jest_mock_extended_1.mock)();
        thirdPartyAuthServiceMock.getUserInfos.mockResolvedValue({ email: testEmail });
        const jwtServiceMock = (0, jest_mock_extended_1.mock)();
        jwtServiceMock.signAsync.mockResolvedValue(testThirdPartyServiceAccessToken);
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: 'USER_FINDER', useValue: (0, jest_mock_extended_1.mock)() },
                { provide: jwt_1.JwtService, useValue: jwtServiceMock },
                { provide: 'AUTH_OPTIONS', useValue: { jwtSecretKey: "jwtsecretkey", jwtExpirationTime: "3600s" } },
                { provide: nestjs_third_party_auth_1.ThirdPartyAuthService, useValue: thirdPartyAuthServiceMock },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        authOptions = module.get('AUTH_OPTIONS');
        userFinder = module.get('USER_FINDER');
        jwtService = module.get(jwt_1.JwtService);
        thirdPartyAuthService = module.get(nestjs_third_party_auth_1.ThirdPartyAuthService);
    });
    describe('getUserData', () => {
        const user = { email: testEmail };
        const userClass = 'Professional';
        beforeEach(() => {
            const user = { email: testEmail };
            userFinder.findByEmail = jest.fn().mockResolvedValue({ user, userClass });
        });
        it('should return user data for an email string', async () => {
            const result = await service.getUserData(testEmail);
            expect(result).toEqual({ user, userClass });
        });
        it('should return user data for an authMethod with email methodName', async () => {
            const result = await service.getUserData({ methodName: 'email', email: testEmail });
            expect(result).toEqual({ user, userClass });
        });
        it('should return user data for an authMethod with a third-party service', async () => {
            thirdPartyAuthService.getUserInfos = jest.fn().mockResolvedValue({ email: testEmail });
            const result = await service.getUserData({ methodName: 'google', accessToken: testThirdPartyServiceAccessToken });
            expect(result).toEqual({ user, userClass });
        });
    });
    describe('signIn', () => {
        it("should throw BadRequestException if methodName is not 'email' and the access_token is invalid", async () => {
            thirdPartyAuthService.getUserInfos = jest.fn().mockResolvedValue({});
            try {
                await service.signIn({ methodName: 'google', accessToken: 'invalid_token' });
                fail('Expected BadRequestException to be thrown');
            }
            catch (e) {
                expect(e).toBeInstanceOf(common_1.BadRequestException);
                expect(e.message).toContain('invalid_access_token');
            }
        });
        it("should throw NotFoundException if no user is found with the given email", async () => {
            userFinder.findByEmail = jest.fn().mockResolvedValue(null);
            try {
                await service.signIn({ methodName: 'email', email: testEmail, password: 'password' });
                fail('Expected NotFoundException to be thrown');
            }
            catch (e) {
                expect(e).toBeInstanceOf(common_1.NotFoundException);
                expect(e.message).toContain('user_not_found');
            }
        });
        it('should throw UnauthorizedException if the password is incorrect', async () => {
            userFinder.findByEmail = jest.fn().mockResolvedValue({ user: { email: testEmail }, userClass: 'Professional' });
            userFinder.comparePasswords = jest.fn().mockResolvedValue(false);
            try {
                await service.signIn({ methodName: 'email', email: testEmail, password: 'wrong_password' });
                fail('Expected UnauthorizedException to be thrown');
            }
            catch (e) {
                expect(e).toBeInstanceOf(common_1.UnauthorizedException);
                expect(e.message).toContain('incorrect_password');
            }
        });
        it('should return a valid auth token for correct credentials', async () => {
            userFinder.findByEmail = jest.fn().mockResolvedValue({ user: { email: testEmail }, userClass: 'Professional' });
            userFinder.comparePasswords = jest.fn().mockResolvedValue(true);
            const result = await service.signIn({ methodName: 'email', email: testEmail, password: 'password' });
            expect(result).toEqual({
                accessToken: testThirdPartyServiceAccessToken,
                expiresIn: parseInt(authOptions.jwtExpirationTime),
                userType: 'professional',
            });
        });
    });
    describe('getAuthToken', () => {
        it('should return a valid auth token', async () => {
            const user = { id: '123' };
            const userClass = 'Professional';
            const result = await service.getAuthToken(user, userClass);
            expect(result).toEqual({
                accessToken: testThirdPartyServiceAccessToken,
                expiresIn: parseInt(authOptions.jwtExpirationTime),
                userType: userClass.toLowerCase(),
            });
        });
    });
    describe('getEmailFromAuthMethod', () => {
        it('should return email if method is email', async () => {
            const email = await service.getEmailFromAuthMethod({ methodName: 'email', email: testEmail });
            expect(email).toBe(testEmail);
        });
        it('should call third-party auth service if method is not email', async () => {
            const methodName = 'google';
            const email = await service.getEmailFromAuthMethod({ methodName, accessToken: testThirdPartyServiceAccessToken });
            expect(thirdPartyAuthService.getUserInfos).toHaveBeenCalledWith(methodName, testThirdPartyServiceAccessToken);
            expect(email).toBe(testEmail);
        });
        it("should throw an error if third-party auth service is not available", async () => {
            const serviceWithoutThirdParty = new auth_service_1.AuthService(authOptions, userFinder, jwtService, null);
            await expect(serviceWithoutThirdParty.getEmailFromAuthMethod({ methodName: 'google', accessToken: testThirdPartyServiceAccessToken })).rejects.toThrow(common_1.InternalServerErrorException);
        });
    });
});
