import { warn } from '@/lib/console/warn.js';

export function compileShader(
	gl: WebGLRenderingContext,
	type: typeof gl.FRAGMENT_SHADER | typeof gl.VERTEX_SHADER,
	source: string,
) {
	const shader = gl.createShader(type)!;

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		warn('Failed to compile shader: ', source, gl.getShaderInfoLog(shader));

		gl.deleteShader(shader);
		return;
	}

	return shader;
}
