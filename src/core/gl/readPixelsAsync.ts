/* eslint-disable max-params */
async function clientWaitAsync(
	gl: WebGL2RenderingContext,
	sync: WebGLSync,
	flags: GLbitfield,
	intervalMs: number,
) {
	return new Promise<void>((resolve, reject) => {
		function test() {
			const res = gl.clientWaitSync(sync, flags, 0);
			if (res === gl.WAIT_FAILED) {
				reject(new Error('gl.WAIT_FAILED'));
				return;
			}
			if (res === gl.TIMEOUT_EXPIRED) {
				setTimeout(test, intervalMs);
				return;
			}
			resolve();
		}
		test();
	});
}

async function getBufferSubDataAsync(
	gl: WebGL2RenderingContext,
	target: GLenum,
	buf: WebGLBuffer,
	srcByteOffset: GLintptr,
	dstBuffer: ArrayBufferView,
	dstOffset?: GLuint,
	length?: GLuint,
) {
	const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
	if (!sync) {
		throw new Error('gl.fenceSync failed');
	}
	gl.flush();

	await clientWaitAsync(gl, sync, 0, 10);
	gl.deleteSync(sync);

	gl.bindBuffer(target, buf);
	gl.getBufferSubData(target, srcByteOffset, dstBuffer, dstOffset, length);
	gl.bindBuffer(target, null);

	return dstBuffer;
}

export async function readPixelsAsync(
	gl: WebGL2RenderingContext,
	x: number,
	y: number,
	w: number,
	h: number,
	format: GLenum,
	type: GLenum,
	dest: ArrayBufferView,
) {
	const buf = gl.createBuffer();
	gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buf);
	gl.bufferData(gl.PIXEL_PACK_BUFFER, dest.byteLength, gl.STREAM_READ);
	gl.readPixels(x, y, w, h, format, type, 0);
	gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

	await getBufferSubDataAsync(gl, gl.PIXEL_PACK_BUFFER, buf, 0, dest);

	gl.deleteBuffer(buf);
	return dest;
}
