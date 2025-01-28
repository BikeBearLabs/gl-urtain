import { type Values } from '@/lib/functional/Values.js';

export type ShaderParamKeyword = Values<typeof ShaderParamKeyword>;
export const ShaderParamKeyword = /** @type {const} */ {
	IN: 0b0001,
	OUT: 0b0010,
	UNIFORM: 0b0100,
} as const;
