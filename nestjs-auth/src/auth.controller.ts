import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, CurrentUserClass } from "./auth.decorators";
import { AuthGuard } from "./auth.guard";
import { AuthResult, AuthService, SigninDto } from "./auth.service";

/**
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */
@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post("/signin")
	@HttpCode(HttpStatus.OK)
	async signIn(@Body() data: SigninDto): Promise<AuthResult> {
		return await this.authService.signIn(data);
	}

	@Post("/token/extend")
	@HttpCode(HttpStatus.OK)
	@UseGuards(AuthGuard)
	async extendToken(@CurrentUser() user, @CurrentUserClass() userClass): Promise<AuthResult> {
		return await this.authService.getAuthToken(user, userClass); //Reauthenticate
	}

	@Get("/current-user")
	@UseGuards(AuthGuard)
	getCurrentUser(@CurrentUserClass() userClass, @CurrentUser() user): { user: any; userType: string } {
		return {
			user,
			userType: userClass.toLowerCase(),
		};
	}
}
