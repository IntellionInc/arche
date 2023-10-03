import { Hook } from "src/Hook";
import { ContextInterface } from "src/types";

describe("Hook: ", () => {
	let uut: Hook;
	const [hookType, hookMethod, mockContext] = [
		"mockType",
		jest.fn(),
		{} as ContextInterface
	];
	beforeEach(() => {
		uut = new Hook(hookType, hookMethod, mockContext);
	});
	describe("class constructor", () => {
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
	});

	describe("Class Methods", () => {
		describe("call", () => {
			const methodArgs = ["param1", { some: "param2" }, 42];

			describe("when the hook method resolves", () => {
				const methodResult = { some: "result", success: null, error: null };

				beforeEach(() => {
					hookMethod.mockResolvedValue(methodResult);
					Object.assign(uut, { success: true });
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
						expect(hookMethod).toHaveBeenCalledWith(...methodArgs);
						expect(uut.callCount).toBe(1);
					});
				});

				describe("when the result is unsuccessful", () => {
					const error = { message: "some-error-message" };

					beforeEach(() => {
						Object.assign(methodResult, { success: false, error });
					});

					it("should set success as false, and error to received error", async () => {
						const result = await uut.call(...methodArgs);
						expect(result).toBe(uut);
						expect(hookMethod).toHaveBeenCalledWith(...methodArgs);
						expect(uut.error).toBe(error);
					});

					describe("when the error is undefined", () => {
						beforeEach(() => {
							Object.assign(methodResult, { success: false, error: undefined });
						});

						it("should set success as false, and create a new error with correct message", async () => {
							const result = await uut.call(...methodArgs);
							expect(result).toBe(uut);
							expect(hookMethod).toHaveBeenCalledWith(...methodArgs);
							expect(uut.error.message).toBe(
								`Hook returned with an unsuccessful response: ${JSON.stringify({
									some: "result",
									success: false
								})}`
							);
						});
					});
				});
			});

			describe("when the result is not defined, and method rejects with no error", () => {
				beforeEach(() => {
					hookMethod.mockRejectedValue(undefined);
				});

				it("should set success as false, and create a new error with correct message", async () => {
					const result = await uut.call(...methodArgs);
					expect(result).toBe(uut);
					expect(hookMethod).toHaveBeenCalledWith(...methodArgs);
					expect(uut.error.message).toBe("Hook returned with an unsuccessful response");
				});
			});

			describe("when the hook method throws an error", () => {
				const error = { message: "some-error-message" };

				beforeEach(() => {
					hookMethod.mockRejectedValue(error);
				});

				it("should set success as false, and error to thrown error", async () => {
					const result = await uut.call(...methodArgs);
					expect(result).toBe(uut);
					expect(hookMethod).toHaveBeenCalledWith(...methodArgs);
					expect(result.error).toBe(error);
				});
			});
		});
	});
});
