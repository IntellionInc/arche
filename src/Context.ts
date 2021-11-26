import { DefaultErrorDictionary } from "./errors";
import { ContextInterface } from "./types";

export class DefaultContext implements ContextInterface {
	errorTable = DefaultErrorDictionary;
}
