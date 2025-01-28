import { type ReadableStore } from '@/lib/store/ReadableStore.js';
import { type ShaderDataType as t } from './ShaderDataType.js';
import { type ShaderParamKeyword as k } from './ShaderParamKeyword.js';
import { type Values } from '@/lib/functional/Values.js';

type ShaderTypeQualifierValue<S extends number, T> = Record<S, T>;
type RecordValueOrStore<T extends Record<string | number | symbol, unknown>> = {
	[k in keyof T]: T[k] | ReadableStore<T[k]>;
};

type ShaderTypeVecUniformValue<T> =
	T extends (
		| typeof t.VEC2
		| typeof t.IVEC2
		| typeof t.UVEC2
		| typeof t.BVEC2
		| typeof t.DVEC2
	) ?
		[number, number]
	: T extends (
		| typeof t.VEC3
		| typeof t.IVEC3
		| typeof t.UVEC3
		| typeof t.BVEC3
		| typeof t.DVEC3
	) ?
		[number, number, number]
	: T extends (
		| typeof t.VEC4
		| typeof t.IVEC4
		| typeof t.UVEC4
		| typeof t.BVEC4
		| typeof t.DVEC4
	) ?
		[number, number, number, number]
	:	never;
type ShaderTypeVecAttributeValue<T> =
	| ShaderTypeVecUniformValue<T>
	| WebGLBuffer;
type ShaderTypeVecQualifierUniformValue = ShaderTypeQualifierValue<
	| typeof t.VEC2
	| typeof t.IVEC2
	| typeof t.UVEC2
	| typeof t.BVEC2
	| typeof t.DVEC2,
	[number, number]
> &
	ShaderTypeQualifierValue<
		| typeof t.VEC3
		| typeof t.IVEC3
		| typeof t.UVEC3
		| typeof t.BVEC3
		| typeof t.DVEC3,
		[number, number, number]
	> &
	ShaderTypeQualifierValue<
		| typeof t.VEC4
		| typeof t.IVEC4
		| typeof t.UVEC4
		| typeof t.BVEC4
		| typeof t.DVEC4,
		[number, number, number, number]
	>;
type ShaderTypeMatUniformValue<T> =
	T extends typeof t.MAT2 ?
		[
			number,
			number,
			//
			number,
			number,
		]
	: T extends typeof t.MAT3 ?
		[
			number,
			number,
			number,
			//
			number,
			number,
			number,
			//
			number,
			number,
			number,
		]
	: T extends typeof t.MAT4 ?
		[
			number,
			number,
			number,
			number,
			//
			number,
			number,
			number,
			number,
			//
			number,
			number,
			number,
			number,
			//
			number,
			number,
			number,
			number,
		]
	: T extends typeof t.MAT2X4 ?
		[
			number,
			number,
			//
			number,
			number,
			//
			number,
			number,
			//
			number,
			number,
		]
	: T extends typeof t.MAT3X4 ?
		[
			number,
			number,
			number,
			//
			number,
			number,
			number,
			//
			number,
			number,
			number,
			//
			number,
			number,
			number,
		]
	: T extends typeof t.MAT2X3 ?
		[
			number,
			number,
			//
			number,
			number,
			//
			number,
			number,
		]
	: T extends typeof t.MAT4X3 ?
		[
			number,
			number,
			number,
			number,
			//
			number,
			number,
			number,
			number,
			//
			number,
			number,
			number,
			number,
		]
	: T extends typeof t.MAT3X2 ?
		[
			number,
			number,
			number,
			//
			number,
			number,
			number,
		]
	: T extends typeof t.MAT4X2 ?
		[
			number,
			number,
			number,
			number,
			//
			number,
			number,
			number,
			number,
		]
	:	never;
type ShaderTypeMatAttributeValue<T> =
	| ShaderTypeMatUniformValue<T>
	| WebGLBuffer;
type ShaderTypeMatQualifierUniformValue = ShaderTypeQualifierValue<
	typeof t.MAT2,
	[
		number,
		number,
		//
		number,
		number,
	]
> &
	ShaderTypeQualifierValue<
		typeof t.MAT3,
		[
			number,
			number,
			number,
			//
			number,
			number,
			number,
			//
			number,
			number,
			number,
		]
	> &
	ShaderTypeQualifierValue<
		typeof t.MAT4,
		[
			number,
			number,
			number,
			number,
			//
			number,
			number,
			number,
			number,
			//
			number,
			number,
			number,
			number,
			//
			number,
			number,
			number,
			number,
		]
	> &
	ShaderTypeQualifierValue<
		typeof t.MAT2X4,
		[
			number,
			number,
			//
			number,
			number,
			//
			number,
			number,
			//
			number,
			number,
		]
	> &
	ShaderTypeQualifierValue<
		typeof t.MAT3X4,
		[
			number,
			number,
			number,
			//
			number,
			number,
			number,
			//
			number,
			number,
			number,
			//
			number,
			number,
			number,
		]
	> &
	ShaderTypeQualifierValue<
		typeof t.MAT2X3,
		[
			number,
			number,
			//
			number,
			number,
			//
			number,
			number,
		]
	> &
	ShaderTypeQualifierValue<
		typeof t.MAT4X3,
		[
			number,
			number,
			number,
			number,
			//
			number,
			number,
			number,
			number,
			//
			number,
			number,
			number,
			number,
		]
	> &
	ShaderTypeQualifierValue<
		typeof t.MAT3X2,
		[
			number,
			number,
			number,
			//
			number,
			number,
			number,
		]
	> &
	ShaderTypeQualifierValue<
		typeof t.MAT4X2,
		[
			number,
			number,
			number,
			number,
			//
			number,
			number,
			number,
			number,
		]
	>;
export type ShaderTypeQualifierAttributeParam = Values<typeof t>;
export type ShaderTypeQualifierAttributeValue<
	T extends ShaderTypeQualifierAttributeParam,
> =
	| (T extends typeof t.FLOAT ? number | WebGLBuffer : never)
	| ShaderTypeMatAttributeValue<T>
	| ShaderTypeVecAttributeValue<T>;
export type ShaderTypeQualifierAttributeValueMap =
	//
	/* */ ShaderTypeQualifierValue<typeof t.FLOAT, number | WebGLBuffer> & {
		[k in keyof ShaderTypeVecQualifierUniformValue]:
			| ShaderTypeVecQualifierUniformValue[k]
			| WebGLBuffer;
	} & {
		[k in keyof ShaderTypeMatQualifierUniformValue]:
			| ShaderTypeMatQualifierUniformValue[k]
			| WebGLBuffer;
	};
export type ShaderTypeQualifierUniformParam =
	| Values<typeof t>
	| ShaderParamUniformEntry[];
export type ShaderTypeQualifierUniformValue<
	T extends ShaderTypeQualifierUniformParam,
> =
	| (T extends typeof t.BOOL ? boolean : never)
	| (T extends typeof t.DOUBLE ? number : never)
	| (T extends typeof t.INT | typeof t.UINT ? number : never)
	| (T extends (
			| typeof t.SAMPLER1D
			| typeof t.SAMPLER2D
			| typeof t.SAMPLER3D
			| typeof t.USAMPLER1D
			| typeof t.USAMPLER2D
			| typeof t.USAMPLER3D
			| typeof t.ISAMPLER1D
			| typeof t.ISAMPLER2D
			| typeof t.ISAMPLER3D
	  ) ?
			WebGLTexture
	  :	never)
	| ShaderTypeVecUniformValue<T>
	| ShaderTypeMatUniformValue<T>
	| (T extends ShaderParamUniformEntry[] ?
			{
				[k in T[number][1]]: ShaderTypeQualifierUniformValue<
					T[number][0]
				>;
			}
	  :	never);
export type ShaderTypeQualifierUniformValueMap =
	//
	/* */ ShaderTypeQualifierValue<typeof t.BOOL, boolean> &
		ShaderTypeQualifierValue<typeof t.DOUBLE, number> &
		ShaderTypeQualifierValue<typeof t.INT | typeof t.UINT, number> &
		ShaderTypeQualifierValue<
			| typeof t.SAMPLER1D
			| typeof t.SAMPLER2D
			| typeof t.SAMPLER3D
			| typeof t.USAMPLER1D
			| typeof t.USAMPLER2D
			| typeof t.USAMPLER3D
			| typeof t.ISAMPLER1D
			| typeof t.ISAMPLER2D
			| typeof t.ISAMPLER3D,
			WebGLTexture
		> &
		ShaderTypeQualifierValue<typeof t.FLOAT, number> &
		ShaderTypeVecQualifierUniformValue &
		ShaderTypeMatQualifierUniformValue;

export type ShaderTypeQualifier =
	| keyof ShaderTypeQualifierUniformValueMap
	| keyof ShaderTypeQualifierAttributeValueMap;

export type ShaderKeywordQualifier = ShaderParam[0];

type ShaderParamAttributeEntry = [
	type: ShaderTypeQualifierAttributeParam,
	identifier: string,
];
type ShaderParamUniformEntry = [
	type: ShaderTypeQualifierUniformParam,
	identifier: string,
];
export type ShaderParam =
	| [
			keyword: typeof k.IN | typeof k.OUT,
			...ShaderParamAttributeEntry,
			//
	  ]
	| [
			keyword: typeof k.UNIFORM,
			...ShaderParamUniformEntry,
			//
	  ]
	| [
			keyword: typeof k.UNIFORM,
			...ShaderParamUniformEntry,
			/** Unused */ length: number,
	  ];
