import { Queue } from "src/helpers";

describe("Queue: ", () => {
	let uut: Queue<any>;
	const initial = ["1", { some: "2" }, 42];

	describe("class constructor", () => {
		let queueInstance: Queue<any>;
		describe("when no initial queue is provided", () => {
			beforeEach(() => {
				queueInstance = new Queue<any>();
			});
			it("should be defined", () => {
				expect(queueInstance).toBeDefined();
			});
			it("should have the correct properties", () => {
				const properties: Record<string, any> = {
					insert: queueInstance.push,
					remove: queueInstance.pop
				};
				Object.keys(properties).forEach(key => {
					expect(queueInstance).toHaveProperty(key);
					expect(queueInstance[key as keyof Queue<any>]).toEqual(properties[key]);
				});
			});
		});
		describe("when an initial queue is provided", () => {
			beforeEach(() => {
				queueInstance = new Queue<any>(...initial);
			});
			it("should be defined", () => {
				expect(queueInstance).toBeDefined();
			});
			it("should have the correct properties", () => {
				const properties: Record<string, any> = {
					insert: queueInstance.push,
					remove: queueInstance.pop
				};
				Object.keys(properties).forEach(key => {
					expect(queueInstance).toHaveProperty(key);
					expect(queueInstance[key as keyof Queue<any>]).toEqual(properties[key]);
				});
			});
		});
	});

	beforeEach(() => {
		uut = new Queue<any>(...initial);
	});

	describe("class methods", () => {
		const item = { some: "value" };
		describe("insert", () => {
			it("should add a value to the end of the queue", () => {
				uut.insert(item);
				expect(JSON.stringify(uut)).toBe(
					JSON.stringify(new Queue<any>(...initial, item))
				);
			});
		});

		describe("remove", () => {
			describe("when the queue is not empty", () => {
				const output = ["1", { some: "2" }];
				it("should remove the last element of the queue", () => {
					const result = uut.remove();

					expect(result).toEqual(42);
					expect(JSON.stringify(uut)).toBe(JSON.stringify(new Queue<any>(...output)));
				});
			});
			describe("when the queue is empty", () => {
				let emptyQueue: Queue<any>;
				beforeEach(() => {
					emptyQueue = new Queue<any>();
				});
				it("should return 'undefined'", () => {
					const result = emptyQueue.pop();
					expect(result).toBeUndefined();
					expect(JSON.stringify(emptyQueue)).toBe(JSON.stringify(new Queue<any>()));
				});
			});
		});
	});
});
