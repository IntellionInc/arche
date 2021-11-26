import { Stack } from "src/helpers";

describe("Stack: ", () => {
	let uut: Stack<any>;
	const initial = ["1", { some: "2" }, 42];
	beforeEach(() => {
		uut = new Stack<any>(...initial);
	});

	describe("class constructor", () => {
		let stackInstance: Stack<any>;
		describe("when no initial stack object is provided", () => {
			beforeEach(() => {
				stackInstance = new Stack<any>();
			});
			it("should be defined", () => {
				expect(stackInstance).toBeDefined();
			});
			it("should have correct properties", () => {
				const properties: Record<string, any> = {
					insert: stackInstance.unshift,
					remove: stackInstance.pop
				};

				Object.keys(properties).forEach(key => {
					expect(stackInstance).toHaveProperty(key);
					expect(stackInstance[key as keyof Stack<any>]).toEqual(properties[key]);
				});
			});
		});
		describe("when an initial stack object is provided", () => {
			beforeEach(() => {
				stackInstance = new Stack<any>(...initial);
			});
			it("should be defined", () => {
				expect(stackInstance).toBeDefined();
			});
			it("should have correct properties", () => {
				const properties: Record<string, any> = {
					insert: stackInstance.unshift,
					remove: stackInstance.pop
				};

				Object.keys(properties).forEach(key => {
					expect(stackInstance).toHaveProperty(key);
					expect(stackInstance[key as keyof Stack<any>]).toEqual(properties[key]);
				});
			});
		});
	});

	describe("class methods", () => {
		const item = { some: "item" };
		describe("insert", () => {
			it("should push an item to the top of the stack", () => {
				uut.insert(item);
				expect(JSON.stringify(uut)).toEqual(
					JSON.stringify(new Stack<any>(item, ...initial))
				);
			});
		});

		describe("remove", () => {
			describe("when the stack is not empty", () => {
				const output = ["1", { some: "2" }];
				it("should remove the last element from the stack", () => {
					const result = uut.remove();
					expect(result).toBe(42);
					expect(JSON.stringify(uut)).toEqual(JSON.stringify(new Stack<any>(...output)));
				});
			});

			describe("when the stack is empty", () => {
				let emptyStack: Stack<any>;
				beforeEach(() => {
					emptyStack = new Stack<any>();
				});
				it("should  return 'undefined'", () => {
					const result = emptyStack.remove();
					expect(result).toBeUndefined();
					expect(JSON.stringify(emptyStack)).toEqual(JSON.stringify(new Stack<any>()));
				});
			});
		});
	});
});
