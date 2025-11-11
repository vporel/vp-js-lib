export declare class EmailValidationService {
    private SAVED_CODES;
    constructor();
    generateAndSaveCode(email: string): Promise<number>;
    testCode(email: string, code: number): Promise<boolean>;
    private saveCode;
    private generateRandomCode;
}
