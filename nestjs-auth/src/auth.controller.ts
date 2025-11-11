import { Body, Controller, Get, Header, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { AuthMethodDto, AuthResult, AuthService, SigninDto } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { CurrentUser, CurrentUserClass } from "./auth.decorators";

/**
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */
@Controller("auth")
export class AuthController{
    constructor(
        private authService: AuthService
    ){}

    @Post('/email-exists')
    @HttpCode(HttpStatus.OK)
    @Header("Content-Type", "application/json")
    async emailExists(@Body() authMethod: AuthMethodDto): Promise<{userType: string}|false>{
        const userData = await this.authService.getUserData(authMethod)
        return userData ? {userType: userData.userClass.toLowerCase()} : false
    }

    @Post('/signin')
    @HttpCode(HttpStatus.OK)
    async signIn(@Body() data: SigninDto): Promise<AuthResult>{
        return await this.authService.signIn(data)
    }
    
    @Post('/token/extend')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async extendToken(@CurrentUserClass() userClass, @CurrentUser() user): Promise<AuthResult>{
        return await this.authService.getAuthToken(userClass, user) //Reauthenticate
    }

    @Get("/current-user")
    @UseGuards(AuthGuard)
    getCurrentUser(@CurrentUserClass() userClass, @CurrentUser() user): {user: any, userType: string}{
        return {
            user, 
            userType: userClass.toLowerCase()
        }
    }
}