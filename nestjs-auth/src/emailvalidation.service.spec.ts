import { mock } from 'jest-mock-extended';
import { EmailValidationService } from './emailvalidation.service';

describe('EmailValidationService', () => {
	let service: EmailValidationService;

	beforeEach(() => {
		service = new EmailValidationService();
	});

	describe('generateAndSaveCode', () => {
		it('should generate a valid code', async () => {
			const code = await service.generateAndSaveCode('test@example.com');
			expect(code).toBeGreaterThanOrEqual(100000);
			expect(code).toBeLessThanOrEqual(999999);
		})
	})

	describe('generateAndSaveCode + testCode', () => {
		it('should return false for a wrong email', async () => {
			const email = 'test@example.com';
			const code = await service.generateAndSaveCode(email);
			const isValid = await service.testCode('wrongemail', code); // Invalid code
			expect(isValid).toBe(false);
		})

		it('should return false for a wrong code', async () => {
			const email = 'test@example.com';
			const code = await service.generateAndSaveCode(email);
			const isValid = await service.testCode(email, 111111); // Invalid code
			expect(isValid).toBe(false);
		})

		it('should return true for a valid email/code pair', async () => {
			const email = 'test@example.com' ;
			const code = await service.generateAndSaveCode(email);
			const isValid = await service.testCode(email, code);
			expect(isValid).toBe(true);
		})
	})
})