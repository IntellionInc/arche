import { DefaultErrorDictionary, HookError, TentativeError } from "src/errors";

type ErrorKey = keyof typeof DefaultErrorDictionary;
type PropertyValue = typeof TentativeError | typeof HookError;

jest.mock("../../src/errors/HookError.ts");
describe("DefaultErrorDictionary: ", () => {
	const uut = DefaultErrorDictionary;
	it("should be defined", () => {
		expect(uut).toBeDefined();
	});
	it("should have correct properties", () => {
		const properties: Record<string, PropertyValue> = {
			ECONNREFUSED: TentativeError,
			ECONNRESET: TentativeError,
			EPIPE: TentativeError,
			ERR_STREAM_DESTROYED: TentativeError,
			DEFAULT: HookError
		};

		Object.keys(properties).forEach(key => {
			expect(uut).toHaveProperty(key);
			expect(uut[key as ErrorKey].constructor).toEqual(properties[key].constructor);
		});
	});
});
