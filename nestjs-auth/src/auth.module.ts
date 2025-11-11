import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { EmailValidationController } from './emailvalidation.controller';
import { ThirdPartyAuthModule, ThirdPartyAuthModuleOptions } from '@vporel/nestjs-third-party-auth';
import { AuthGuard } from './auth.guard';
import { SecuredPropertiesGuard } from './secured-properties.guard';
import { EmailValidationService } from './emailvalidation.service';
import { IUserFinder } from './user-finder.interface';

export type AuthModuleOptions = {
  jwtSecretKey: string
  jwtExpirationTime: string
  thirdPartyAuthOptions?: ThirdPartyAuthModuleOptions
  userFinder: Provider|IUserFinder
  emailValidation?: {
    emailTemplatePath: string
    emailSubject: string,
    byPass?: boolean
  },
  usersRoles: string[]
};

@Global()
@Module({})
export class AuthModule {
  static forRoot(options: AuthModuleOptions): DynamicModule {
    const imports = [
      JwtModule.registerAsync({
        global: true,
        useFactory: async () => ({
          secret: options.jwtSecretKey,         
          signOptions: { expiresIn: options.jwtExpirationTime },         
        })  
      }),
    ]
    
    if(options.thirdPartyAuthOptions)imports.push(ThirdPartyAuthModule.register(options.thirdPartyAuthOptions))

    const controllers: any[] = [AuthController]
    if(options.emailValidation)controllers.push(EmailValidationController)

    const providers: Provider[] = [
      {provide: 'AUTH_OPTIONS', useValue: options},
      AuthService,
      AuthGuard,
      SecuredPropertiesGuard,
      EmailValidationService
    ]
    if(typeof options.userFinder == 'function')
      providers.push({provide: 'USER_FINDER', useClass: options.userFinder})
    else 
      providers.push({provide: 'USER_FINDER', useValue: options.userFinder})

    return {
      module: AuthModule,
      imports,
      providers, 
      controllers,
      exports: ['AUTH_OPTIONS', 'USER_FINDER', AuthService, AuthGuard, SecuredPropertiesGuard, EmailValidationService]
    };
  }
}
