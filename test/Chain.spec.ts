import { Chain } from "src/Chain";
import { Hook } from "src/Hook";
import { Queue, Stack } from "src/helpers";
import { ChainHook, Yield } from "src/types";
import { DefaultContext } from "src/Context";

declare global {
	namespace jest {
		interface Matchers<R> {
			toHaveBeenCalledBefore(fn: jest.Mock): R;
		}
	}
}

const toHaveBeenCalledBefore = (received: jest.Mock, comparison: jest.Mock) =>
	received.mock.invocationCallOrder[0] < comparison.mock.invocationCallOrder[0]
		? {
				pass: true,
				message: () => `expected ${received} not to have been called before ${comparison}`
		  }
		: {
				pass: false,
				message: () => `expected ${received} to have been called before ${comparison}`
		  };

expect.extend({ toHaveBeenCalledBefore });

jest.mock("../src/Hook.ts", () => ({
	Hook: class MockHook {
		constructor(public hookType: any, public hookMethod: any) {}
		call = jest.fn().mockImplementation(async () => {
			const { success, error } = await this.hookMethod();
			Object.assign(this, { success, error });
			return this;
		});
	}
}));

jest.mock("../src/Context.ts");

describe("Chain: ", () => {
	let uut: Chain;
	const options: Record<string, any> = {
		option1: "option1",
		option2: { some: "option2" }
	};

	beforeAll(() => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date(1609459200000)); // 2021-01-01
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	describe("class constructor", () => {
		let instance: Chain;

		describe("when options object is provided", () => {
			beforeEach(() => {
				instance = new Chain(options);
			});

			it("should be defined with the correct options", () => {
				expect(instance).toBeDefined();
				Object.keys(options).forEach(key => {
					expect(instance.options).toHaveProperty(key);
					expect(instance.options[key]).toEqual(options[key]);
				});
			});
		});

		describe("when options object is not provided", () => {
			beforeEach(() => {
				instance = new Chain();
			});

			it("should be defined", () => {
				expect(instance).toBeDefined();
			});
		});
	});

	beforeEach(() => {
		uut = new Chain(options);
	});

	it("should have the correct properties", () => {
		const classProperties: Record<string, any> = {
			_initiallyHooks: new Stack<Hook>(),
			currentHook: null,
			_beforeHooks: new Queue<Hook>(),
			_mainHooks: new Queue<Hook>(),
			_afterHooks: new Queue<Hook>(),
			_finallyHooks: new Queue<Hook>(),
			duration: 0,
			yield: { success: true, data: null, errors: [] },
			createdAt: new Date(1609459200000),
			shouldBreak: true,
			context: new DefaultContext(),
			errors: []
		};

		Object.keys(classProperties).forEach(key => {
			expect(uut).toHaveProperty(key);
			expect(JSON.stringify(uut[key as keyof Chain])).toEqual(
				JSON.stringify(classProperties[key])
			);
		});
	});

	describe("hooks", () => {
		describe("individual hooks", () => {
			let mockFn1: jest.Mock;
			let mockFn2: jest.Mock;

			beforeEach(() => {
				mockFn1 = jest.fn().mockResolvedValue({ success: true });
				mockFn2 = jest.fn().mockResolvedValue({ success: true });
			});

			describe("initially", () => {
				it("should add an initially hook to chain", async () => {
					await uut.initially(mockFn2).initially(mockFn1).x;

					expect(mockFn1).toHaveBeenCalledBefore(mockFn2);
				});
			});

			const hooks: ChainHook[] = ["before", "main", "after", "finally", "andThen"];
			hooks.forEach(hook => {
				describe(hook, () => {
					it(`should add ${hook} hooks to chain`, async () => {
						await uut[hook](mockFn1)[hook](mockFn2).x;
						expect(mockFn1).toHaveBeenCalledBefore(mockFn2);
					});
				});
			});
		});

		describe("hook interactions", () => {
			let initially2: jest.Mock,
				initially1: jest.Mock,
				andThen1: jest.Mock,
				before1: jest.Mock,
				andThen2: jest.Mock,
				main1: jest.Mock,
				andThen3: jest.Mock,
				after1: jest.Mock,
				andThen4: jest.Mock,
				finally1: jest.Mock,
				andThen5: jest.Mock;

			let hooksArray: { name: ChainHook; fn: any }[];

			beforeEach(() => {
				initially2 = jest.fn().mockResolvedValue({ success: true });
				initially1 = jest.fn().mockResolvedValue({ success: true });
				andThen1 = jest.fn().mockResolvedValue({ success: true });
				before1 = jest.fn().mockResolvedValue({ success: true });
				andThen2 = jest.fn().mockResolvedValue({ success: true });
				main1 = jest.fn().mockResolvedValue({ success: true });
				andThen3 = jest.fn().mockResolvedValue({ success: true });
				after1 = jest.fn().mockResolvedValue({ success: true });
				andThen4 = jest.fn().mockResolvedValue({ success: true });
				finally1 = jest.fn().mockResolvedValue({ success: true });
				andThen5 = jest.fn().mockResolvedValue({ success: true });

				hooksArray = [
					{ name: "initially", fn: initially2 },
					{ name: "initially", fn: initially1 },
					{ name: "andThen", fn: andThen1 },
					{ name: "before", fn: before1 },
					{ name: "andThen", fn: andThen2 },
					{ name: "main", fn: main1 },
					{ name: "andThen", fn: andThen3 },
					{ name: "after", fn: after1 },
					{ name: "andThen", fn: andThen4 },
					{ name: "finally", fn: finally1 },
					{ name: "andThen", fn: andThen5 }
				];
			});

			it("should call chain methods with the correct order", async () => {
				let chain = new Chain();
				hooksArray.forEach(({ name, fn }) => {
					chain = chain[name](fn);
				});
				await chain.x;

				expect(initially1).toHaveBeenCalledBefore(initially2);
				expect(initially2).toHaveBeenCalledBefore(andThen1);

				[4, 5, 6, 7, 8, 9, 10].forEach(functionOrder => {
					const currentFunction = hooksArray[functionOrder].fn;
					const previousFunction = hooksArray[functionOrder - 1].fn;
					expect(previousFunction).toHaveBeenCalledBefore(currentFunction);
				});
			});
		});

		describe("chain operation", () => {
			let mockFn1: jest.Mock,
				mockFn2: jest.Mock,
				mockFn3: jest.Mock,
				mockFn4: jest.Mock,
				mockFn5: jest.Mock,
				mockFn6: jest.Mock;

			let hookMethods: jest.Mock[];
			const chainYield = { some: "yield" } as unknown as Yield<any>;
			beforeEach(() => {
				jest.advanceTimersByTime(5000);
				uut.yield = chainYield;

				mockFn1 = jest.fn().mockResolvedValue({ success: true });
				mockFn2 = jest.fn().mockResolvedValue({ success: true });
				mockFn3 = jest.fn().mockResolvedValue({ success: true });
				mockFn4 = jest.fn().mockResolvedValue({ success: true });
				mockFn5 = jest.fn().mockResolvedValue({ success: true });
				mockFn6 = jest.fn().mockResolvedValue({ success: true });
			});

			afterEach(() => {
				expect(uut.duration).toBe(5000);
				expect(uut.yield).toBe(chainYield);
			});

			describe("when all hooks are successful", () => {
				beforeEach(async () => {
					hookMethods = [mockFn1, mockFn2, mockFn3, mockFn4, mockFn5, mockFn6];

					await uut
						.before(mockFn1)
						.main(mockFn2)
						.after(mockFn3)
						.finally(mockFn4)
						.finally(mockFn5)
						.finally(mockFn6).x;
				});

				it("should call all the hooks", async () => {
					hookMethods.forEach(method => expect(method).toHaveBeenCalled());
				});
			});

			describe("when some hooks are not successful", () => {
				const mockConstructorName = "some-constructor-name";
				const error = { message: "some-error-message" };
				let mockConsoleLog: jest.Mock;
				let actualConsoleLog: any;
				let mockConsoleError: jest.Mock;
				let actualConsoleError: any;

				beforeAll(() => {
					mockConsoleLog = jest.fn();
					mockConsoleError = jest.fn();
					actualConsoleLog = console.log;
					actualConsoleError = console.error;
					console.log = mockConsoleLog;
					console.error = mockConsoleError;
				});

				afterAll(() => {
					console.log = actualConsoleLog;
					console.error = actualConsoleError;
				});

				beforeEach(() => {
					Object.assign(uut, { constructor: { name: mockConstructorName } });
				});

				afterEach(() => {
					expect(mockConsoleLog).toHaveBeenCalledWith(
						`Hook Error at: ${mockConstructorName}`
					);
					expect(mockConsoleError).toHaveBeenCalledWith(error);
					expect(uut.errors).toEqual([error]);
				});

				describe("when 'shouldBreak' is true", () => {
					describe("when a hook before 'finally' hooks is unsuccessful", () => {
						beforeEach(() => {
							mockFn2 = jest.fn().mockResolvedValue({ success: false, error });
							hookMethods = [mockFn1, mockFn2, mockFn3, mockFn4, mockFn5, mockFn6];
						});

						it("should break on error and call all 'finally' hooks", async () => {
							await uut
								.before(mockFn1)
								.main(mockFn2)
								.after(mockFn3)
								.finally(mockFn4)
								.finally(mockFn5)
								.finally(mockFn6).x;

							[mockFn1, mockFn2, mockFn4, mockFn5, mockFn6].forEach(method =>
								expect(method).toHaveBeenCalled()
							);
							expect(mockFn3).not.toHaveBeenCalled();
						});
					});

					describe("when one of the 'finally' hooks are unsuccessful", () => {
						beforeEach(async () => {
							mockFn4 = jest.fn().mockResolvedValue({ success: false, error });
							hookMethods = [mockFn1, mockFn2, mockFn3, mockFn4, mockFn5, mockFn6];
							await uut
								.before(mockFn1)
								.main(mockFn2)
								.after(mockFn3)
								.finally(mockFn4)
								.finally(mockFn5)
								.finally(mockFn6).x;
						});

						it("should call all the hooks", () => {
							hookMethods.forEach(method => expect(method).toHaveBeenCalled());
						});
					});
				});

				describe("when 'shouldBreak' is false", () => {
					beforeEach(async () => {
						mockFn2 = jest.fn().mockResolvedValue({ success: false, error });
						hookMethods = [mockFn1, mockFn2, mockFn3, mockFn4, mockFn5, mockFn6];
						uut.shouldBreak = false;

						await uut
							.before(mockFn1)
							.main(mockFn2)
							.after(mockFn3)
							.finally(mockFn4)
							.finally(mockFn5)
							.finally(mockFn6).x;
					});

					it("should call all the hooks", async () => {
						hookMethods.forEach(method => expect(method).toHaveBeenCalled());
					});
				});
			});
		});
	});
});
