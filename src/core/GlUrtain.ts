import { Store } from '@/lib/store/Store.js';
import { PicoGL } from 'picogl';
import { createCurtain } from './createCurtain.js';
import { type HexColor } from '@/lib/color/HexColor.js';
import { type RgbaColor } from '@/lib/color/RgbaColor.js';
import { hexToRgba } from '@/lib/color/hexToRgba.js';
import { coerceToRgba } from '@/lib/color/coerceToRgba.js';

export class GlUrtain extends HTMLElement {
	#scrunchness = 0.5;
	public get scrunchness() {
		return this.#scrunchness;
	}
	public set scrunchness(value) {
		this.#scrunchness = Math.max(0, Math.min(1, value));
	}

	#lightColor: RgbaColor = hexToRgba('#fff');
	public get lightColor(): RgbaColor {
		return this.#lightColor;
	}
	public set lightColor(value: RgbaColor | HexColor) {
		this.#lightColor = coerceToRgba(value);
	}

	#shadowColor: RgbaColor = hexToRgba('#ed9f53');
	public get shadowColor(): RgbaColor {
		return this.#shadowColor;
	}
	public set shadowColor(value: RgbaColor | HexColor) {
		this.#shadowColor = coerceToRgba(value);
	}

	#diffuseColor: RgbaColor = hexToRgba('#fff4e6');
	public get diffuseColor(): RgbaColor {
		return this.#diffuseColor;
	}
	public set diffuseColor(value: RgbaColor | HexColor) {
		this.#diffuseColor = coerceToRgba(value);
	}

	private readonly shadow = this.attachShadow({ mode: 'open' });

	private readonly css = (() => {
		const css = document.createElement('style');
		css.textContent = /* css */ `
			:host {
				display: flex;
			}
			canvas {
				display: block;
				width: 100%;
			}
		`;
		this.shadow.appendChild(css);
		return css;
	})();
	private readonly canvas = (() => {
		const canvas = document.createElement('canvas');
		this.shadow.appendChild(canvas);
		return canvas;
	})();
	private readonly canvasSize = (() => {
		const canvasSize = new Store<{
			width: number | undefined;
			height: number | undefined;
		}>({
			width: this.canvas.width || undefined,
			height: this.canvas.height || undefined,
		});
		const canvasRo = new ResizeObserver(([entry]) => {
			if (!entry) {
				return;
			}

			const {
				contentRect: { width, height },
			} = entry;

			canvasSize.set({ width: width || 1, height: height || 1 });
		});
		canvasRo.observe(this.canvas);

		return canvasSize.supply;
	})();
	private readonly app = (() => {
		const app = PicoGL.createApp(this.canvas)
			.clearColor(0, 0, 0, 0)
			.enable(PicoGL.DEPTH_TEST);

		this.canvasSize.subscribe(({ width, height }) => {
			if (!width || !height) {
				return;
			}

			app.resize(width, height);
		});

		return app;
	})();

	public async connectedCallback() {
		const { canvas, canvasSize, app } = this;

		const { draw: drawA } = await createCurtain({
			app,
			canvas,
			canvasSize,
		});
		const { draw: drawB } = await createCurtain({
			app,
			canvas,
			canvasSize,
		});
		const { scrunchness, lightColor, shadowColor, diffuseColor } = this;

		requestAnimationFrame(function draw() {
			requestAnimationFrame(draw);

			app.defaultViewport();
			app.defaultDrawFramebuffer();
			app.clear();

			drawA({
				scrunchness,
				scrunchDirection: 1,
				lightColor,
				shadowColor,
				diffuseColor,
			});
			drawB({
				scrunchness,
				scrunchDirection: -1,
				lightColor,
				shadowColor,
				diffuseColor,
			});
		});
	}
}
