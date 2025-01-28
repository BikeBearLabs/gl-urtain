#version 300 es
precision highp float;
precision highp int;

layout(std140, column_major) uniform SceneUniforms {
	mat4 viewProj;
	vec4 lightPosition;
	ivec3 lightColor;
	ivec3 shadowColor;
};

uniform sampler2D uDiffuse;

in vec3 vPosition;
in vec2 vUV;
in vec3 vNormal;

out vec4 fragColor;
void main() {
	vec3 color = texture(uDiffuse, vUV).rgb;

	vec3 normal = normalize(vNormal);
	vec3 lightVec = -normalize(vPosition - lightPosition.xyz);
	float diffuse = abs(dot(lightVec, normal));
	float ambient = 0.1;

	// Interpolate between shadow color and light color based on diffuse factor
	vec3 finalLight = mix(vec3(shadowColor) / 255.0, vec3(lightColor) / 255.0,
						  diffuse + ambient);
	fragColor = vec4(color * finalLight, 1.0);
}