#version 300 es

precision mediump float;

uniform vec4 difColor;

out vec4 outColor;

void main() {
    float perc = 0.5;
    vec4 contribution = vec4(perc, perc, perc, 1.0);
    outColor = clamp(difColor * contribution, 0.0, 1.0);
}