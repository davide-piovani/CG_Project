#version 300 es

precision mediump float;

in vec3 fs_pos;

uniform vec4 ambientLight;
uniform vec4 light_color;
uniform vec3 light_pos;
uniform float light_g;
uniform float light_decay;

out vec4 outColor;

void main() {
    vec4 objectColor = vec4(1.0, 0.0, 0.0, 1.0);

    float decay_factor = pow(light_g / length(light_pos - fs_pos), light_decay);
    vec4 lightIntensity = decay_factor * light_color;

    outColor = clamp(objectColor*lightIntensity + objectColor*ambientLight, 0.0, 1.0);
}