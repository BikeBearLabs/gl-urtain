export async function loadText(url: string) {
	return fetch(url).then(async (response) => response.text());
}
