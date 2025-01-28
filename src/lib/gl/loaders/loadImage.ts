export async function loadImage(url: string) {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();

		image.addEventListener(
			'error',
			(e) => {
				reject(
					new Error(e.message, {
						cause: e.error,
					}),
				);
			},
			{ once: true },
		);

		image.addEventListener(
			'abort',
			() => {
				reject(new Error('Image loading aborted'));
			},
			{ once: true },
		);

		image.addEventListener(
			'load',
			() => {
				resolve(image);
			},
			{ once: true },
		);

		image.src = url;
		if (image.complete) resolve(image);
	});
}
