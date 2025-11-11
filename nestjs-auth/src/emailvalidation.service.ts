import { Injectable } from "@nestjs/common";


@Injectable()
export class EmailValidationService{
    private SAVED_CODES: {email: string, code: number}[] = []

	constructor(
		
	){}

	async generateAndSaveCode(email: string): Promise<number>{
		const code = await this.generateRandomCode()
		await this.saveCode(email, code)
		return code
	}

    async testCode(email: string, code: number): Promise<boolean>{
        return !!this.SAVED_CODES.find(el => el.email == email && el.code == code)
    }
	
    private async saveCode(email: string, code: number): Promise<void>{
        this.SAVED_CODES.push({email, code})
    }

    private async generateRandomCode(): Promise<number>{
        const min = 100000;
        const max = 999999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}