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
uniform float electronRadius;

out vec4 outColor;

bool lightHitObject(vec3 rayStartPoint, vec3 rayNormalisedDir, vec3 sphereCentre, float electronRadius_squared) {
    vec3 l = sphereCentre - rayStartPoint;
    float l_squared = l.x*l.x + l.y*l.y + l.z*l.z;

    if (l_squared < electronRadius_squared) return true;

    float s = l.x*rayNormalisedDir.x + l.y*rayNormalisedDir.y + l.z*rayNormalisedDir.z;
    if (s < 0.0) return false;

    float m_squared = l_squared - s*s;
    if (m_squared > electronRadius_squared) return false;
    return true;
}

bool isLightOn(vec4 light) {
    return !(light.r == 0.0 && light.g == 0.0 && light.b == 0.0);
}

bool lightIlluminateObject(int i, vec3 pointLightDir, float electronRadius_squared) {
    for(int k = 0; k < 8; k++){
        if (k != i && isLightOn(light_color[k])) {
            bool hit = lightHitObject(light_pos[i], pointLightDir, light_pos[k], electronRadius_squared);
            if (hit) return false;
        }
    }
    return true;
}

void main() {
    float electronRadius_squared = pow(electronRadius, 2.0);

    vec4 objectColor = texture(u_texture, uvFS);

    vec4 contrib = vec4(0.0, 0.0, 0.0, 0.0);
    for(int i = 0; i < 8; i++) {
        vec3 pointLightDir = normalize(light_pos[i] - fs_pos);

        if (!lightIlluminateObject(i, pointLightDir, electronRadius_squared)) continue;

        float decay_factor = pow(light_g / length(light_pos[i] - fs_pos), light_decay);
        vec4 lightColor = decay_factor * light_color[i];

        contrib = contrib + lightColor * clamp(dot(pointLightDir, fs_normal), 0.0, 1.0);
    }

    outColor = clamp(objectColor*contrib + objectColor*ambientLight, 0.0, 1.0);
}