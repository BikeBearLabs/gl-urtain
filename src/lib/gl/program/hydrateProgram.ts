/* eslint-disable complexity */
/* eslint-disable max-params */
/* eslint-disable no-bitwise */
import { warn } from '@/lib/console/warn.js';
import { UnimplementedError } from '@/lib/errors/UnimplementedError.js';
import { type ReadableStore } from '@/lib/store/ReadableStore.js';
import { cast } from '@/lib/type/cast.js';
import { ShaderDataType as t } from '../shader/ShaderDataType.js';
import {
	type ShaderTypeQualifierAttributeParam,
	type ShaderKeywordQualifier,
	type ShaderParam,
	type ShaderTypeQualifierUniformParam,
	type ShaderTypeQualifierUniformValue,
} from '../shader/ShaderParam.js';
import { ShaderParamKeyword as k } from '../shader/ShaderParamKeyword.js';
import { type ProgramHydration } from './ProgramHydration.js';

export function hydrateProgram<
	const Params extends readonly Readonly<ShaderParam>[],
>(
	gl: WebGLRenderingContext,
	program: WebGLProgram,
	params: Params,
	data: ProgramHydration<Params>,
) {
	// TODO: implement array hydration
	for (const [kw, type, name, arr] of params) {
		if (!(name in data)) {
			continue;
		}

		const value = data[name as keyof typeof data];
		switch (kw) {
			case k.IN:
				hydrateAttribute(gl, program, type, name, value);
				break;
			case k.UNIFORM:
				hydrateUniform(gl, program, type, name, value);
				break;
			case k.OUT:
				throw new TypeError('out attributes cannot be hydrated');
		}
	}
}

const programToSubscribedUniformNameToContext = new WeakMap<
	WebGLProgram,
	Map<
		string,
		{
			unsubscribe: () => void;
			store: ReadableStore<unknown>;
		}
	>
>();
function hydrateUniform(
	gl: WebGLRenderingContext,
	program: WebGLProgram,
	type: ShaderTypeQualifierUniformParam,
	name: string,
	value: unknown,
) {
	const u = gl.getUniformLocation(program, name);
	if (!some(u)) {
		warnNotFound(k.UNIFORM, name);
		return;
	}
	let subscribedUniformNameToContext =
		programToSubscribedUniformNameToContext.get(program);
	if (!subscribedUniformNameToContext) {
		subscribedUniformNameToContext = new Map();
		programToSubscribedUniformNameToContext.set(
			program,
			subscribedUniformNameToContext,
		);
	}
	const subscribeContext = subscribedUniformNameToContext.get(name);

	if (typeof type === 'object') {
		type UniformStructHydrationValue = Record<
			string,
			ShaderTypeQualifierUniformValue<ShaderTypeQualifierUniformParam>
		>;
		cast<
			| UniformStructHydrationValue
			| ReadableStore<UniformStructHydrationValue>
		>(value);

		if ('subscribe' in value) {
			cast<ReadableStore<UniformStructHydrationValue>>(value);
			if (subscribeContext && subscribeContext.store === value) {
				value.trigger();
			} else {
				subscribeContext?.unsubscribe();
				value.subscribe((value) => {
					for (const [fieldType, fieldName] of type) {
						hydrateUniform(
							gl,
							program,
							fieldType,
							`${name}.${fieldName}`,
							value[fieldName],
						);
					}
				});
			}
		} else {
			for (const [fieldType, fieldName] of type) {
				hydrateUniform(
					gl,
					program,
					fieldType,
					`${name}.${fieldName}`,
					value[fieldName],
				);
			}
		}
	} else if (type === t.FLOAT) {
		cast<number | ReadableStore<number>>(value);
		if (typeof value === 'object') {
			if (subscribeContext && subscribeContext.store === value) {
				value.trigger();
			} else {
				subscribeContext?.unsubscribe();
				value.subscribe((value) => {
					gl.uniform1f(u, value);
				});
			}
		} else {
			gl.uniform1f(u, value);
		}
	} else if (type === t.BOOL) {
		cast<boolean | ReadableStore<boolean>>(value);
		if (typeof value === 'object') {
			if (subscribeContext && subscribeContext.store === value) {
				value.trigger();
			} else {
				subscribeContext?.unsubscribe();
				value.subscribe((value) => {
					gl.uniform1f(u, Number(value));
				});
			}
		} else {
			gl.uniform1f(u, Number(value));
		}
	} else if (type === t.VEC2) {
		cast<number[] | ReadableStore<number[]>>(value);
		if ('subscribe' in value) {
			if (subscribeContext && subscribeContext.store === value) {
				value.trigger();
			} else {
				subscribeContext?.unsubscribe();
				value.subscribe((value) => {
					gl.uniform2fv(u, value);
				});
			}
		} else {
			gl.uniform2fv(u, value);
		}
	} else if (type === t.VEC3) {
		cast<number[] | ReadableStore<number[]>>(value);
		if ('subscribe' in value) {
			if (subscribeContext && subscribeContext.store === value) {
				value.trigger();
			} else {
				subscribeContext?.unsubscribe();
				value.subscribe((value) => {
					gl.uniform3fv(u, value);
				});
			}
		} else {
			gl.uniform3fv(u, value);
		}
	} else if (type === t.VEC4) {
		cast<number[] | ReadableStore<number[]>>(value);
		if ('subscribe' in value) {
			if (subscribeContext && subscribeContext.store === value) {
				value.trigger();
			} else {
				subscribeContext?.unsubscribe();
				value.subscribe((value) => {
					gl.uniform4fv(u, value);
				});
			}
		} else {
			gl.uniform4fv(u, value);
		}
	} else if (type === t.MAT2) {
		cast<number[] | ReadableStore<number[]>>(value);
		if ('subscribe' in value) {
			if (subscribeContext && subscribeContext.store === value) {
				value.trigger();
			} else {
				subscribeContext?.unsubscribe();
				value.subscribe((value) => {
					gl.uniformMatrix2fv(u, false, value);
				});
			}
		} else {
			gl.uniformMatrix2fv(u, false, value);
		}
	} else if (type === t.MAT3) {
		cast<number[] | ReadableStore<number[]>>(value);
		if ('subscribe' in value) {
			if (subscribeContext && subscribeContext.store === value) {
				value.trigger();
			} else {
				subscribeContext?.unsubscribe();
				value.subscribe((value: number[]) => {
					gl.uniformMatrix3fv(u, false, value);
				});
			}
		} else {
			gl.uniformMatrix3fv(u, false, value);
		}
	} else if (type === t.MAT4) {
		cast<number[] | ReadableStore<number[]>>(value);
		if ('subscribe' in value) {
			if (subscribeContext && subscribeContext.store === value) {
				value.trigger();
			} else {
				subscribeContext?.unsubscribe();
				value.subscribe((value: number[]) => {
					gl.uniformMatrix4fv(u, false, value);
				});
			}
		} else {
			gl.uniformMatrix4fv(u, false, value);
		}
	} else if (type & t.$SAMPLER$D) {
		cast<WebGLTexture | ReadableStore<WebGLTexture>>(value);
		if ('subscribe' in value) {
			if (subscribeContext && subscribeContext.store === value) {
				value.trigger();
			} else {
				subscribeContext?.unsubscribe();
				value.subscribe((value) => {
					gl.activeTexture(gl.TEXTURE0);
					gl.bindTexture(gl.TEXTURE_2D, value);

					gl.uniform1i(u, 0);
				});
			}
		} else {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, value);

			gl.uniform1i(u, 0);
		}
	} else {
		throw new UnimplementedError(
			`Unexpected program shader hydration data type: ${type}`,
		);
	}
}

function hydrateAttribute(
	gl: WebGLRenderingContext,
	program: WebGLProgram,
	type: ShaderTypeQualifierAttributeParam,
	name: string,
	value: unknown,
) {
	const a = gl.getAttribLocation(program, name);
	if (!some(a)) {
		warnNotFound(k.IN, name);
		return;
	}
	if (type === t.FLOAT) {
		cast<number | WebGLBuffer>(value);
		if (typeof value === 'number') {
			gl.vertexAttrib1f(a, value);
		} else {
			bindAttribArray(gl, a, 1, gl.FLOAT, value);
		}
	} else if (type === t.VEC2) {
		cast<number[] | WebGLBuffer>(value);
		if ('length' in value && value.length === 2) {
			gl.vertexAttrib2fv(a, value);
		} else {
			bindAttribArray(gl, a, 2, gl.FLOAT, value);
		}
	} else if (type === t.VEC3) {
		cast<number[] | WebGLBuffer>(value);
		if ('length' in value && value.length === 3) {
			gl.vertexAttrib3fv(a, value);
		} else {
			bindAttribArray(gl, a, 3, gl.FLOAT, value);
		}
	} else if (type === t.VEC4) {
		cast<number[] | WebGLBuffer>(value);
		if ('length' in value && value.length === 4) {
			gl.vertexAttrib4fv(a, value);
		} else {
			bindAttribArray(gl, a, 4, gl.FLOAT, value);
		}
	} else if (type === t.BOOL || type & t.MAT$ || type & t.$SAMPLER$D) {
		throw new TypeError();
	} else {
		throw new UnimplementedError(
			`Unexpected program shader hydration data type: ${type}`,
		);
	}
}

function bindAttribArray(
	/** @type {WebGLRenderingContext} */ gl: WebGLRenderingContext,
	/** @type {number} */ a: number,
	/** @type {number} */ componentCount: number,
	/** @type {number} */ type: number,
	/** @type {WebGLBuffer} */ buf: WebGLBuffer,
) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);

	gl.vertexAttribPointer(a, componentCount, type, false, 0, 0);
	gl.enableVertexAttribArray(a);
}

/**
 * @template T
 * @returns {value is NonNullable<T>}
 */
function some<T>(/** @type {T} */ value: T): value is NonNullable<T> {
	return value != null;
}

function warnNotFound(kw: ShaderKeywordQualifier, name: string) {
	warn(
		`${(() => {
			switch (kw) {
				case k.IN:
					return 'An in attribute';
				case k.OUT:
					return 'An out attribute';
				case k.UNIFORM:
					return 'A uniform';
			}
		})()} (${name}) was not hydrated because it couldn't be found in the shader.\n\nThis might happen when the linker optimizes away an unused parameter, or it's a typo.`,
	);
}
