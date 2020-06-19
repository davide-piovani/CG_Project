#version 300 es

precision mediump float;

in vec3 fs_pos;
in vec3 fs_normal;

uniform vec4 ambientColor;
uniform vec4 ambientLight;
uniform vec4 emitColor;

uniform vec3 directLightDir;
uniform vec4 directLightColor;

uniform vec3 eyePos;
uniform float sigma_squared;
uniform float SpecShine;

uniform float isDay;            //0 -> night, 1 -> day
uniform float diffuseMode;      //0.0 -> no diffuse,  1.0 -> Lambert, 2.0 Oren-Nayar
uniform float specularMode;     //0.0 -> no specular, 1.0 -> Phong,   2.0 Blinn

out vec4 outColor;


float lambertDiffuse(vec3 norm) {
    return clamp(dot(directLightDir, norm), 0.0, 1.0);
}

float orenNayarDiffuse(vec3 eyeDir, vec3 norm) {
    float theta_i = acos(dot(directLightDir, norm));
    float theta_r = acos(dot(eyeDir, norm));

    float alpha = max(theta_i, theta_r);
    float beta  = min(theta_i, theta_r);

    float A = 1.0 - 0.5 * (sigma_squared / (sigma_squared+0.33));
    float B = 0.45 *  (sigma_squared / (sigma_squared+0.09));

    vec3 Vi = normalize(directLightDir - dot(directLightDir, norm)*norm);
    vec3 Vr = normalize(eyeDir - dot(eyeDir, norm)*norm);

    float G = max(0.0, dot(Vi, Vr));
    float L = clamp(dot(directLightDir, norm), 0.0, 1.0);

    return L * (A + B * G * sin(alpha) * tan(beta));
}

float phongSpecular(vec3 eyeDir, vec3 norm) {
    vec3 r = 2.0 * dot(directLightDir, norm) * norm - directLightDir;
    return pow(clamp(dot(eyeDir, r),0.0,1.0), SpecShine);
}

float blinnSpecular(vec3 eyeDir, vec3 norm) {
    return pow(clamp(dot(normalize(eyeDir + directLightDir), norm),0.0,1.0), SpecShine);
}

vec4 calculateDayColor() {
    vec3 norm = normalize(fs_normal);
    vec3 eyeDir = normalize(eyePos - fs_pos);

    float dif = 0.0;
    float spec = 0.0;

    if (diffuseMode == 1.0) dif = lambertDiffuse(norm);
    if (diffuseMode == 2.0) dif = orenNayarDiffuse(eyeDir, norm);

    if (specularMode == 1.0) spec = phongSpecular(eyeDir, norm);
    if (specularMode == 2.0) spec = blinnSpecular(eyeDir, norm);

    vec4 diffuse_contrib = dif * directLightColor;
    vec4 specular_contrib = spec * directLightColor;

    vec4 diffuse = ambientColor * diffuse_contrib;
    vec4 specular = vec4(1.0, 1.0, 1.0, 1.0) * specular_contrib;
    vec4 ambient = ambientColor * ambientLight;

    return clamp(diffuse + specular + ambient, 0.0, 1.0);
}

void main() {
    if (isDay == 1.0) {
        outColor = calculateDayColor();
    } else {
        outColor = clamp(ambientColor*ambientLight + emitColor, 0.0, 1.0);
    }
}