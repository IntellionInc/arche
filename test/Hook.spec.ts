import { Hook } from "src/";
import { ContextInterface } from "src/types";

jest.mock("../src/errors/HookError.ts");
describe("Hook: ", () => {
	let uut: Hook;
	const [hookType, hookMethod, mockContext] = [
		"mockType",
		jest.fn(),
		{} as ContextInterface
	];
	describe("class constructor", () => {
		uut = new Hook(hookType, hookMethod, mockContext);
	});

	it("should be defined", () => {
		expect(uut).toBeDefined();
	});

	it("should have the correct properties", () => {
		const properties: Record<string, any> = {
			hookType,
			hookMethod,
			context: mockContext,
			success: true,
			called: false,
			callCount: 0,
			result: null,
			error: null
		};
		Object.keys(properties).forEach(key => {
			expect(uut).toHaveProperty(key);
			expect(uut[key as keyof Hook]).toBe(properties[key]);
		});
	});

	describe("Class Methods", () => {
		describe("call", () => {
			const methodArgs = ["param1", { some: "param2" }, 42];
			describe("when the hook method resolves", () => {
				const methodResult = { some: "result", success: null, error: null };

				beforeEach(() => {
					hookMethod.mockResolvedValueOnce(methodResult);
				});
				afterEach(() => {
					expect(uut.called).toBe(true);
					expect(uut.result).toBe(methodResult);
				});
				describe("when the result is successful", () => {
					beforeEach(() => {
						Object.assign(methodResult, { success: true, error: null });
					});
					it("it should set result, success and error objects accordingly", async () => {
						const result = await uut.call(...methodArgs);
						expect(uut.success).toBe(true);
						expect(uut.error).toBe(null);
						expect(result).toBe(uut);
						expect(hookMethod).toHaveBeenNthCalledWith(1, ...methodArgs);
						expect(uut.callCount).toBe(1);
					});
				});
				describe("when the result is unsuccessful", () => {
					const error = { name: "mockError" };
					const mockReturnedError = { message: "some-error-message" };

					beforeEach(() => {
						Object.assign(mockContext, {
							errorTable: {
								mockError: jest.fn().mockReturnValueOnce(mockReturnedError)
							}
						});
						Object.assign(methodResult, { success: false, error });
					});
					it("it should set success as false, and error as thrown error", async () => {
						const result = await uut.call(...methodArgs);
						expect(uut.success).toBe(false);
						expect(result).toBe(uut);
						expect(hookMethod).toHaveBeenNthCalledWith(2, ...methodArgs);
						expect(uut.error).toBe(mockReturnedError);
						expect(uut.callCount).toBe(2);
					});
				});
			});

			describe("when the hook method throws an error", () => {
				const error = { name: "mockError" };
				const mockReturnedError = { message: "some-error-message" };
				let mockError: jest.Mock;
				describe("when dictionary has an entry for the error", () => {
					beforeEach(() => {
						mockError = jest.fn().mockReturnValueOnce(mockReturnedError);
						Object.assign(mockContext, { errorTable: { mockError } });

						hookMethod.mockRejectedValueOnce(error);
					});
					afterEach(() => {
						expect(uut.success).toBe(false);
						expect(uut.error).toBe(mockReturnedError);
						expect(mockError).toHaveBeenCalledWith(uut, error);
					});

					it("should set success as false, and error to thrown error", async () => {
						expect.assertions(5);
						const result = await uut.call(...methodArgs);
						expect(result).toBe(uut);
						expect(hookMethod).toHaveBeenNthCalledWith(3, ...methodArgs);
					});
				});
				describe("when dictionary doesn't have an entry for the error", () => {
					const mockDefaultReturnedError = { message: "some-default-error" };
					let mockDefaultError: jest.Mock;
					beforeEach(() => {
						mockDefaultError = jest.fn().mockReturnValueOnce(mockDefaultReturnedError);
						Object.assign(mockContext, { errorTable: { DEFAULT: mockDefaultError } });
						hookMethod.mockRejectedValueOnce(error);
					});
					it("should set success as false, and error to default error", async () => {
						const result = await uut.call(...methodArgs);
						expect(result).toBe(uut);
						expect(hookMethod).toHaveBeenNthCalledWith(4, ...methodArgs);
						expect(mockDefaultError).toHaveBeenCalledWith(uut, error);
					});
				});
			});
		});
	});
});
