/**
 * @description Interface for the user finder service
 * @author Vivian NKOUANANG (https://github.com/vporel) <dev.vporel@gmail.com>
 */
import { IUser } from "./user.interface";
export interface IUserFinder {
    /**
     * @param userClass The name of the user class
     * @param id The id of the user to find
     */
    findById(userClass: string, id: string): Promise<IUser | null>;
    /**
     * @param email The email of the user to find
     */
    findByEmail(email: string): Promise<{
        user: IUser;
        userClass: string;
    } | null>;
    /**
     * @param password The password in real text provided by the user
     * @param hash The hashed stored password
     * @returns A promise that resolves to true if the password is correct, false otherwise
     */
    comparePasswords(password: string, hash: string): Promise<boolean>;
    /**
     * Should have a definition if the email validation is enabled in the auth module options.
     * @param userClass The name of the user class
     * @param id The id of the user to find
     */
    markEmailAsValidated(userClass: string, id: string): Promise<boolean>;
}
