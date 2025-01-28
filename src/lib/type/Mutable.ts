export type Mutable<
	T extends
		| Record<string, unknown>
		| Record<number, unknown>
		| Record<any, unknown>,
> = {
	-readonly [K in keyof T]: T[K];
};
