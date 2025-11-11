import { SetMetadata, createParamDecorator, ExecutionContext } from "@nestjs/common";
import { IUser } from "./user.interface";

export const SKIP_AUTH_KEY = 'skip-auth'
export const SkipAuth = () => SetMetadata(SKIP_AUTH_KEY, true)

export const CurrentUserClass = createParamDecorator<undefined, ExecutionContext, string>((_, context) => {
    const request = context.switchToHttp().getRequest();
    return request.userClass as string;
})

export const CurrentUser = createParamDecorator<undefined, ExecutionContext, IUser>((_, context) => {
    const request = context.switchToHttp().getRequest();
    return request.user as IUser;
})