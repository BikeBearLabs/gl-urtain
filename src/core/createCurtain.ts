import { type ReadableStore } from '@/lib/store/ReadableStore.js';
import { mat4, vec2, vec3 } from 'gl-matrix';
import { PicoGL, type App } from 'picogl';
import ballVertSource from './cloth/scene/ball.vert';
import clothVertSource from './cloth/scene/cloth.vert';
import phongFragSource from './cloth/scene/phong.frag';
import quadVertSource from './cloth/scene/quad.vert';
import collisionStepFragSource from './cloth/simulation/collision-step.frag';
import constraintStepFragSource from './cloth/simulation/constraint-step.frag';
import forceStepFragSource from './cloth/simulation/force-step.frag';
import normalStepFragSource from './cloth/simulation/normal-step.frag';
import { createSphere } from './sphere/createSphere.js';
import { Store } from '@/lib/store/Store.js';
import { use } from '@/lib/store/use.js';
import { degToRad } from '@/lib/math/degToRad.js';
import { derive } from '@/lib/store/derive.js';
import { type RgbaColor } from '@/lib/color/RgbaColor.js';

export async function createCurtain({
	app,
	canvas,
	canvasSize,
}: {
	app: App;
	canvas: HTMLCanvasElement;
	canvasSize: ReadableStore<{
		width: number | undefined;
		height: number | undefined;
	}>;
}) {
	const constraintIterationCount = 64;
	const simulationTextureSize = 256;

	const quadShader = app.createShader(PicoGL.VERTEX_SHADER, quadVertSource);
	const phongShader = app.createShader(
		PicoGL.FRAGMENT_SHADER,
		phongFragSource,
	);

	const [
		forceStepProgram,
		constraintStepProgram,
		collisionStepProgram,
		normalStepProgram,
		ballProgram,
		clothProgram,
	] = await app.createPrograms(
		[quadShader, forceStepFragSource],
		[quadShader, constraintStepFragSource],
		[quadShader, collisionStepFragSource],
		[quadShader, normalStepFragSource],
		[ballVertSource, phongShader],
		[clothVertSource, phongShader],
	);

	//#region scene
	const projectionMatrix = mat4.create();
	const fov = degToRad(90);
	const viewMatrix = mat4.create();
	const viewProjectionMatrix = mat4.create();
	const lightPosition = vec3.fromValues(1, 1, 1);
	const sceneUniformBuffer = app
		.createUniformBuffer([
			PicoGL.FLOAT_MAT4,
			PicoGL.FLOAT_VEC4,
			PicoGL.INT_VEC3,
			PicoGL.INT_VEC3,
		])
		.set(0, viewProjectionMatrix)
		.set(1, lightPosition)
		.update();
	const lightColorDefault: RgbaColor = [255, 255, 255, 255];
	const lightColor = new Store(lightColorDefault);
	const lightColorUint8 = lightColor.derive(
		(v) => new Uint8Array(v.slice(0, 3)),
	).supply;
	const shadowColorDefault: RgbaColor = [237, 159, 83, 255];
	const shadowColor = new Store(shadowColorDefault);
	const shadowColorUint8 = shadowColor.derive(
		(v) => new Uint8Array(v.slice(0, 3)),
	).supply;
	use(
		{
			lightColorUint8,
			shadowColorUint8,
		},
		({ $lightColorUint8, $shadowColorUint8 }) => {
			sceneUniformBuffer
				.set(2, $lightColorUint8)
				.set(3, $shadowColorUint8)
				.update();
		},
	);
	const cameraPosition = derive(
		{
			canvasSize,
		},
		({ $canvasSize: { width: $width, height: $height } }) => {
			if (!$width || !$height) {
				return { x: 0, y: 0, z: 0 };
			}

			const aspect = $width / $height || 1;

			const cameraRegionSize = 0.9;
			const cameraRegionZ =
				Math.min(cameraRegionSize / aspect, cameraRegionSize) /
				2 /
				Math.tan(fov / 2);

			return { x: 0, y: 0, z: cameraRegionZ };
		},
	);

	use(
		{ canvasSize, cameraPosition },
		({
			$canvasSize: { width: $width, height: $height },
			$cameraPosition: { x: $cameraX, y: $cameraY, z: $cameraZ },
		}) => {
			if (!$width || !$height) {
				return;
			}

			const aspect = $width / $height || 1;
			const position = vec3.fromValues($cameraX, $cameraY, $cameraZ);

			mat4.lookAt(
				viewMatrix,
				position,
				vec3.fromValues(0, 0, 0),
				vec3.fromValues(0, 1, 0),
			);

			mat4.perspective(projectionMatrix, fov, aspect, 0.1, 3.0);
			mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

			sceneUniformBuffer.set(0, viewProjectionMatrix).update();
		},
	);
	//#endregion

	//#region cloth
	const clothPosition = vec3.fromValues(-0.5, 0.5, 0);
	const clothParticleCount = simulationTextureSize ** 2;
	const clothPositionsBuf = new Float32Array(clothParticleCount * 4);
	const clothNormalsBuf = new Float32Array(clothParticleCount * 4);
	const clothUvsBuf = new Float32Array(clothParticleCount * 2);
	const clothPositionsIndicesBuf = new Int16Array(clothParticleCount * 2);
	const clothIndicesBuf = new Uint16Array(
		(simulationTextureSize - 1) * (simulationTextureSize - 1) * 6,
	);

	let indexI = 0;
	for (let i = 0; i < clothParticleCount; ++i) {
		const vec4i = i * 4;
		const vec2i = i * 2;

		const x = i % simulationTextureSize;
		const y = Math.floor(i / simulationTextureSize);

		const u = x / simulationTextureSize;
		const v = y / simulationTextureSize;

		clothPositionsBuf[vec4i] = u + clothPosition[0];
		clothPositionsBuf[vec4i + 1] = -v + clothPosition[1];
		clothPositionsBuf[vec4i + 2] = clothPosition[2];

		clothNormalsBuf[vec4i + 2] = 1;

		clothUvsBuf[vec2i] = u;
		clothUvsBuf[vec2i + 1] = v;

		clothPositionsIndicesBuf[vec2i] = i % simulationTextureSize;
		clothPositionsIndicesBuf[vec2i + 1] = Math.floor(
			i / simulationTextureSize,
		);

		if (x < simulationTextureSize - 1 && y < simulationTextureSize - 1) {
			clothIndicesBuf[indexI] = i;
			clothIndicesBuf[indexI + 1] = i + simulationTextureSize;
			clothIndicesBuf[indexI + 2] = i + simulationTextureSize + 1;
			clothIndicesBuf[indexI + 3] = i;
			clothIndicesBuf[indexI + 4] = i + simulationTextureSize + 1;
			clothIndicesBuf[indexI + 5] = i + 1;
			indexI += 6;
		}
	}

	const clothPositionsIndices = app.createVertexBuffer(
		PicoGL.SHORT,
		2,
		clothPositionsIndicesBuf,
	);
	const clothUvs = app.createVertexBuffer(PicoGL.FLOAT, 2, clothUvsBuf);
	const clothIndices = app.createIndexBuffer(
		PicoGL.UNSIGNED_SHORT,
		clothIndicesBuf,
	);
	const clothVertices = app
		.createVertexArray()
		.vertexAttributeBuffer(0, clothPositionsIndices)
		.vertexAttributeBuffer(1, clothUvs)
		.indexBuffer(clothIndices);
	const clothColorDefault: RgbaColor = [255, 244, 230, 255];
	const clothColor = new Store(clothColorDefault);
	const clothColorUint8 = clothColor.derive(
		(v) => new Uint8Array(v.slice(0, 3)),
	).supply;
	const clothTexture = app.createTexture2D(clothColorUint8.get(), 1, 1, {
		internalFormat: PicoGL.RGB8,
	});
	use(
		{
			clothColorUint8,
		},
		({ $clothColorUint8 }) => {
			clothTexture.data($clothColorUint8);
		},
	);
	const clothNormalTexture = app.createTexture2D(
		clothNormalsBuf,
		simulationTextureSize,
		simulationTextureSize,
		{
			internalFormat: PicoGL.RGBA32F,
			minFilter: PicoGL.NEAREST,
			magFilter: PicoGL.NEAREST,
			wrapS: PicoGL.CLAMP_TO_EDGE,
			wrapT: PicoGL.CLAMP_TO_EDGE,
		},
	);
	const clothRenderDrawCall = app
		.createDrawCall(clothProgram, clothVertices)
		.uniformBlock('SceneUniforms', sceneUniformBuffer)
		.texture('uDiffuse', clothTexture)
		.texture('uNormalBuffer', clothNormalTexture);
	const drawCloth = () => {
		app.defaultViewport();
		app.defaultDrawFramebuffer();
		clothRenderDrawCall.texture('uPositionBuffer', positionTargetA).draw();
	};
	//#endregion

	//#region ball
	const ballRadiusBase = 0.02;
	const ballRadiusAmplitude = 0.05;
	const ballPosition = vec3.fromValues(0, 0, 0.02);
	const ballGeometry = createSphere(ballRadiusBase, 32, 32);
	const ballPositions = app.createVertexBuffer(
		PicoGL.FLOAT,
		3,
		ballGeometry.positions,
	);
	const ballNormals = app.createVertexBuffer(
		PicoGL.FLOAT,
		3,
		ballGeometry.normals,
	);
	const ballIndices = app.createIndexBuffer(
		PicoGL.UNSIGNED_SHORT,
		ballGeometry.indices,
	);
	const ballVertices = app
		.createVertexArray()
		.vertexAttributeBuffer(0, ballPositions)
		.vertexAttributeBuffer(1, ballNormals)
		.indexBuffer(ballIndices);
	const ballUniforms = app
		.createUniformBuffer([PicoGL.FLOAT_VEC4, PicoGL.FLOAT])
		.set(0, ballPosition)
		.set(1, ballRadiusBase)
		.update();
	const ballColor = new Uint8Array([255, 20, 20]);
	const ballTexture = app.createTexture2D(ballColor, 1, 1, {
		internalFormat: PicoGL.RGB8,
	});
	const ballRenderDrawCall = app
		.createDrawCall(ballProgram, ballVertices)
		.uniformBlock('SceneUniforms', sceneUniformBuffer)
		.uniformBlock('BallUniforms', ballUniforms)
		.texture('uDiffuse', ballTexture);
	const ballScreenSpacePosition = new Store({ x: 0, y: 0, t: NaN });
	const ballScreenSpaceOldPosition = new Store({ x: 0, y: 0, t: NaN });
	canvas.addEventListener('mousemove', ({ clientX, clientY }) => {
		ballScreenSpaceOldPosition.set(ballScreenSpacePosition.get());
		ballScreenSpacePosition.set({
			x: clientX - canvas.offsetLeft,
			y: clientY - canvas.offsetTop,
			t: performance.now(),
		});
	});
	const ballVelocity = derive(
		{
			ballScreenSpacePosition,
			ballScreenSpaceOldPosition,
		},
		({
			$ballScreenSpacePosition: { x: $x, y: $y, t: $t },
			$ballScreenSpaceOldPosition: { x: $oldX, y: $oldY, t: $oldT },
		}) => {
			if (Number.isNaN($oldT) || Number.isNaN($t)) {
				return { x: 0, y: 0 };
			}
			const dx = $x - $oldX;
			const dy = $y - $oldY;
			const dt = $t - $oldT;

			return {
				x: dx / dt,
				y: dy / dt,
			};
		},
	);
	let ballFrictionRafHandle = requestAnimationFrame(
		function ballFrictionRaf() {
			ballFrictionRafHandle = requestAnimationFrame(ballFrictionRaf);

			const { x, y } = ballVelocity.get();
			const speed = Math.hypot(x, y);
			if (speed === 0) {
				return;
			}

			const newVelocity = {
				x: x * 0.95,
				y: y * 0.95,
			};

			ballVelocity.set(newVelocity);
		},
	);
	const ballRadius = new Store(ballRadiusBase);
	let ballRadiusRafHandle = requestAnimationFrame(function ballRadiusRaf() {
		ballRadiusRafHandle = requestAnimationFrame(ballRadiusRaf);

		const { x, y } = ballVelocity.get();
		const speed = Math.abs(Math.hypot(x, y));
		const targetRadius = Math.max(
			ballRadiusBase,
			ballRadiusAmplitude * speed,
		);
		ballRadius.update((v) => {
			const diff = targetRadius - v;
			const step = diff * 0.05;
			const newRadius = v + step;

			return newRadius;
		});
	});

	const ballWorldSpacePosition = derive(
		{
			ballScreenSpacePosition,
			canvasSize,
			cameraPosition,
		},
		({
			$ballScreenSpacePosition: { x: $x, y: $y },
			$canvasSize: { width: $width, height: $height },
			$cameraPosition: { z: $cameraZ },
		}) => {
			if (!$width || !$height) {
				return { x: 0, y: 0 };
			}

			const aspect = $width / $height || 1;
			const screenSpaceX = ($x / $width) * 2 - 1;
			const screenSpaceY = (($height - $y) / $height) * 2 - 1;
			// const screenSpaceX = 1;
			// const screenSpaceY = -1;
			const screenSpacePosition = vec3.fromValues(
				screenSpaceX,
				screenSpaceY,
				0,
			);
			const frustumAtCameraZ = vec2.create();
			frustumAtCameraZ[1] = Math.tan(fov / 2) * $cameraZ;
			frustumAtCameraZ[0] = frustumAtCameraZ[1] * aspect;
			const worldSpacePosition = vec3.fromValues(
				screenSpacePosition[0] * frustumAtCameraZ[0],
				screenSpacePosition[1] * frustumAtCameraZ[1],
				0,
			);

			return {
				x: worldSpacePosition[0],
				y: worldSpacePosition[1],
			};
		},
	);
	const drawBall = () => {
		const { x, y } = ballWorldSpacePosition.get();
		ballPosition[0] = x;
		ballPosition[1] = y;
		ballUniforms.set(0, ballPosition).update();
		ballUniforms.set(1, ballRadius.get()).update();
		// app.defaultViewport();
		// app.defaultDrawFramebuffer();
		// ballRenderDrawCall.draw();
	};
	//#endregion

	//#region quad
	const quadPositions = app.createVertexBuffer(
		PicoGL.FLOAT,
		2,
		new Float32Array([-1, 1, -1, -1, 1, -1, -1, 1, 1, -1, 1, 1]),
	);
	const quadVertices = app
		.createVertexArray()
		.vertexAttributeBuffer(0, quadPositions);
	//#endregion

	//#region position targets
	const positionTargetA = app.createTexture2D(
		clothPositionsBuf,
		simulationTextureSize,
		simulationTextureSize,
		{
			internalFormat: PicoGL.RGBA32F,
			minFilter: PicoGL.NEAREST,
			magFilter: PicoGL.NEAREST,
			wrapS: PicoGL.CLAMP_TO_EDGE,
			wrapT: PicoGL.CLAMP_TO_EDGE,
		},
	);
	const positionTargetB = app.createTexture2D(
		simulationTextureSize,
		simulationTextureSize,
		{
			internalFormat: PicoGL.RGBA32F,
		},
	);

	let oldPositionTargetA = app.createTexture2D(
		clothPositionsBuf,
		simulationTextureSize,
		simulationTextureSize,
		{
			internalFormat: PicoGL.RGBA32F,
			minFilter: PicoGL.NEAREST,
			magFilter: PicoGL.NEAREST,
			wrapS: PicoGL.CLAMP_TO_EDGE,
			wrapT: PicoGL.CLAMP_TO_EDGE,
		},
	);
	let oldPositionTargetB = app.createTexture2D(
		simulationTextureSize,
		simulationTextureSize,
		{
			internalFormat: PicoGL.RGBA32F,
		},
	);
	const swapOldPositionTargets = () => {
		[
			//
			oldPositionTargetA,
			oldPositionTargetB,
		] = [
			//
			oldPositionTargetB,
			oldPositionTargetA,
		];
	};
	//#endregion

	//#region pins
	const pinCount = 8;
	const pinIndent = -0.01;
	const [pinIndices, pinIndentIndices] = [
		...(function* () {
			for (
				let i = 0;
				i < simulationTextureSize;
				i += (simulationTextureSize - 1) / (pinCount * 2)
			) {
				const vec4i = Math.round(i) * 4;

				yield vec4i;
			}
		})(),
	].reduce(
		([pins, indents], v, i) => {
			if (i % 2 === 1) {
				indents.push(v);
			} else {
				pins.push(v);
			}

			return [pins, indents];
		},
		[[] as number[], [] as number[]],
	);
	const pinNoise = new Float32Array(
		(pinIndices.length + pinIndentIndices.length) * 3,
	).map(() => (Math.random() * 2 - 1) * 0.02);
	const pinsBuf = new Float32Array(clothParticleCount * 4);
	const initializePin = (pinI: number, i: number) => {
		const vec3i = i * 4;
		pinsBuf[pinI] = pinNoise[vec3i]!;
		pinsBuf[pinI + 1] = pinNoise[vec3i + 1]!;
		pinsBuf[pinI + 2] = pinNoise[vec3i + 2]!;
		pinsBuf[pinI + 3] = 1;
	};
	for (let i = 0; i < pinIndices.length; i++) {
		initializePin(pinIndices[i]!, i);
	}
	for (let i = 0; i < pinIndentIndices.length; i++) {
		initializePin(pinIndentIndices[i]!, i);
	}
	for (const i of pinIndentIndices) {
		pinsBuf[i + 3]! += pinIndent;
	}
	const pinTexture = app.createTexture2D(
		pinsBuf,
		simulationTextureSize,
		simulationTextureSize,
		{
			internalFormat: PicoGL.RGBA32F,
			minFilter: PicoGL.NEAREST,
			magFilter: PicoGL.NEAREST,
			wrapS: PicoGL.CLAMP_TO_EDGE,
			wrapT: PicoGL.CLAMP_TO_EDGE,
		},
	);
	const pinScrunchDirection = new Store<-1 | 1>(1);
	const pinScrunchness = new Store(0);
	use(
		{ pinScrunchDirection, pinScrunchness },
		({ $pinScrunchDirection, $pinScrunchness }) => {
			const updatePin = (pinI: number, i: number) => {
				const vec3i = i * 4;
				pinsBuf[pinI] =
					(1 - $pinScrunchness) * clothPositionsBuf[pinI]! +
					$pinScrunchness * $pinScrunchDirection * 0.5 +
					pinNoise[vec3i]!;
				pinsBuf[pinI + 1] =
					0 + clothPositionsBuf[pinI + 1]! + pinNoise[vec3i + 1]!;
				pinsBuf[pinI + 2] =
					0 + clothPositionsBuf[pinI + 2]! + pinNoise[vec3i + 2]!;
			};
			for (let i = 0; i < pinIndices.length; i++) {
				updatePin(pinIndices[i]!, i);
			}
			for (let i = 0; i < pinIndentIndices.length; i++) {
				updatePin(pinIndentIndices[i]!, i);
			}
			for (const pinI of pinIndentIndices) {
				pinsBuf[pinI + 2]! += pinIndent;
			}
			pinTexture.data(pinsBuf);
		},
	);
	//#endregion

	//#region force
	const forceFbo = app.createFramebuffer();
	const forceDrawCall = app
		.createDrawCall(forceStepProgram, quadVertices)
		.texture('uPositionBuffer', positionTargetA)
		.texture('uNormalBuffer', clothNormalTexture);
	const drawForceStep = () => {
		forceDrawCall.texture('uPositionBuffer', positionTargetA);
		forceDrawCall.texture('uOldPositionBuffer', oldPositionTargetA);
		forceDrawCall.texture('uPinBuffer', pinTexture);
		forceFbo.colorTarget(0, positionTargetB);
		forceFbo.colorTarget(1, oldPositionTargetB);
		swapOldPositionTargets();

		app.viewport(0, 0, simulationTextureSize, simulationTextureSize);

		app.drawFramebuffer(forceFbo);
		forceDrawCall.draw();
	};
	//#endregion

	//#region constraint
	const structuralRestDistance = 1 / simulationTextureSize;
	const shearRestDistance = Math.sqrt(
		3 * structuralRestDistance * structuralRestDistance,
	);
	const leftConstraintUniforms = app
		.createUniformBuffer([PicoGL.INT_VEC2, PicoGL.INT, PicoGL.FLOAT])
		.set(/* direction */ 0, new Int32Array([1, 0]))
		.set(/* modulo */ 1, 0)
		.set(/* restDistance */ 2, structuralRestDistance)
		.update();
	const leftConstraintDrawCall = app
		.createDrawCall(constraintStepProgram, quadVertices)
		.uniformBlock('ConstraintUniforms', leftConstraintUniforms);

	const rightConstraintUniforms = app
		.createUniformBuffer([PicoGL.INT_VEC2, PicoGL.INT, PicoGL.FLOAT])
		.set(/* direction */ 0, new Int32Array([1, 0]))
		.set(/* modulo */ 1, 1)
		.set(/* restDistance */ 2, structuralRestDistance)
		.update();
	const rightConstraintDrawCall = app
		.createDrawCall(constraintStepProgram, quadVertices)
		.uniformBlock('ConstraintUniforms', rightConstraintUniforms);

	const topConstraintUniforms = app
		.createUniformBuffer([PicoGL.INT_VEC2, PicoGL.INT, PicoGL.FLOAT])
		.set(/* direction */ 0, new Int32Array([0, 1]))
		.set(/* modulo */ 1, 0)
		.set(/* restDistance */ 2, structuralRestDistance)
		.update();
	const topConstraintDrawCall = app
		.createDrawCall(constraintStepProgram, quadVertices)
		.uniformBlock('ConstraintUniforms', topConstraintUniforms);

	const bottomConstraintUniforms = app
		.createUniformBuffer([PicoGL.INT_VEC2, PicoGL.INT, PicoGL.FLOAT])
		.set(/* direction */ 0, new Int32Array([0, 1]))
		.set(/* modulo */ 1, 1)
		.set(/* restDistance */ 2, structuralRestDistance)
		.update();
	const bottomConstraintDrawCall = app
		.createDrawCall(constraintStepProgram, quadVertices)
		.uniformBlock('ConstraintUniforms', bottomConstraintUniforms);

	const topLeftShearConstraintUniforms = app
		.createUniformBuffer([PicoGL.INT_VEC2, PicoGL.INT, PicoGL.FLOAT])
		.set(/* direction */ 0, new Int32Array([1, 1]))
		.set(/* modulo */ 1, 0)
		.set(/* restDistance */ 2, shearRestDistance)
		.update();
	const topLeftShearConstraintDrawCall = app
		.createDrawCall(constraintStepProgram, quadVertices)
		.uniformBlock('ConstraintUniforms', topLeftShearConstraintUniforms);

	const topRightShearConstraintUniforms = app
		.createUniformBuffer([PicoGL.INT_VEC2, PicoGL.INT, PicoGL.FLOAT])
		.set(/* direction */ 0, new Int32Array([1, 1]))
		.set(/* modulo */ 1, 1)
		.set(/* restDistance */ 2, shearRestDistance)
		.update();
	const topRightShearConstraintDrawCall = app
		.createDrawCall(constraintStepProgram, quadVertices)
		.uniformBlock('ConstraintUniforms', topRightShearConstraintUniforms);

	const bottomLeftShearConstraintUniforms = app
		.createUniformBuffer([PicoGL.INT_VEC2, PicoGL.INT, PicoGL.FLOAT])
		.set(/* direction */ 0, new Int32Array([1, -1]))
		.set(/* modulo */ 1, 0)
		.set(/* restDistance */ 2, shearRestDistance)
		.update();
	const bottomLeftShearConstraintDrawCall = app
		.createDrawCall(constraintStepProgram, quadVertices)
		.uniformBlock('ConstraintUniforms', bottomLeftShearConstraintUniforms);

	const bottomRightShearConstraintUniforms = app
		.createUniformBuffer([PicoGL.INT_VEC2, PicoGL.INT, PicoGL.FLOAT])
		.set(/* direction */ 0, new Int32Array([1, -1]))
		.set(/* modulo */ 1, 1)
		.set(/* restDistance */ 2, shearRestDistance)
		.update();
	const bottomRightShearConstraintDrawCall = app
		.createDrawCall(constraintStepProgram, quadVertices)
		.uniformBlock('ConstraintUniforms', bottomRightShearConstraintUniforms);

	const constraintFbo = app.createFramebuffer();

	const drawConstraintStep = () => {
		app.drawFramebuffer(constraintFbo);

		for (let i = 0; i < constraintIterationCount; ++i) {
			constraintFbo.colorTarget(0, positionTargetA);
			leftConstraintDrawCall
				.texture('uPositionBuffer', positionTargetB)
				.texture('uPinBuffer', pinTexture)
				.draw();

			constraintFbo.colorTarget(0, positionTargetB);
			rightConstraintDrawCall
				.texture('uPositionBuffer', positionTargetA)
				.texture('uPinBuffer', pinTexture)
				.draw();

			constraintFbo.colorTarget(0, positionTargetA);
			topConstraintDrawCall
				.texture('uPositionBuffer', positionTargetB)
				.texture('uPinBuffer', pinTexture)
				.draw();

			constraintFbo.colorTarget(0, positionTargetB);
			bottomConstraintDrawCall
				.texture('uPositionBuffer', positionTargetA)
				.texture('uPinBuffer', pinTexture)
				.draw();

			constraintFbo.colorTarget(0, positionTargetA);
			topLeftShearConstraintDrawCall
				.texture('uPositionBuffer', positionTargetB)
				.texture('uPinBuffer', pinTexture)
				.draw();

			constraintFbo.colorTarget(0, positionTargetB);
			topRightShearConstraintDrawCall
				.texture('uPositionBuffer', positionTargetA)
				.texture('uPinBuffer', pinTexture)
				.draw();

			constraintFbo.colorTarget(0, positionTargetA);
			bottomLeftShearConstraintDrawCall
				.texture('uPositionBuffer', positionTargetB)
				.texture('uPinBuffer', pinTexture)
				.draw();

			constraintFbo.colorTarget(0, positionTargetB);
			bottomRightShearConstraintDrawCall
				.texture('uPositionBuffer', positionTargetA)
				.texture('uPinBuffer', pinTexture)
				.draw();
		}
	};
	//#endregion

	//#region collision
	const collisionDrawCall = app
		.createDrawCall(collisionStepProgram, quadVertices)
		.uniformBlock('BallUniforms', ballUniforms);
	const drawCollisionStep = () => {
		app.drawFramebuffer(constraintFbo);
		constraintFbo.colorTarget(0, positionTargetA);
		collisionDrawCall.texture('uPositionBuffer', positionTargetB).draw();
	};
	//#endregion

	//#region normal
	const normalFbo = app.createFramebuffer();
	const clothOldNormalsBuf = new Float32Array(clothParticleCount * 4);
	clothOldNormalsBuf.set(clothNormalsBuf);
	let clothOldNormalTextureA = app.createTexture2D(
		clothNormalsBuf,
		simulationTextureSize,
		simulationTextureSize,
		{
			internalFormat: PicoGL.RGBA32F,
			minFilter: PicoGL.NEAREST,
			magFilter: PicoGL.NEAREST,
			wrapS: PicoGL.CLAMP_TO_EDGE,
			wrapT: PicoGL.CLAMP_TO_EDGE,
		},
	);
	let clothOldNormalTextureB = app.createTexture2D(
		simulationTextureSize,
		simulationTextureSize,
		{
			internalFormat: PicoGL.RGBA32F,
		},
	);
	const swapOldNormalTextures = () => {
		[
			//
			clothOldNormalTextureA,
			clothOldNormalTextureB,
		] = [
			//
			clothOldNormalTextureB,
			clothOldNormalTextureA,
		];
	};
	const normalDrawCall = app.createDrawCall(normalStepProgram, quadVertices);
	const drawNormalStep = () => {
		app.drawFramebuffer(normalFbo);
		normalFbo.colorTarget(0, clothNormalTexture);
		normalFbo.colorTarget(1, clothOldNormalTextureA);
		normalDrawCall
			.texture('uPositionBuffer', positionTargetA)
			.texture('uOldNormalBuffer', clothOldNormalTextureB)
			.draw();
		swapOldNormalTextures();
	};
	//#endregion

	return {
		draw: ({
			scrunchness: scrunchnessExternal = 0,
			scrunchDirection: scrunchDirectionExternal = 1,
			lightColor: lightColorExternal = lightColorDefault,
			shadowColor: shadowColorExternal = shadowColorDefault,
			diffuseColor: diffuseColorExternal = clothColorDefault,
		}: {
			scrunchness?: number;
			scrunchDirection?: 1 | -1;
			lightColor?: RgbaColor;
			shadowColor?: RgbaColor;
			diffuseColor?: RgbaColor;
		}) => {
			pinScrunchness.set(scrunchnessExternal);
			pinScrunchDirection.set(scrunchDirectionExternal);
			lightColor.set(lightColorExternal);
			shadowColor.set(shadowColorExternal);
			clothColor.set(diffuseColorExternal);

			drawForceStep();
			drawConstraintStep();
			drawCollisionStep();
			drawNormalStep();

			drawCloth();
			drawBall();
		},
	};
}
