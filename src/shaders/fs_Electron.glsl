#version 300 es

precision mediump float;

in vec3 fs_normal;

uniform vec4 ambientColor;
uniform vec4 ambientLight;
uniform vec4 emitColor;

out vec4 outColor;

void main() {
    outColor = clamp(ambientColor*ambientLight + emitColor, 0.0, 1.0);
}