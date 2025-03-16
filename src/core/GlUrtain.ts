import { type HexColor } from '@/lib/color/HexColor.js';
import { type RgbaColor } from '@/lib/color/RgbaColor.js';
import { hexToRgba } from '@/lib/color/hexToRgba.js';
import { Store } from '@/lib/store/Store.js';
import { PicoGL } from 'picogl';
import { createCurtain } from './createCurtain.js';

export class GlUrtain extends HTMLElement {
	public scrunchness = Number(this.getAttribute('scrunchness') ?? 0.5);
	public lightColor: RgbaColor | HexColor = hexToRgba(
		(this.getAttribute('lightColor') as HexColor) ?? '#fff',
	);
	public shadowColor: RgbaColor | HexColor = hexToRgba(
		(this.getAttribute('shadowColor') as HexColor) ?? '#9c8c7c',
	);
	public diffuseColor: RgbaColor | HexColor = hexToRgba(
		(this.getAttribute('diffuseColor') as HexColor) ?? '#fff4e6',
	);
	public playing = true;

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

	protected async connectedCallback() {
		const { canvas, canvasSize, app } = this;

		const { draw: drawA } = await createCurtain({
			app,
			canvas,
			canvasSize,
			onVisibilityChange: (v) => {
				this.handleVisibilityChange(v);
			},
		});
		const { draw: drawB } = await createCurtain({
			app,
			canvas,
			canvasSize,
			onVisibilityChange: (v) => {
				this.handleVisibilityChange(v);
			},
		});

		const draw = () => {
			requestAnimationFrame(draw);

			let {
				playing,
				scrunchness,
				lightColor,
				shadowColor,
				diffuseColor,
			} = this;

			if (!playing) {
				return;
			}

			if (typeof lightColor === 'string') {
				lightColor = hexToRgba(lightColor);
				this.lightColor = lightColor;
			}
			if (typeof shadowColor === 'string') {
				shadowColor = hexToRgba(shadowColor);
				this.shadowColor = shadowColor;
			}
			if (typeof diffuseColor === 'string') {
				diffuseColor = hexToRgba(diffuseColor);
				this.diffuseColor = diffuseColor;
			}

			app.defaultViewport();
			app.defaultDrawFramebuffer();
			app.clear();

			drawA({
				scrunchness,
				scrunchDirection: 1,
				lightColor,
				shadowColor,
				diffuseColor,
				offset: { z: 0.02 },
			});
			drawB({
				scrunchness,
				scrunchDirection: -1,
				lightColor,
				shadowColor,
				diffuseColor,
				offset: { z: 0 },
			});
		};
		requestAnimationFrame(draw);
	}

	public onVisibilityChange:
		| ((event: CustomEvent<boolean>) => void)
		| undefined;
	protected handleVisibilityChange(visible: boolean) {
		this.style.display = visible ? '' : 'none';
		const event = new CustomEvent('visibilitychange', {
			detail: visible,
		});
		this.onVisibilityChange?.(event);
		this.dispatchEvent(event);
	}
}
