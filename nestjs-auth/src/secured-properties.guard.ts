import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { getKeysDeepJoined } from "@vporel/misc";
import { SECURED_PROPERTIES_KEY } from "./secured-properties.decorator";
import { IUserFinder } from "./user-finder.interface";

/**
 * Can be used to force the user to provide a password to update some properties
 */
@Injectable()
export class SecuredPropertiesGuard implements CanActivate {
	constructor(private reflector: Reflector, @Inject("USER_FINDER") private userFinder: IUserFinder) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const securedProperties = this.reflector.getAllAndOverride<string[]>(SECURED_PROPERTIES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		const request = context.switchToHttp().getRequest();
		if (securedProperties.length == 0) return true;
		let passwordTestNeeded = false;
		for (let securedProp of securedProperties) {
			if (getKeysDeepJoined(request.body).includes(securedProp)) {
				passwordTestNeeded = true;
				break;
			}
		}
		if (!passwordTestNeeded) return true;
		if (!request.body.password || request.body.password == "")
			throw new ForbiddenException(
				"password_required_for_secured_properties: " + securedProperties.join(", ")
			);
		let testOk = await this.userFinder.comparePasswords(request.body.password, request.user?.password);
		if (!testOk)
			throw new ForbiddenException(
				"invalid_password_for_secured_properties: " + securedProperties.join(", ")
			);
		//Remove the password from the request
		delete request.body.password;
		return true;
	}
}
