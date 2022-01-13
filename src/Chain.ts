import { Queue, Stack } from "./helpers";
import { Hook } from "./Hook";
import { HookError } from "./errors";
import { ChainHook, HookBucket, ContextInterface } from "./types";
import { DefaultContext } from "./Context";

export class Chain {
	options: Record<string, any> = {};
	_initiallyHooks = new Stack<Hook>();
	_beforeHooks = new Queue<Hook>();
	_mainHooks = new Queue<Hook>();
	_afterHooks = new Queue<Hook>();
	_finallyHooks = new Queue<Hook>();
	duration = 0;
	yield = {};
	createdAt = new Date();
	shouldBreak = true;
	context: ContextInterface = new DefaultContext();

	constructor(options: Record<string, any> = {}) {
		Object.keys(options).forEach(key => (this.options[key] = options[key]));
	}

	get x() {
		return this.exec();
	}

	addHook = (type: ChainHook, method: (args: any) => any, ...args: any[]) => {
		const selectedHook = this[`_${type}Hooks` as keyof Chain] as HookBucket<Hook>;
		selectedHook.insert(new Hook(type, method.bind(this.context, ...args), this.context));
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
		await this.#callHooks([...this._finallyHooks]);
		return this.yield;
	};

	#consumeHook = async (hook: Hook) => {
		await hook.call();
		if (!hook.success) {
			await this.errorHandler(hook.error);
			if (this.shouldBreak) {
				return false;
			}
		}
		return true;
	};

	#callHooks = async (hookList: Hook[]) => {
		for (const instance of hookList) {
			if (!(await this.#consumeHook(instance))) break;
		}
	};

	errorHandler = async (error: HookError) => error.handle();
}
