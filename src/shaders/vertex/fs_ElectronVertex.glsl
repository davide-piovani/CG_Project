#version 300 es

precision mediump float;

in vec4 finalColor;

out vec4 outColor;

void main() {
    outColor = finalColor;
}