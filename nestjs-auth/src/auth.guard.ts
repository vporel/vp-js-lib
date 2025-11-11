import { CanActivate, ExecutionContext, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SKIP_AUTH_KEY } from "./auth.decorators";
import { Reflector } from "@nestjs/core";
import { AuthModuleOptions } from "./auth.module";
import { IUserFinder } from "./user-finder.interface";
import { ROLES_KEY } from "./roles.decorator";
import { AuthPayload } from "./auth.service";
import { IUser } from "./user.interface";


/**
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */
@Injectable()
export class AuthGuard implements CanActivate{
    constructor(
        private reflector: Reflector,
        private jwtService: JwtService, 
        @Inject('USER_FINDER') private userFinder: IUserFinder,
    ){}

    async canActivate(context: ExecutionContext): Promise<boolean>{
        const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [context.getHandler(), context.getClass()]);
        if(skipAuth) return true
        const request = context.switchToHttp().getRequest()
        const token = this.extractTokenFromHeaders(request)
        if(!token) throw new UnauthorizedException("no_token_provided")
        try{
            const payload: AuthPayload = await this.jwtService.verifyAsync(token)
            request.userClass = payload.userClass
            request.user = await this.userFinder.findById(payload.userClass, payload.userId)
            if(!request.user) throw new InternalServerErrorException("The retrieved authenticated user is null or undefined")
        }catch{
            throw new UnauthorizedException("invalid_token")
        }

        //Roles
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
        
        return this.verifyRoles(requiredRoles, request)
    }

    verifyRoles(requiredRoles: string[], request){
        if (!requiredRoles || requiredRoles.length == 0) return true;
        const { user } = request
        const userRoles = (user as IUser).getRoles()
        return requiredRoles.some((role) => userRoles.includes(role))
    }

    extractTokenFromHeaders(request): string|undefined{
        const [type, token] = request.headers.authorization?.split(' ') ?? []
        return type === "Bearer" ? token : undefined
    }
}