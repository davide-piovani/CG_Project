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
uniform float electronRadius_squared;
uniform float rayCasting;
uniform vec3 eyePos;
uniform float SpecShine;
uniform float sigma_squared;

uniform float isDay;            //0 -> night, 1 -> day
uniform float diffuseMode;      //0.0 -> no diffuse,  1.0 -> Lambert, 2.0 Oren-Nayar
uniform float specularMode;     //0.0 -> no specular, 1.0 -> Phong,   2.0 Blinn

out vec4 outColor;

bool lightHitObject(vec3 rayStartPoint, vec3 rayNormalisedDir, vec3 sphereCentre) {
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

bool lightIlluminateObject(int i, vec3 lightDir) {
    for(int k = 0; k < 8; k++){
        if (k != i && isLightOn(light_color[k])) {
            bool hit = lightHitObject(light_pos[i], lightDir, light_pos[k]);
            if (hit) return false;
        }
    }
    return true;
}

vec4 pointLight(int i) {
    float decay_factor = pow(light_g / length(light_pos[i] - fs_pos), light_decay);
    return decay_factor * light_color[i];
}

float lambertDiffuse(vec3 lightDir) {
    return clamp(dot(lightDir, fs_normal), 0.0, 1.0);
}

float orenNayarDiffuse(vec3 eyeDir, vec3 lightDir) {
    float theta_i = acos(dot(lightDir, fs_normal));
    float theta_r = acos(dot(eyeDir, fs_normal));

    float alpha = max(theta_i, theta_r);
    float beta  = min(theta_i, theta_r);

    float A = 1.0 - 0.5 * (sigma_squared / (sigma_squared+0.33));
    float B = 0.45 *  (sigma_squared / (sigma_squared+0.09));

    vec3 Vi = normalize(lightDir - dot(lightDir, fs_normal)*fs_normal);
    vec3 Vr = normalize(eyeDir - dot(eyeDir, fs_normal)*fs_normal);

    float G = max(0.0, dot(Vi, Vr));
    float L = clamp(dot(lightDir, fs_normal), 0.0, 1.0);

    return L * (A + B * G * sin(alpha) * tan(beta));
}

float phongSpecular(vec3 eyeDir, vec3 lightDir) {
    vec3 r = 2.0 * dot(lightDir, fs_normal) * fs_normal - lightDir;
    return pow(clamp(dot(eyeDir, r),0.0,1.0), SpecShine);
}

float blinnSpecular(vec3 eyeDir, vec3 lightDir) {
    return pow(clamp(dot(normalize(eyeDir + lightDir), fs_normal),0.0,1.0), SpecShine);
}

void calculateDiffuseAndSpecularContribNight(inout vec4 diffuse_contrib, inout vec4 specular_contrib) {
    for(int i = 0; i < 8; i++) {
        vec3 lightDir = normalize(light_pos[i] - fs_pos);

        if (rayCasting == 1.0 && !lightIlluminateObject(i, lightDir)) continue;

        vec4 lightColor = pointLight(i);
        vec3 eyeDir = normalize(eyePos - fs_pos);

        float dif = 0.0;
        float spec = 0.0;

        if (diffuseMode == 1.0) dif = lambertDiffuse(lightDir);
        if (diffuseMode == 2.0) dif = orenNayarDiffuse(eyeDir, lightDir);

        if (specularMode == 1.0) spec = phongSpecular(eyeDir, lightDir);
        if (specularMode == 2.0) spec = blinnSpecular(eyeDir, lightDir);

        diffuse_contrib = diffuse_contrib + dif * lightColor;
        specular_contrib = specular_contrib + spec * lightColor;
    }
}

void calculateDiffuseAndSpecularContribDay(inout vec4 diffuse_contrib, inout vec4 specular_contrib) {
    //diffuse_contrib = diffuse_contrib + vec4(0.5, 0.5, 0.5, 1.0);
    //specular_contrib = specular_contrib + vec4(0.5, 0.5, 0.5, 1.0);
}

void main() {
    vec4 objectColor = texture(u_texture, uvFS);

    vec4 diffuse_contrib = vec4(0.0, 0.0, 0.0, 0.0);
    vec4 specular_contrib = vec4(0.0, 0.0, 0.0, 0.0);

    if (isDay == 1.0) calculateDiffuseAndSpecularContribDay(diffuse_contrib, specular_contrib);
    else calculateDiffuseAndSpecularContribNight(diffuse_contrib, specular_contrib);

    vec4 diffuse = objectColor * diffuse_contrib;
    vec4 specular = vec4(1.0, 1.0, 1.0, 1.0) * specular_contrib;
    vec4 ambient = objectColor * ambientLight;

    outColor = clamp(diffuse + specular + ambient, 0.0, 1.0);
}