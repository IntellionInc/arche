import { HookBucket } from "../types";

export class Stack<T> extends Array<T> implements HookBucket<T> {
	insert = this.unshift;
	remove = this.pop;
}
