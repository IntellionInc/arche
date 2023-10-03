import { ContextInterface, DictionaryKey, HookErrorDictionary } from "./types";

export class Hook {
	success = true;
	called = false;
	callCount = 0;
	result: any = null;
	error: Error = null;

	constructor(
		public hookType: string,
		public hookMethod: (...args: any[]) => any,
		public context: ContextInterface
	) {}

	call = async (...args: any[]): Promise<Hook> => {
		this.callCount += 1;
		this.called = true;
		try {
			this.result = await this.hookMethod(...args);
			if (this.result && this.result.success === false)
				this.#errorHandler(this.result.error);
		} catch (error) {
			this.#errorHandler(error);
		}

		return this;
	};

	#errorHandler = (error: Error | null) => {
		this.success = false;
		this.error = error
			? error
			: new Error(
					`Hook returned with an unsuccessful response${
						this.result ? `: ${JSON.stringify(this.result)}` : ""
					}`
			  );
	};
}
