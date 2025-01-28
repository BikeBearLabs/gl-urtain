export type Array0ToN<N extends number, Acc extends number[] = []> =
	Acc['length'] extends N ? Acc[number]
	:	Array0ToN<N, [...Acc, Acc['length']]>;
