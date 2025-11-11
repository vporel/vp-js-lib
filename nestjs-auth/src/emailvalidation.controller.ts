import { Body, Controller, HttpCode, HttpException, HttpStatus, Inject, Post, Res, UseGuards } from "@nestjs/common";
import { IsEmail, IsNumber, Length, Max, Min } from "class-validator";
import { MailerService } from "@vporel/nestjs-mailer";
import { compileTemplate } from "@vporel/handlebars";
import { CurrentUser, CurrentUserClass } from "./auth.decorators";
import { AuthGuard } from "./auth.guard";
import { AuthModuleOptions } from "./auth.module";
import { IUserFinder } from "./user-finder.interface";
import { IUser } from "./user.interface";
import { EmailValidationService } from "./emailvalidation.service";

export class CodeDto{
    @IsNumber()
    @Min(100000)
    @Max(999999)
    code: number
}

/**
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */
@Controller("auth")
export class EmailValidationController{

    constructor(
        private mailerService: MailerService,
        @Inject('AUTH_OPTIONS') private readonly authOptions: AuthModuleOptions,
        @Inject('USER_FINDER') private userFinder: IUserFinder,
        private emailValidationService: EmailValidationService
    ){}

    @Post('/send-email-validation-code')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async sendEmailValidationCode(@CurrentUser() user: IUser){
        if(this.authOptions.emailValidation?.byPass) return true
        const code = await this.emailValidationService.generateAndSaveCode(user.email)
        const sent = await this.mailerService.sendEmail(
            user.email,
            this.authOptions.emailValidation?.emailSubject, 
            compileTemplate(this.authOptions.emailValidation?.emailTemplatePath, {code}) 
        ) 
        if(!sent) throw new HttpException("Mailer error", HttpStatus.INTERNAL_SERVER_ERROR)
        return true
    }

    @Post('/validate-email-code')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    async validateCode(@Body() {code}: CodeDto, @CurrentUserClass() userClass, @CurrentUser() user: IUser): Promise<boolean>{
        if(this.authOptions.emailValidation?.byPass || await this.emailValidationService.testCode(user.email, code)){
            return await this.userFinder.markEmailAsValidated(userClass, user._id)
        }else
            throw new HttpException("Wrong code", HttpStatus.UNPROCESSABLE_ENTITY)
    }

}