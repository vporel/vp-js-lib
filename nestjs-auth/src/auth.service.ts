import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, Optional, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { IUserFinder } from "./user-finder.interface";
import { AuthModuleOptions } from "./auth.module";
import { IsEmail, IsIn, IsNotEmpty, IsString, ValidateIf } from "class-validator";
import { ThirdPartyAuthService } from "@vporel/nestjs-third-party-auth";

export class AuthMethodDto{
    //only the email method can be used if the third-party-auth module is not enabled
    @IsString()
    @IsIn(["email", "google"])
    methodName: "email" | "google"

    @IsEmail()
    @IsNotEmpty()
    @ValidateIf(({methodName}) => methodName == "email")
    email?: string

    @IsString()
    @ValidateIf(({methodName}) => methodName == "google")
    accessToken?: string
}

export type AuthResult = {
    accessToken: string, 
    expiresIn: number,
    userType: string
}


export class SigninDto extends AuthMethodDto{

    @IsString()
    @IsNotEmpty()
    @ValidateIf(({methodName}) => methodName == "email")
    password?: string
}

export type AuthPayload = {
    userId: string 
    userClass: string 
}

/**
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 * 
 * Some parameters in functions are not validated, this is because the validation either by the controller or by class-validator
 */
@Injectable()
export class AuthService{
    constructor(
        @Inject('AUTH_OPTIONS') private readonly authOptions: AuthModuleOptions,
        @Inject('USER_FINDER') private userFinder: IUserFinder,
        private jwtService: JwtService,
        @Optional() private thirdPartyAuthService: ThirdPartyAuthService
    ){}

    async getUserData(emailOrAuthMethod: string|AuthMethodDto): Promise<{user: any, userClass: string}|null>{
        let email
        if(typeof emailOrAuthMethod == "string") email = emailOrAuthMethod
        else email = await this.getEmailFromAuthMethod(emailOrAuthMethod)
        return await this.userFinder.findByEmail(email)
    }

    async signIn(signinData: SigninDto): Promise<AuthResult>{
        const email = await this.getEmailFromAuthMethod(signinData)
        if(signinData.methodName != "email" && !email) throw new BadRequestException("invalid_access_token: The third-party service access token is invalid or missing")
        const password = signinData.password
        const result = await this.userFinder.findByEmail(email)
        if(!result || !result.user) throw new NotFoundException("user_not_found: No user found with this email")
        const {user, userClass} = result
        if(signinData.methodName == "email" && !(await this.userFinder.comparePasswords(password, user.password))) throw new UnauthorizedException("incorrect_password: The password is incorrect")
        return await this.getAuthToken(user, userClass)
    }

    async getAuthToken(user: any, userClass: string): Promise<AuthResult>{
        const payload: AuthPayload = {userId: user["_id"], userClass}
        return {
            accessToken: await this.jwtService.signAsync(payload, {secret: this.authOptions.jwtSecretKey}),
            expiresIn: parseInt(this.authOptions.jwtExpirationTime),    //In seconds,
            userType: userClass.toLowerCase()
        }
    }

    async getEmailFromAuthMethod(authMethod: AuthMethodDto): Promise<string|undefined|null>{
        if(authMethod.methodName == "email") return authMethod.email
        else{
            if(!this.thirdPartyAuthService) throw new InternalServerErrorException("Third-party authentication not enabled")
            const userInfos = await this.thirdPartyAuthService.getUserInfos(authMethod.methodName, authMethod.accessToken)
            return userInfos ? userInfos.email : null
        }
    }
}