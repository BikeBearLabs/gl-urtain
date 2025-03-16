#version 300 es

precision highp float;

in vec2 vScreenUV;

uniform sampler2D uPositionBuffer;

out float outVisibility;

void main() {
	vec2 dimensions = vec2(textureSize(uPositionBuffer, 0));
	ivec2 texelCoord = ivec2(vScreenUV * dimensions);
	vec3 position = texelFetch(uPositionBuffer, texelCoord, 0).xyz;

	outVisibility = (position.x >= -.48 && position.x <= .48 &&
					 position.y >= -.45 && position.y <= .45) ||
							(position.z <= -.05 || position.z >= .05)
						? 1.
						: 0.;
}