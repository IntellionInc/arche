import { Hook } from "../Hook";

export class HookError extends Error {
	constructor(public hook: Hook, public error: Error) {
		super();
	}

	handle = async (): Promise<void | never> => {
		throw this.error;
	};
}

export class TentativeError extends HookError {
	maxRetries = 0;
	backoffMultiplier = 100;

	#wait = (milliseconds: number) =>
		new Promise(resolve => setTimeout(resolve, milliseconds));

	handle = async () => {
		const { callCount, call } = this.hook;
		if (callCount <= this.maxRetries) {
			const milliseconds = Math.max(1, callCount) * this.backoffMultiplier;
			await this.#wait(milliseconds);
			await call();
		} else {
			throw this.error;
		}
	};
}
