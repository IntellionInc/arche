import { Queue, Stack } from "./helpers";
import { Hook } from "./Hook";
import { ChainHook, HookBucket, ContextInterface, Yield } from "./types";
import { DefaultContext } from "./Context";

export class Chain {
	options: Record<string, any> = {};
	currentHook: Hook | null = null;
	_initiallyHooks = new Stack<Hook>();
	_beforeHooks = new Queue<Hook>();
	_mainHooks = new Queue<Hook>();
	_afterHooks = new Queue<Hook>();
	_finallyHooks = new Queue<Hook>();
	duration = 0;
	yield: Yield<any> = { success: true, data: null, errors: [] };
	createdAt = new Date();
	shouldBreak = true;
	skipsToFinally = false;
	context: ContextInterface = new DefaultContext();
	errors: Error[] = [];

	constructor(options: Record<string, any> = {}) {
		Object.keys(options).forEach(key => (this.options[key] = options[key]));
	}

	get x() {
		return this.exec();
	}

	addHook = (type: ChainHook, method: (args: any) => any, ...args: any[]) => {
		const newHook = new Hook(type, method.bind(this.context, ...args), this.context);
		const selectedHook = this[`_${type}Hooks` as keyof Chain] as HookBucket<Hook>;
		selectedHook.insert(newHook);
		return this;
	};

	addAndThen = (method: (args: any) => any) => {
		const lastFilled =
			[
				this._finallyHooks,
				this._afterHooks,
				this._mainHooks,
				this._beforeHooks,
				this._initiallyHooks
			].find(hooks => hooks.length > 0) || this._initiallyHooks;
		lastFilled.push(new Hook("andThen", method, this.context));
		return this;
	};

	initially = this.addHook.bind(this, "initially");
	before = this.addHook.bind(this, "before");
	main = this.addHook.bind(this, "main");
	after = this.addHook.bind(this, "after");
	finally = this.addHook.bind(this, "finally");

	andThen = this.addAndThen.bind(this);

	exec = async () => {
		const hooksList = [
			...this._initiallyHooks,
			...this._beforeHooks,
			...this._mainHooks,
			...this._afterHooks
		];
		await this.#callHooks(hooksList);
		this.duration = new Date().getTime() - this.createdAt.getTime();
		if (this.shouldBreak) this.shouldBreak = false;
		if (this.skipsToFinally) this.skipsToFinally = false;
		await this.#callHooks([...this._finallyHooks]);

		Object.assign(this.yield, { errors: this.errors });
		return this.yield;
	};

	#consumeHook = async (hook: Hook) => {
		this.currentHook = hook;
		await hook.call();
		if (!hook.success) {
			await this._errorHandler(hook.error);
			if (this.shouldBreak) {
				return false;
			}
		}
		return !this.skipsToFinally;
	};

	#callHooks = async (hookList: Hook[]) => {
		for (const instance of hookList) {
			if (!(await this.#consumeHook(instance))) break;
		}
	};

	private _errorHandler = async (error: Error) => {
		this.errors.push(error);
		this.errorHandler(error);
	};

	async errorHandler(error: Error) {
		console.log(`Hook Error at: ${this.constructor.name}`);
		console.error(error);
	}
}
