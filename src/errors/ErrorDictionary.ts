import { HookError, TentativeError } from "./HookError";

export class DefaultErrorDictionary {
	static ECONNREFUSED = class ECONNREFUSED extends TentativeError {};
	static ECONNRESET = class ECONNRESET extends TentativeError {};
	static EPIPE = class EPIPE extends TentativeError {};
	static ERR_STREAM_DESTROYED = class ERRSTREAMDESTROYED extends TentativeError {};
	static DEFAULT = HookError;
}
