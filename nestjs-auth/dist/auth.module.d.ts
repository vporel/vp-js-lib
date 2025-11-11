import { DynamicModule, Provider } from '@nestjs/common';
import { ThirdPartyAuthModuleOptions } from '@vporel/nestjs-third-party-auth';
import { IUserFinder } from './user-finder.interface';
export type AuthModuleOptions = {
    jwtSecretKey: string;
    jwtExpirationTime: string;
    thirdPartyAuthOptions?: ThirdPartyAuthModuleOptions;
    userFinder: Provider | IUserFinder;
    emailValidation?: {
        emailTemplatePath: string;
        emailSubject: string;
        byPass?: boolean;
    };
    usersRoles: string[];
};
export declare class AuthModule {
    static forRoot(options: AuthModuleOptions): DynamicModule;
}
