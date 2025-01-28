import { type ReadableStore } from '@/lib/store/ReadableStore.js';
import {
	type ShaderTypeQualifierAttributeValueMap,
	type ShaderParam,
	type ShaderTypeQualifierUniformValueMap,
	type ShaderTypeQualifierUniformValue,
} from '../shader/ShaderParam.js';
import { type ShaderParamKeyword as k } from '../shader/ShaderParamKeyword.js';

type ObjectFromEntries<T extends readonly [string, unknown][]> = {
	[k in T[number][0]]: Extract<T[number], [k, any]>[1];
};
type CoerceArray<T> = T extends unknown[] ? T | T[keyof T][] : T[];
type ValueOrStore<T> = T | ReadableStore<T>;
type ValueOrStoreDeep<T> = ValueOrStore<
	T extends Record<string, unknown> ?
		{
			[k in keyof T]: ValueOrStoreDeep<T[k]>;
		}
	:	T
>;
type Entry<Param extends Readonly<ShaderParam>> = [
	Param[2],
	Param[0] extends typeof k.UNIFORM ?
		Param[3] extends number ?
			ValueOrStoreDeep<
				CoerceArray<ShaderTypeQualifierUniformValue<Param[1]>>
			>
		:	ValueOrStoreDeep<ShaderTypeQualifierUniformValue<Param[1]>>
	:	// @ts-expect-error as long as it works
		ShaderTypeQualifierAttributeValueMap[Param[1]],
];

export type ProgramHydration<Params extends readonly Readonly<ShaderParam>[]> =
	ObjectFromEntries<{
		[k in keyof Params]: Params[k][0] extends (
			typeof k.IN | typeof k.UNIFORM
		) ?
			Params[k][0] extends typeof k.IN ?
				Extract<
					Params[keyof Params],
					readonly [typeof k.OUT, any, Params[k][2]]
				> extends never ?
					Entry<Params[k]>
				:	never
			:	Entry<Params[k]>
		:	never;
	}>;
