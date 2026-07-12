import { Hook } from "../Hook";
import { HookError, DefaultErrorDictionary } from "../errors";

export type DictionaryKey = Exclude<keyof typeof DefaultErrorDictionary, "prototype">;
type ErrorDictionaryEntry = DictionaryKey & string;
export type HookErrorConstructor = new (hook: Hook, error: Error) => HookError;
export type HookErrorDictionary = Record<ErrorDictionaryEntry, HookErrorConstructor>;
