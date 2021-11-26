import { DefaultContext } from "src/Context";
import { DefaultErrorDictionary } from "src/errors";

jest.mock("../src/errors/ErrorDictionary.ts");
describe("Context: ", () => {
	let uut: DefaultContext;
	describe("class constructor", () => {
		uut = new DefaultContext();
	});
	it("should be defined", () => {
		expect(uut).toBeDefined();
	});
	it("should have the correct properties", () => {
		expect(uut).toHaveProperty("errorTable");
		expect(uut.errorTable).toBe(DefaultErrorDictionary);
	});
});
