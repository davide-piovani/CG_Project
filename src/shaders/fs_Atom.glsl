#version 300 es

precision mediump float;

in vec3 fs_pos;
in vec2 uvFS;

uniform sampler2D u_texture;
uniform vec4 light_color;
uniform vec3 light_pos;
uniform float light_g;
uniform float light_decay;

out vec4 outColor;

void main() {
    vec3 light_dir = normalize(light_pos - fs_pos);
    float decay_factor = pow(light_g / length(light_pos - fs_pos), light_decay);

    vec4 lightColor = decay_factor * light_color;
    vec4 textureColor = texture(u_texture, uvFS);

    outColor = clamp(textureColor + lightColor, 0.0, 1.0);
}