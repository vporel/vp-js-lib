import { AuthMethodDto, AuthResult, AuthService, SigninDto } from "./auth.service";
/**
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    emailExists(authMethod: AuthMethodDto): Promise<{
        userType: string;
    } | false>;
    signIn(data: SigninDto): Promise<AuthResult>;
    extendToken(userClass: any, user: any): Promise<AuthResult>;
    getCurrentUser(userClass: any, user: any): {
        user: any;
        userType: string;
    };
}
