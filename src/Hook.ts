import { ContextInterface, DictionaryKey, HookErrorDictionary } from "./types";

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

	#errorHandler = (error: any) => {
		this.success = false;
		const Dictionary = this.context.errorTable;
		const key = this.#getErrorKey(error, Dictionary);
		this.error = new Dictionary[key](this, error);
	};

	#getErrorKey = (error: any, Dictionary: HookErrorDictionary): DictionaryKey => {
		if (!error) return "BROKEN_CHAIN";
		if (!error.name) return "DEFAULT";
		return Dictionary.hasOwnProperty(error.name) ? error.name : "DEFAULT";
	};
}
