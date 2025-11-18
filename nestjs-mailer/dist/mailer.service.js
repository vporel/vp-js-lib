"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerService = void 0;
const common_1 = require("@nestjs/common");
const node_mailjet_1 = require("node-mailjet");
const nodemailer_1 = require("nodemailer");
const mailer_module_1 = require("./mailer.module");
let MailerService = class MailerService {
    options;
    constructor(options) {
        this.options = options;
    }
    async sendEmail(receivers, subject, body) {
        if (typeof receivers == "string") {
            if (receivers.indexOf(",") != -1)
                receivers = receivers.split(","); // Many receivers
            else
                receivers = [receivers]; //One receiver changed into an array
        }
        switch (this.options.apiService) {
            case "gmail": return await this.gmail(receivers, subject, body);
            case "mailjet": return await this.mailjet(receivers, subject, body);
        }
    }
    async mailjet(receivers, subject, body) {
        const mailjet = new node_mailjet_1.Client({
            apiKey: this.options.mailjet?.apiKey,
            apiSecret: this.options.mailjet?.apiSecret
        });
        const mailjetReceiversArray = [];
        for (let receiver of receivers) {
            if (receiver != null && receiver != "")
                mailjetReceiversArray.push({ Email: receiver });
        }
        try {
            await mailjet.post('send', { version: 'v3.1' }).request({
                Messages: [{
                        From: { Email: this.options.mailjet?.email, Name: this.options.mailjet?.name },
                        To: mailjetReceiversArray,
                        Subject: subject,
                        HTMLPart: body
                    }],
            });
            return true;
        }
        catch {
            return false;
        }
    }
    async gmail(receivers, subject, body) {
        const senderEmail = this.options.gmail.email;
        const senderPass = this.options.gmail.pass;
        const transporter = (0, nodemailer_1.createTransport)({
            service: "gmail",
            secure: false,
            auth: {
                user: senderEmail,
                pass: senderPass
            }
        });
        return new Promise(function (resolve) {
            transporter.sendMail({
                from: senderEmail,
                to: receivers,
                subject,
                html: body
            }, err => {
                if (err) {
                    if (process.env.APP_ENV == "dev")
                        console.log(err);
                    resolve(false);
                }
                else {
                    resolve(true);
                }
            });
        });
    }
};
exports.MailerService = MailerService;
exports.MailerService = MailerService = __decorate([
    __param(0, (0, common_1.Inject)(mailer_module_1.MAILER_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], MailerService);
