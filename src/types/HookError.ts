import { HookError, DefaultErrorDictionary } from "../errors";

export type DictionaryKey = Exclude<keyof typeof DefaultErrorDictionary, "prototype">;
type ErrorDictionaryEntry = DictionaryKey & string;
export type HookErrorDictionary = Record<ErrorDictionaryEntry, typeof HookError>;
