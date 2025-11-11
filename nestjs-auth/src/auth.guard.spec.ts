//Tests for AuthGuard
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserFinder } from './user-finder.interface';
import { mock } from 'jest-mock-extended';
import { AuthModuleOptions } from './auth.module';
import { IUser } from './user.interface';
import { AuthPayload } from './auth.service';
import { ROLES_KEY } from './roles.decorator';
import { Reflector } from "@nestjs/core";
import { _MockProxy } from 'jest-mock-extended/lib/Mock';
import { SKIP_AUTH_KEY } from './auth.decorators';

describe('AuthGuard', () => {
	let guard: AuthGuard;
	let jwtService: JwtService;
	let userFinder: IUserFinder;
	let authOptions: AuthModuleOptions
	let reflector: Reflector
	let context: _MockProxy<ExecutionContext> & ExecutionContext;

	beforeEach(async () => {
		context = mock<ExecutionContext>();
		const jwtServiceMock = mock<JwtService>();
		const userFinderMock = mock<IUserFinder>();
		const reflectorMock = mock<Reflector>();
		reflectorMock.getAllAndOverride.mockImplementation((key: string) => {
			switch(key){
				case SKIP_AUTH_KEY: return false;
				case ROLES_KEY: return ['User'];
			}
		})

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthGuard,
				{ provide: Reflector, useValue: reflectorMock },
				{ provide: JwtService, useValue: jwtServiceMock },
				{ provide: 'USER_FINDER', useValue: userFinderMock },
				{ provide: 'AUTH_OPTIONS', useValue: { jwtSecretKey: "jwtsecretkey", jwtExpirationTime: "3600s" } as AuthModuleOptions },
			],
		}).compile();

		guard = module.get<AuthGuard>(AuthGuard);
		jwtService = module.get<JwtService>(JwtService);
		userFinder = module.get<IUserFinder>('USER_FINDER');
		authOptions = module.get<AuthModuleOptions>('AUTH_OPTIONS');
		reflector = module.get<Reflector>(Reflector);
	});

	describe("canActivate", () => {
		it('should allow access if the skip-auth decorator is used', async () => {
			reflector.getAllAndOverride = jest.fn().mockReturnValue(true);
			expect(await guard.canActivate(context)).toBe(true);
		});

		it('should throw UnauthorizedException if no token is provided', async () => {
			const request = { headers: {} };
			context.switchToHttp.mockReturnValue({
				getRequest: (): any => request,
				getResponse: jest.fn(),
				getNext: jest.fn(),
			});
			await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
		});

		it('should throw UnauthorizedException if token is invalid', async () => {
			const request = { headers: { authorization: "Bearer invalidToken" } };
			context.switchToHttp.mockReturnValue({
				getRequest: (): any => request,
				getResponse: jest.fn(),
				getNext: jest.fn(),
			});
			jwtService.verifyAsync = jest.fn().mockRejectedValue(new Error('Invalid token'));
			await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
		});

		it('should set user and userClass on the request object if token is valid', async () => {
			const request: any = { headers: { authorization: "Bearer validToken" } };
			const user: IUser = { _id: '123', email: 'test@example.com', emailValidated: true, password: '', getRoles: () => ['User'] };
			const payload: AuthPayload = { userId: user._id, userClass: 'User' };	
			context.switchToHttp.mockReturnValue({
				getRequest: (): any => request,
				getResponse: jest.fn(),
				getNext: jest.fn(),
			});
			jwtService.verifyAsync = jest.fn().mockResolvedValue(payload);
			userFinder.findById = jest.fn().mockResolvedValue(user);
			expect(await guard.canActivate(context)).toBe(true);
			expect(request.user).toEqual(user);
			expect(request.userClass).toEqual(payload.userClass);
		});
	})

	describe("verifyRoles", () => {
		it("should return false if none of the required roles is present", () => {
			expect(guard.verifyRoles(["role1", "role2"], {
				user: {
					getRoles: () => ["wrongrole"]
				}
			})).toBe(false)
		})

		it("should return true if none of the required roles is present", () => {
			expect(guard.verifyRoles(["role1", "role2"], {
				user: {
					getRoles: () => ["role1"]
				}
			})).toBe(true)
		})
	})
	
	describe('extractTokenFromHeader', () => {
		it("should return undefined if the token type is not Bearer", () => {
			expect(guard.extractTokenFromHeaders({
				headers: {
					authorization: "IncorrectType token"
				}
			})).toBeUndefined()
		})

		it("should return the correct token from the request", () => {
			expect(guard.extractTokenFromHeaders({
				headers: {
					authorization: "Bearer token"
				}
			})).toBe("token")
		})
	})
})