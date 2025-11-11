import { Test, TestingModule } from "@nestjs/testing"
import { EmailValidationController } from "./emailvalidation.controller"
import { HttpStatus, INestApplication, ValidationPipe } from "@nestjs/common";
import { mock } from "jest-mock-extended";
import { IUserFinder } from "./user-finder.interface";
import { AuthModuleOptions } from "./auth.module";
import * as request from "supertest";
import { JwtService } from "@nestjs/jwt";
import { MailerService } from "@vporel/nestjs-mailer";
import { EmailValidationService } from "./emailvalidation.service";

jest.mock('@vporel/handlebars', () => ({
	compileTemplate: jest.fn().mockReturnValue('Email template')
}));

describe('EmailValidationController', () => {
	let testAccessToken = 'accessToken';
	let testUser = {_id: 'userid', email: 'test@example.com', emailValidated: false, password: "", getRoles: () => ['Professional']};
	let testUserClass = 'Professional';
	let app: INestApplication;
	let controller: EmailValidationController;
	let authOptions: AuthModuleOptions;
	let emailValidationService: EmailValidationService;
	let mailerService: MailerService;
	let userFinder: IUserFinder;

	beforeEach(async() => {
		const userFinderMock = mock<IUserFinder>();
		userFinderMock.findById.mockResolvedValue(testUser);
		userFinderMock.markEmailAsValidated.mockResolvedValue(true)
		const jwtServiceMock = mock<JwtService>();
		jwtServiceMock.verifyAsync.mockResolvedValue({
			userId: testUser._id,
			userClass: testUserClass
		});
		const mailerServiceMock = mock<MailerService>();
		const emailValidationServiceMock = mock<EmailValidationService>();

		const module: TestingModule = await Test.createTestingModule({
			controllers: [EmailValidationController],
			providers: [
				{ provide: 'AUTH_OPTIONS', useValue: { emailValidation: { byPass: false, emailTemplatePath: '', emailSubject: '' } } },
				{ provide: 'USER_FINDER', useValue: userFinderMock },
				{ provide: JwtService, useValue: jwtServiceMock }, 
				{ provide: MailerService, useValue: mailerServiceMock }, 
				{ provide: EmailValidationService, useValue: emailValidationServiceMock }, 
			],
		}).compile();
		app = module.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({
			transform: true, //Automatically transform payloads to the correct type
			transformOptions: { enableImplicitConversion: true }
		}))
		await app.init();
		controller = module.get<EmailValidationController>(EmailValidationController);
		authOptions = module.get<AuthModuleOptions>('AUTH_OPTIONS');
		userFinder = module.get<IUserFinder>('USER_FINDER');
		emailValidationService = module.get<EmailValidationService>(EmailValidationService);
		mailerService = module.get<MailerService>(MailerService);
	})

	describe('POST /auth/send-email-validation-code', () => {
		it('should return true when email validation is bypassed', async () => {
			authOptions.emailValidation.byPass = true;
			return request(app.getHttpServer())
				.post('/auth/send-email-validation-code')
				.set('Authorization', `Bearer ${testAccessToken}`)
				.expect(200)
				.expect('true');
		})

		it('should return true if the code is correctly sent', async () => {
			const code = 123456;
			emailValidationService.generateAndSaveCode = jest.fn().mockResolvedValue(code);
			emailValidationService.testCode = jest.fn().mockResolvedValue(true);
			mailerService.sendEmail = jest.fn().mockResolvedValue(true);
			return request(app.getHttpServer())
				.post('/auth/send-email-validation-code')
				.set('Authorization', `Bearer ${testAccessToken}`)
				.expect(HttpStatus.OK)
				.expect('true');
		})

		it('should throw an error if the mailer service fails', async () => {
			emailValidationService.generateAndSaveCode = jest.fn().mockResolvedValue(123456);
			mailerService.sendEmail = jest.fn().mockResolvedValue(false);
			return request(app.getHttpServer())
				.post('/auth/send-email-validation-code')
				.set('Authorization', `Bearer ${testAccessToken}`)
				.expect(HttpStatus.INTERNAL_SERVER_ERROR)
		})
	})

	describe('POST /auth/validate-email-code', () => {
		it('should throw BadRequestException if the request parameters are invalid', async () => {
			return request(app.getHttpServer())
				.post('/auth/validate-email-code')
				.set('Authorization', `Bearer ${testAccessToken}`)
				.send({ code: '' })
				.expect(HttpStatus.BAD_REQUEST);
		})

		it('should throw an error if the code is invalid', async () => {
			authOptions.emailValidation.byPass = false;
			const code = 123456;
			emailValidationService.testCode = jest.fn().mockResolvedValue(false);
			return request(app.getHttpServer())
				.post('/auth/validate-email-code')
				.set('Authorization', `Bearer ${testAccessToken}`)
				.send({ code })
				.expect(HttpStatus.UNPROCESSABLE_ENTITY);
		})

		it('should return true if the code is valid and email is marked as validated', async () => {
			const code = 123456;
			emailValidationService.testCode = jest.fn().mockResolvedValue(true);
			userFinder.markEmailAsValidated = jest.fn().mockResolvedValue(true);
			return request(app.getHttpServer())
				.post('/auth/validate-email-code')
				.set('Authorization', `Bearer ${testAccessToken}`)
				.send({ code })
				.expect(HttpStatus.OK)
				.expect('true');
		})
	})

})