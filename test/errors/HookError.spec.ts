import { Hook } from "src/";
import { HookError, TentativeError } from "src/errors";

describe("HookError: ", () => {
	let uut: HookError;
	const error = { message: "some-error-message" } as Error;
	const mockHook = {} as Hook;
	describe("class constructor", () => {
		beforeEach(() => {
			uut = new HookError(mockHook, error);
		});
		it("should be defined", () => {
			expect(uut).toBeDefined();
		});

		it("should extend 'Error'", () => {
			expect(uut).toBeInstanceOf(Error);
		});

		it("should have correct properties", () => {
			["hook", "error"].forEach(item => {
				expect(uut).toHaveProperty(item);
			});
		});
	});

	describe("class methods", () => {
		describe("handle", () => {
			it("should throw by default", async () => {
				expect.assertions(1);
				try {
					await uut.handle();
				} catch (err) {
					expect(err).toBe(error);
				}
			});
		});
	});
});

describe("TentativeError: ", () => {
	let uut: TentativeError;
	class MockTentativeError extends TentativeError {
		maxRetries = 3; // this number is arbitrary.
		backoffMultiplier = 42;
	}
	const mockHook = { call: null, callCount: 0 } as unknown as Hook;
	const error = { message: "some-error-message" } as Error;
	beforeAll(() => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date(1609459200000)); // 2021-01-01
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	beforeEach(() => {
		uut = new MockTentativeError(mockHook, error);
	});

	it("should be defined", () => {
		expect(uut).toBeDefined();
	});
	it("should extend 'HookError'", () => {
		expect(uut).toBeInstanceOf(HookError);
	});
	it("should have correct properties", () => {
		const properties: Record<string, any> = {
			maxRetries: 3,
			backoffMultiplier: 42,
			hook: mockHook,
			error
		};
		Object.keys(properties).forEach(key => {
			expect(uut).toHaveProperty(key);
			expect(uut[key as keyof TentativeError]).toBe(properties[key]);
		});
	});

	describe("class methods", () => {
		let mockHookCall: jest.Mock;
		describe("handle", () => {
			beforeEach(() => {
				mockHookCall = jest.fn();
				mockHook.call = mockHookCall;
			});
			describe("when retry count is not exhausted", () => {
				beforeEach(() => {
					mockHook.callCount = 2;
				});

				afterEach(() => {
					expect(mockHookCall).toHaveBeenCalled();
				});
				it("should call the hook one more time", () => {
					uut.handle();
					jest.advanceTimersByTime(42 * 2);
				});
			});

			describe("when retry count is exhausted", () => {
				beforeEach(() => {
					mockHook.callCount = 4;
				});
				it("should throw an error", async () => {
					expect.assertions(1);
					try {
						await uut.handle();
					} catch (err) {
						expect(err).toBe(error);
					}
				});
			});
		});
	});
});
