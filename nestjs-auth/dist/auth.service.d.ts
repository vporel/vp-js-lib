import { JwtService } from "@nestjs/jwt";
import { IUserFinder } from "./user-finder.interface";
import { AuthModuleOptions } from "./auth.module";
import { ThirdPartyAuthService } from "@vporel/nestjs-third-party-auth";
export declare class AuthMethodDto {
    methodName: "email" | "google";
    email?: string;
    accessToken?: string;
}
export type AuthResult = {
    accessToken: string;
    expiresIn: number;
    userType: string;
};
export declare class SigninDto extends AuthMethodDto {
    password?: string;
}
export type AuthPayload = {
    userId: string;
    userClass: string;
};
/**
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 *
 * Some parameters in functions are not validated, this is because the validation either by the controller or by class-validator
 */
export declare class AuthService {
    private readonly authOptions;
    private userFinder;
    private jwtService;
    private thirdPartyAuthService;
    constructor(authOptions: AuthModuleOptions, userFinder: IUserFinder, jwtService: JwtService, thirdPartyAuthService: ThirdPartyAuthService);
    getUserData(emailOrAuthMethod: string | AuthMethodDto): Promise<{
        user: any;
        userClass: string;
    } | null>;
    signIn(signinData: SigninDto): Promise<AuthResult>;
    getAuthToken(user: any, userClass: string): Promise<AuthResult>;
    getEmailFromAuthMethod(authMethod: AuthMethodDto): Promise<string | undefined | null>;
}
