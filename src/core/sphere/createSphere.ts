export function createSphere(
	radius: number,
	longBands: number,
	latBands: number,
) {
	const latStep = Math.PI / latBands;
	const longStep = (2 * Math.PI) / longBands;
	const positionCount = longBands * latBands * 4;
	const indexCount = longBands * latBands * 6;
	const positions = new Float32Array(positionCount * 3);
	const normals = new Float32Array(positionCount * 3);
	const uvs = new Float32Array(positionCount * 2);
	const indices = new Uint16Array(indexCount);

	let k = 0;
	let l = 0;
	for (let latBandI = 0; latBandI < latBands; latBandI++) {
		const latRad = latBandI * latStep;
		const y1 = Math.cos(latRad);
		const y2 = Math.cos(latRad + latStep);

		for (let longBandI = 0; longBandI < longBands; longBandI++) {
			const longRad = longBandI * longStep;
			const x1 = Math.sin(latRad) * Math.cos(longRad);
			const x2 = Math.sin(latRad) * Math.cos(longRad + longStep);
			const x3 = Math.sin(latRad + latStep) * Math.cos(longRad);
			const x4 =
				Math.sin(latRad + latStep) * Math.cos(longRad + longStep);
			const z1 = Math.sin(latRad) * Math.sin(longRad);
			const z2 = Math.sin(latRad) * Math.sin(longRad + longStep);
			const z3 = Math.sin(latRad + latStep) * Math.sin(longRad);
			const z4 =
				Math.sin(latRad + latStep) * Math.sin(longRad + longStep);
			const u1 = 1 - longBandI / longBands;
			const u2 = 1 - (longBandI + 1) / longBands;
			const v1 = 1 - latBandI / latBands;
			const v2 = 1 - (latBandI + 1) / latBands;
			const vi = k * 3;
			const ti = k * 2;

			positions[vi] = x1 * radius;
			positions[vi + 1] = y1 * radius;
			positions[vi + 2] = z1 * radius; //v0

			positions[vi + 3] = x2 * radius;
			positions[vi + 4] = y1 * radius;
			positions[vi + 5] = z2 * radius; //v1

			positions[vi + 6] = x3 * radius;
			positions[vi + 7] = y2 * radius;
			positions[vi + 8] = z3 * radius; // v2

			positions[vi + 9] = x4 * radius;
			positions[vi + 10] = y2 * radius;
			positions[vi + 11] = z4 * radius; // v3

			normals[vi] = x1;
			normals[vi + 1] = y1;
			normals[vi + 2] = z1;

			normals[vi + 3] = x2;
			normals[vi + 4] = y1;
			normals[vi + 5] = z2;

			normals[vi + 6] = x3;
			normals[vi + 7] = y2;
			normals[vi + 8] = z3;

			normals[vi + 9] = x4;
			normals[vi + 10] = y2;
			normals[vi + 11] = z4;

			uvs[ti] = u1;
			uvs[ti + 1] = v1;

			uvs[ti + 2] = u2;
			uvs[ti + 3] = v1;

			uvs[ti + 4] = u1;
			uvs[ti + 5] = v2;

			uvs[ti + 6] = u2;
			uvs[ti + 7] = v2;

			indices[l] = k;
			indices[l + 1] = k + 1;
			indices[l + 2] = k + 2;
			indices[l + 3] = k + 2;
			indices[l + 4] = k + 1;
			indices[l + 5] = k + 3;

			k += 4;
			l += 6;
		}
	}

	return {
		positions,
		normals,
		uvs,
		indices,
	};
}
