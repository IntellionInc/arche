import { ContextInterface, DictionaryKey } from "./types";

export class Hook {
	success = true;
	called = false;
	callCount = 0;
	result: any = null;
	error: any = null;

	constructor(
		public hookType: string,
		public hookMethod: (...args: any[]) => any,
		public context: ContextInterface
	) {}

	call = async (...args: any[]) => {
		this.callCount += 1;
		this.called = true;
		try {
			this.result = await this.hookMethod(...args);
			if (this.result && !this.result.success) this.#errorHandler(this.result.error);
		} catch (error) {
			this.#errorHandler(error);
		}

		return this;
	};

	#errorHandler = (error: any) => {
		this.success = false;
		const Dictionary = this.context.errorTable;
		const key: DictionaryKey = Dictionary.hasOwnProperty(error.name)
			? error.name
			: "DEFAULT";
		this.error = new Dictionary[key](this, error);
	};
}
