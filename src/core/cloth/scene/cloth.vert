#version 300 es
precision highp float;

layout(location = 0) in ivec2 aTexelCoord;
layout(location = 1) in vec2 aUV;

uniform vec3 uPositionOffset;
uniform sampler2D uPositionBuffer;
uniform sampler2D uNormalBuffer;

layout(std140, column_major) uniform SceneUniforms {
	mat4 viewProj;
	vec4 lightPosition;
	ivec3 lightColor;
	ivec3 shadowColor;
};

out vec3 vPosition;
out vec2 vUV;
out vec3 vNormal;

void main() {
	vec3 position =
		texelFetch(uPositionBuffer, aTexelCoord, 0).xyz + uPositionOffset;

	vPosition = position;
	vNormal = texelFetch(uNormalBuffer, aTexelCoord, 0).xyz;
	vUV = aUV;
	gl_Position = viewProj * vec4(position, 1.0);
}