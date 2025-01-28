import { type ShaderParam } from './ShaderParam.js';

export type ShaderSource = Readonly<{
	src: string;
	params: readonly Readonly<ShaderParam>[];
}>;
