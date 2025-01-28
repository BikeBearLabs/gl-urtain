import { ShaderDataType as t } from '../shader/ShaderDataType.js';
import { ShaderParamKeyword as k } from '../shader/ShaderParamKeyword.js';
import { type ShaderSource } from '../shader/ShaderSource.js';
import src from './fullscreenTri.vert?raw';

export const fullscreenTriVert = {
	src,
	params: [[k.OUT, t.VEC2, 'uv']],
} as const satisfies ShaderSource;
