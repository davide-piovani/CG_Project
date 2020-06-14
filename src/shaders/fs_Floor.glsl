#version 300 es

precision mediump float;

uniform vec4 ambientColor;

out vec4 outColor;

void main() {
    outColor = clamp(ambientColor, 0.0, 1.0);
}