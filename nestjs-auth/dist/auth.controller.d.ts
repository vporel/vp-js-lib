import { AuthResult, AuthService, SigninDto } from "./auth.service";
/**
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signIn(data: SigninDto): Promise<AuthResult>;
    extendToken(user: any, userClass: any): Promise<AuthResult>;
    getCurrentUser(userClass: any, user: any): {
        user: any;
        userType: string;
    };
}
