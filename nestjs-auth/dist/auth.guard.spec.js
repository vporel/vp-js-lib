"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//Tests for AuthGuard
const testing_1 = require("@nestjs/testing");
const auth_guard_1 = require("./auth.guard");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const jest_mock_extended_1 = require("jest-mock-extended");
const roles_decorator_1 = require("./roles.decorator");
const core_1 = require("@nestjs/core");
const auth_decorators_1 = require("./auth.decorators");
describe('AuthGuard', () => {
    let guard;
    let jwtService;
    let userFinder;
    let authOptions;
    let reflector;
    let context;
    beforeEach(async () => {
        context = (0, jest_mock_extended_1.mock)();
        const jwtServiceMock = (0, jest_mock_extended_1.mock)();
        const userFinderMock = (0, jest_mock_extended_1.mock)();
        const reflectorMock = (0, jest_mock_extended_1.mock)();
        reflectorMock.getAllAndOverride.mockImplementation((key) => {
            switch (key) {
                case auth_decorators_1.SKIP_AUTH_KEY: return false;
                case roles_decorator_1.ROLES_KEY: return ['User'];
            }
        });
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_guard_1.AuthGuard,
                { provide: core_1.Reflector, useValue: reflectorMock },
                { provide: jwt_1.JwtService, useValue: jwtServiceMock },
                { provide: 'USER_FINDER', useValue: userFinderMock },
                { provide: 'AUTH_OPTIONS', useValue: { jwtSecretKey: "jwtsecretkey", jwtExpirationTime: "3600s" } },
            ],
        }).compile();
        guard = module.get(auth_guard_1.AuthGuard);
        jwtService = module.get(jwt_1.JwtService);
        userFinder = module.get('USER_FINDER');
        authOptions = module.get('AUTH_OPTIONS');
        reflector = module.get(core_1.Reflector);
    });
    it('should allow access if the skip-auth decorator is used', async () => {
        reflector.getAllAndOverride = jest.fn().mockReturnValue(true);
        expect(await guard.canActivate(context)).toBe(true);
    });
    it('should throw UnauthorizedException if no token is provided', async () => {
        const request = { headers: {} };
        context.switchToHttp.mockReturnValue({
            getRequest: () => request,
            getResponse: jest.fn(),
            getNext: jest.fn(),
        });
        await expect(guard.canActivate(context)).rejects.toThrow(common_1.UnauthorizedException);
    });
    it('should throw UnauthorizedException if token is invalid', async () => {
        const request = { headers: { authorization: "Bearer invalidToken" } };
        context.switchToHttp.mockReturnValue({
            getRequest: () => request,
            getResponse: jest.fn(),
            getNext: jest.fn(),
        });
        jwtService.verifyAsync = jest.fn().mockRejectedValue(new Error('Invalid token'));
        await expect(guard.canActivate(context)).rejects.toThrow(common_1.UnauthorizedException);
    });
    it('should set user and userClass on the request object if token is valid', async () => {
        const request = { headers: { authorization: "Bearer validToken" } };
        const user = { _id: '123', email: 'test@example.com', emailValidated: true, password: '', getRoles: () => ['User'] };
        const payload = { userId: user._id, userClass: 'User' };
        context.switchToHttp.mockReturnValue({
            getRequest: () => request,
            getResponse: jest.fn(),
            getNext: jest.fn(),
        });
        jwtService.verifyAsync = jest.fn().mockResolvedValue(payload);
        userFinder.findById = jest.fn().mockResolvedValue(user);
        expect(await guard.canActivate(context)).toBe(true);
        expect(request.user).toEqual(user);
        expect(request.userClass).toEqual(payload.userClass);
    });
});
