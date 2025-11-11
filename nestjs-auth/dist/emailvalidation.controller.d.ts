import { MailerService } from "@vporel/nestjs-mailer";
import { AuthModuleOptions } from "./auth.module";
import { IUserFinder } from "./user-finder.interface";
import { IUser } from "./user.interface";
import { EmailValidationService } from "./emailvalidation.service";
export declare class CodeDto {
    code: number;
}
/**
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */
export declare class EmailValidationController {
    private mailerService;
    private readonly authOptions;
    private userFinder;
    private emailValidationService;
    constructor(mailerService: MailerService, authOptions: AuthModuleOptions, userFinder: IUserFinder, emailValidationService: EmailValidationService);
    sendEmailValidationCode(user: IUser): Promise<boolean>;
    validateCode({ code }: CodeDto, userClass: any, user: IUser): Promise<boolean>;
}
