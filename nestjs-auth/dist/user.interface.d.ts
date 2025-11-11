export interface IUser {
    _id: string;
    email: string;
    emailValidated?: boolean;
    password: string;
    getRoles(): string[];
}
