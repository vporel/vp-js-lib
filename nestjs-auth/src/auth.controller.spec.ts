//tests for the auth controller
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService, AuthMethodDto, SigninDto } from './auth.service';
import { ThirdPartyAuthService } from '@vporel/nestjs-third-party-auth';
import { BadRequestException, HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { mock } from 'jest-mock-extended';
import * as request from 'supertest';
import { AuthModuleOptions } from './auth.module';
import { IUserFinder } from './user-finder.interface';
import { JwtService } from '@nestjs/jwt';
import { IUser } from './user.interface';

describe('AuthController', () => {
	let testAccessToken = 'accessToken';
	let testUser = {_id: 'userid', email: 'test@example.com', emailValidated: false, password: ""};
	let testUserClass = 'Professional';
	let app: INestApplication;
	let controller: AuthController;
	let authService: AuthService;
    let userFinder: IUserFinder;

	beforeEach(async () => {
		const userFinderMock = mock<IUserFinder>();
		userFinderMock.findById.mockResolvedValue(testUser as IUser);
		userFinderMock.findByEmail.mockResolvedValue({user: testUser as IUser, userClass: testUserClass});
		const thirdPartyAuthServiceMock = mock<ThirdPartyAuthService>();
		const jwtServiceMock = mock<JwtService>();
		jwtServiceMock.verifyAsync.mockResolvedValue({
			userId: testUser._id,
			userClass: testUserClass
		});

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{ provide: 'USER_FINDER', useValue: userFinderMock },
				{ provide: 'AUTH_OPTIONS', useValue: { jwtSecretKey: "jwtsecretkey", jwtExpirationTime: "3600s" } as AuthModuleOptions },
				{ provide: JwtService, useValue: jwtServiceMock },
				AuthService,
				{ provide: ThirdPartyAuthService, useValue: thirdPartyAuthServiceMock },
			],
		}).compile();

		app = module.createNestApplication();
		app.useGlobalPipes(new ValidationPipe({
			transform: true, //Automatically transform payloads to the correct type
			transformOptions: { enableImplicitConversion: true }
		}))
		await app.init()
		controller = module.get<AuthController>(AuthController);
		authService = module.get<AuthService>(AuthService);
		userFinder = module.get<IUserFinder>('USER_FINDER');

	});

	describe('POST /auth/email-exists', () => {
		it('should return false if the email does not exist', async () => {
			authService.getUserData = jest.fn().mockResolvedValue(null);
			return request(app.getHttpServer())
				.post('/auth/email-exists')
				.send({methodName: 'email', email: 'test@example.com'})
				.expect(HttpStatus.OK)
				.expect('false')
		})

		it('should return an object containing the user type if the email exists', async () => {
			authService.getUserData = jest.fn().mockResolvedValue({user: testUser, userClass: testUserClass});
			return request(app.getHttpServer())
				.post('/auth/email-exists')
				.send({methodName: 'email', email: 'test@example.com'})
				.expect(HttpStatus.OK)
				.expect({userType: testUserClass.toLowerCase()});
		})
	})

	describe('POST /auth/signin', () => {
		it('should throw BadRequestException if the request parameters are invalid (methodName == email)', async () => {
			await request(app.getHttpServer())
				.post('/auth/signin')
				.send({methodName: 'email', email: '', password: 'password'})
				.expect(HttpStatus.BAD_REQUEST)
			await request(app.getHttpServer())
				.post('/auth/signin')
				.send({methodName: 'email', email: "email", password: ''})
				.expect(HttpStatus.BAD_REQUEST)
		})
		//The validity of the access token is tested in the auth service tests
		
		it('should return an access token and user type on successful sign-in', async () => {
			const authResult = {
				accessToken: testAccessToken,
				expiresIn: 3600,
				userType: testUserClass.toLowerCase()
			};
			authService.signIn = jest.fn().mockResolvedValue(authResult);

			const signinDto: SigninDto = {
				methodName: 'email',
				email: testUser.email,
				password: 'password123'
			};

			return request(app.getHttpServer())
				.post('/auth/signin')
				.send(signinDto)
				.expect(HttpStatus.OK)
				.expect(authResult);
		})
	})

	describe('POST /auth/token/extend', () => {
		it("should call authService.getAuthToken with the current user's class and user", async () => {
			const newToken = "newtoken"
			const newAuthResult = {
				accessToken: newToken,
				expiresIn: 3600,
				userType: testUserClass.toLowerCase()
			}
			authService.getAuthToken = jest.fn().mockResolvedValue(newAuthResult);

			return request(app.getHttpServer())
				.post('/auth/token/extend')
				.set('Authorization', `Bearer ${testAccessToken}`)
				.expect(HttpStatus.OK)
				.expect(newAuthResult)
		})
	})

	describe('GET /auth/current-user', () => {
		it('should return the current user and user type', async () => {
			return request(app.getHttpServer())
				.get('/auth/current-user')
				.set('Authorization', `Bearer ${testAccessToken}`)
				.expect(HttpStatus.OK)
				.expect({
					user: testUser,
					userType: testUserClass.toLowerCase()
				});
		})
	})
})