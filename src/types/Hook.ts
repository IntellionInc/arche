export type ChainHook = "initially" | "before" | "main" | "after" | "finally" | "andThen";

export interface HookBucket<T> {
	insert: (...args: T[]) => any;
}
