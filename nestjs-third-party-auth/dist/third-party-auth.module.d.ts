import { GoogleService } from './third-party.google.service';
import { ThirdPartyAuthService } from './third-party-auth.service';
export type ApisConfig = {
    google?: {
        clientId: string;
        clientSecret: string;
    };
};
export type ThirdPartyAuthModuleOptions = {
    apis: ApisConfig;
};
export declare class ThirdPartyAuthModule {
    static register(options: ThirdPartyAuthModuleOptions): {
        module: typeof ThirdPartyAuthModule;
        providers: (typeof GoogleService | typeof ThirdPartyAuthService | {
            provide: string;
            useValue: ApisConfig;
        })[];
        exports: (typeof GoogleService | typeof ThirdPartyAuthService)[];
    };
}
