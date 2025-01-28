import { warn } from '@/lib/console/warn.js';

export function createProgram(
	gl: WebGLRenderingContext,
	vert: WebGLShader,
	frag: WebGLShader,
) {
	const program = /** @type {WebGLProgram} */ gl.createProgram();

	gl.attachShader(program, vert);
	gl.attachShader(program, frag);

	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		warn(
			'Failed to initialize shader program:',
			gl.getProgramInfoLog(program),
		);

		gl.deleteProgram(program);
		return;
	}

	return program;
}
