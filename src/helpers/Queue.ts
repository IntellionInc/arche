import { HookBucket } from "../types";
export class Queue<T> extends Array<T> implements HookBucket<T> {
	insert = this.push;
	remove = this.pop;
}
