#version 300 es

precision highp float;

in vec2 vScreenUV;

uniform sampler2D uPositionBuffer;
uniform sampler2D uOldNormalBuffer;

layout(location = 0) out vec3 outNormal;
layout(location = 1) out vec3 outOldNormal;

void main() {
	ivec2 dimensions = textureSize(uPositionBuffer, 0);
	ivec2 texelCoord = ivec2(vScreenUV * vec2(dimensions));
	vec3 position = texelFetch(uPositionBuffer, texelCoord, 0).xyz;

	vec3 normal = vec3(0.0);

	// not left edge
	if (texelCoord.x > 0) {
		vec3 left =
			texelFetch(uPositionBuffer, texelCoord - ivec2(1, 0), 0).xyz;

		// not top edge
		if (texelCoord.y > 0) {
			vec3 down =
				texelFetch(uPositionBuffer, texelCoord - ivec2(0, 1), 0).xyz;
			normal += normalize(cross(left - position, down - position));
		}

		// not bottom edge
		if (texelCoord.y < dimensions.y - 1) {
			vec3 up =
				texelFetch(uPositionBuffer, texelCoord + ivec2(0, 1), 0).xyz;
			normal += normalize(cross(up - position, left - position));
		}
	}

	// not right edge
	if (texelCoord.x < dimensions.x - 1) {
		vec3 right =
			texelFetch(uPositionBuffer, texelCoord + ivec2(1, 0), 0).xyz;

		// not top edge
		if (texelCoord.y > 0) {
			vec3 down =
				texelFetch(uPositionBuffer, texelCoord - ivec2(0, 1), 0).xyz;
			normal += normalize(cross(down - position, right - position));
		}

		// not bottom edge
		if (texelCoord.y < dimensions.y - 1) {
			vec3 up =
				texelFetch(uPositionBuffer, texelCoord + ivec2(0, 1), 0).xyz;
			normal += normalize(cross(right - position, up - position));
		}
	}

	vec3 oldNormal = texelFetch(uOldNormalBuffer, texelCoord, 0).xyz;
	// normal = mix(oldNormal, normal, 0.01);

	outNormal = normalize(normal);
	outOldNormal = outNormal;
}