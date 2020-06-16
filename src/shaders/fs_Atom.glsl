#version 300 es

precision mediump float;

in vec3 fs_pos;
in vec3 fs_normal;
in vec2 uvFS;

uniform sampler2D u_texture;
uniform vec4 ambientLight;

uniform vec4 light_color[8];
uniform vec3 light_pos[8];
uniform float light_g;
uniform float light_decay;

out vec4 outColor;

void main() {
    vec4 objectColor = texture(u_texture, uvFS);

    vec4 contrib = vec4(0.0, 0.0, 0.0, 0.0);
    for(int i = 0; i < 8; i++){
        vec3 pointLightDir = normalize(light_pos[i] - fs_pos);
        float decay_factor = pow(light_g / length(light_pos[i] - fs_pos), light_decay);
        vec4 lightColor = decay_factor * light_color[i];

        contrib = contrib + lightColor * clamp(dot(pointLightDir, fs_normal), 0.0, 1.0);
    }

    outColor = clamp(objectColor*contrib + objectColor*ambientLight, 0.0, 1.0);
}