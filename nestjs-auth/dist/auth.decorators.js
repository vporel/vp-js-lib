"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = exports.CurrentUserClass = exports.SkipAuth = exports.SKIP_AUTH_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.SKIP_AUTH_KEY = 'skip-auth';
const SkipAuth = () => (0, common_1.SetMetadata)(exports.SKIP_AUTH_KEY, true);
exports.SkipAuth = SkipAuth;
exports.CurrentUserClass = (0, common_1.createParamDecorator)((_, context) => {
    const request = context.switchToHttp().getRequest();
    return request.userClass;
});
exports.CurrentUser = (0, common_1.createParamDecorator)((_, context) => {
    const request = context.switchToHttp().getRequest();
    return request.user;
});
