import { CanActivate, ExecutionContext } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { IUserFinder } from "./user-finder.interface";
/**
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */
export declare class AuthGuard implements CanActivate {
    private reflector;
    private jwtService;
    private userFinder;
    constructor(reflector: Reflector, jwtService: JwtService, userFinder: IUserFinder);
    canActivate(context: ExecutionContext): Promise<boolean>;
    verifyRoles(requiredRoles: string[], request: any): boolean;
    extractTokenFromHeaders(request: any): string | undefined;
}
