export interface Yield<T> {
	success: boolean;
	data: T | null;
	errors: Error[];
}
