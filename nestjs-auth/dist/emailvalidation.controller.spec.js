"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const emailvalidation_controller_1 = require("./emailvalidation.controller");
const common_1 = require("@nestjs/common");
const jest_mock_extended_1 = require("jest-mock-extended");
const request = require("supertest");
const jwt_1 = require("@nestjs/jwt");
const nestjs_mailer_1 = require("@vporel/nestjs-mailer");
const emailvalidation_service_1 = require("./emailvalidation.service");
jest.mock('@vporel/handlebars', () => ({
    compileTemplate: jest.fn().mockReturnValue('Email template')
}));
describe('EmailValidationController', () => {
    let testAccessToken = 'accessToken';
    let testUser = { _id: 'userid', email: 'test@example.com', emailValidated: false, password: "", getRoles: () => ['Professional'] };
    let testUserClass = 'Professional';
    let app;
    let controller;
    let authOptions;
    let emailValidationService;
    let mailerService;
    let userFinder;
    beforeEach(async () => {
        const userFinderMock = (0, jest_mock_extended_1.mock)();
        userFinderMock.findById.mockResolvedValue(testUser);
        userFinderMock.markEmailAsValidated.mockResolvedValue(true);
        const jwtServiceMock = (0, jest_mock_extended_1.mock)();
        jwtServiceMock.verifyAsync.mockResolvedValue({
            userId: testUser._id,
            userClass: testUserClass
        });
        const mailerServiceMock = (0, jest_mock_extended_1.mock)();
        const emailValidationServiceMock = (0, jest_mock_extended_1.mock)();
        const module = await testing_1.Test.createTestingModule({
            controllers: [emailvalidation_controller_1.EmailValidationController],
            providers: [
                { provide: 'AUTH_OPTIONS', useValue: { emailValidation: { byPass: false, emailTemplatePath: '', emailSubject: '' } } },
                { provide: 'USER_FINDER', useValue: userFinderMock },
                { provide: jwt_1.JwtService, useValue: jwtServiceMock },
                { provide: nestjs_mailer_1.MailerService, useValue: mailerServiceMock },
                { provide: emailvalidation_service_1.EmailValidationService, useValue: emailValidationServiceMock },
            ],
        }).compile();
        app = module.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({
            transform: true, //Automatically transform payloads to the correct type
            transformOptions: { enableImplicitConversion: true }
        }));
        await app.init();
        controller = module.get(emailvalidation_controller_1.EmailValidationController);
        authOptions = module.get('AUTH_OPTIONS');
        userFinder = module.get('USER_FINDER');
        emailValidationService = module.get(emailvalidation_service_1.EmailValidationService);
        mailerService = module.get(nestjs_mailer_1.MailerService);
    });
    describe('POST /auth/send-email-validation-code', () => {
        it('should return true when email validation is bypassed', async () => {
            authOptions.emailValidation.byPass = true;
            return request(app.getHttpServer())
                .post('/auth/send-email-validation-code')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .expect(200)
                .expect('true');
        });
        it('should return true if the code is correctly sent', async () => {
            const code = 123456;
            emailValidationService.generateAndSaveCode = jest.fn().mockResolvedValue(code);
            emailValidationService.testCode = jest.fn().mockResolvedValue(true);
            mailerService.sendEmail = jest.fn().mockResolvedValue(true);
            return request(app.getHttpServer())
                .post('/auth/send-email-validation-code')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .expect(common_1.HttpStatus.OK)
                .expect('true');
        });
        it('should throw an error if the mailer service fails', async () => {
            emailValidationService.generateAndSaveCode = jest.fn().mockResolvedValue(123456);
            mailerService.sendEmail = jest.fn().mockResolvedValue(false);
            return request(app.getHttpServer())
                .post('/auth/send-email-validation-code')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .expect(common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        });
    });
    describe('POST /auth/validate-email-code', () => {
        it('should throw BadRequestException if the request parameters are invalid', async () => {
            return request(app.getHttpServer())
                .post('/auth/validate-email-code')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send({ code: '' })
                .expect(common_1.HttpStatus.BAD_REQUEST);
        });
        it('should throw an error if the code is invalid', async () => {
            authOptions.emailValidation.byPass = false;
            const code = 123456;
            emailValidationService.testCode = jest.fn().mockResolvedValue(false);
            return request(app.getHttpServer())
                .post('/auth/validate-email-code')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send({ code })
                .expect(common_1.HttpStatus.UNPROCESSABLE_ENTITY);
        });
        it('should return true if the code is valid and email is marked as validated', async () => {
            const code = 123456;
            emailValidationService.testCode = jest.fn().mockResolvedValue(true);
            userFinder.markEmailAsValidated = jest.fn().mockResolvedValue(true);
            return request(app.getHttpServer())
                .post('/auth/validate-email-code')
                .set('Authorization', `Bearer ${testAccessToken}`)
                .send({ code })
                .expect(common_1.HttpStatus.OK)
                .expect('true');
        });
    });
});
