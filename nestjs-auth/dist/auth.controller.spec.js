"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//tests for the auth controller
const testing_1 = require("@nestjs/testing");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const nestjs_third_party_auth_1 = require("@vporel/nestjs-third-party-auth");
const common_1 = require("@nestjs/common");
const jest_mock_extended_1 = require("jest-mock-extended");
const request = require("supertest");
const jwt_1 = require("@nestjs/jwt");
describe('AuthController', () => {
    let testAccessToken = 'accessToken';
    let testUser = { _id: 'userid', email: 'test@example.com', emailValidated: false, password: "" };
    let testUserClass = 'Professional';
    let app;
    let controller;
    let authService;
    let userFinder;
    beforeEach(async () => {
        const userFinderMock = (0, jest_mock_extended_1.mock)();
        userFinderMock.findById.mockResolvedValue(testUser);
        userFinderMock.findByEmail.mockResolvedValue({ user: testUser, userClass: testUserClass });
        const thirdPartyAuthServiceMock = (0, jest_mock_extended_1.mock)();
        const jwtServiceMock = (0, jest_mock_extended_1.mock)();
        jwtServiceMock.verifyAsync.mockResolvedValue({
            userId: testUser._id,
            userClass: testUserClass
        });
        const module = await testing_1.Test.createTestingModule({
            controllers: [auth_controller_1.AuthController],
            providers: [
                { provide: 'USER_FINDER', useValue: userFinderMock },
                { provide: 'AUTH_OPTIONS', useValue: { jwtSecretKey: "jwtsecretkey", jwtExpirationTime: "3600s" } },
                { provide: jwt_1.JwtService, useValue: jwtServiceMock },
                auth_service_1.AuthService,
                { provide: nestjs_third_party_auth_1.ThirdPartyAuthService, useValue: thirdPartyAuthServiceMock },
            ],
        }).compile();
        app = module.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({
            transform: true, //Automatically transform payloads to the correct type
            transformOptions: { enableImplicitConversion: true }
        }));
        await app.init();
        controller = module.get(auth_controller_1.AuthController);
        authService = module.get(auth_service_1.AuthService);
        userFinder = module.get('USER_FINDER');
    });
    describe('POST /auth/email-exists', () => {
        it('should return false if the email does not exist', async () => {
            authService.getUserData = jest.fn().mockResolvedValue(null);
            return request(app.getHttpServer())
                .post('/auth/email-exists')
                .send({ methodName: 'email', email: 'test@example.com' })
                .expect(common_1.HttpStatus.OK)
                .expect('false');
        });
        it('should return an object containing the user type if the email exists', async () => {
            authService.getUserData = jest.fn().mockResolvedValue({ user: testUser, userClass: testUserClass });
            return request(app.getHttpServer())
                .post('/auth/email-exists')
                .send({ methodName: 'email', email: 'test@example.com' })
                .expect(common_1.HttpStatus.OK)
                .expect({ userType: testUserClass.toLowerCase() });
        });
    });
    describe('POST /auth/signin', () => {
        it('should throw BadRequestException if the request parameters are invalid (methodName == email)', async () => {
            await request(app.getHttpServer())
                .post('/auth/signin')
                .send({ methodName: 'email', email: '', password: 'password' })
                .expect(common_1.HttpStatus.BAD_REQUEST);
            await request(app.getHttpServer())
                .post('/auth/signin')
                .send({ methodName: 'email', email: "email", password: '' })
                .expect(common_1.HttpStatus.BAD_REQUEST);
        });
        //The validity of the access token is tested in the auth service tests
        it('should return an access token and user type on successful sign-in', async () => {
            const authResult = {
                accessToken: testAccessToken,
                expiresIn: 3600,
                userType: testUserClass.toLowerCase()
            };
            authService.signIn = jest.fn().mockResolvedValue(authResult);
            const signinDto = {
                methodName: 'email',
                email: testUser.email,
                password: 'password123'
            };
            return request(app.getHttpServer())
                .post('/auth/signin')
                .send(signinDto)
                .expect(common_1.HttpStatus.OK)
                .expect(authResult);
        });
    });
    describe('POST /auth/token/extend', () => {
        it("should call authService.getAuthToken with the current user's class and user", async () => {
            const newToken = "newtoken";
            const newAuthResult = {
                accessToken: newToken,
                expiresIn: 3600,
                userType: testUserClass.toLowerCase()
            };
            authService.getAuthToken = jest.fn().mockResolvedValue(newAuthResult);
            return request(app.getHttpServer())
                .post('/auth/token/extend')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .expect(common_1.HttpStatus.OK)
                .expect(newAuthResult);
        });
    });
    describe('GET /auth/current-user', () => {
        it('should return the current user and user type', async () => {
            return request(app.getHttpServer())
                .get('/auth/current-user')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .expect(common_1.HttpStatus.OK)
                .expect({
                user: testUser,
                userType: testUserClass.toLowerCase()
            });
        });
    });
});
