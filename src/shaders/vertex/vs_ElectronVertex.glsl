#version 300 es

in vec3 a_position;
in vec3 a_normal;

uniform mat4 wvpMatrix;

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

out vec4 finalColor;



float lambertDiffuse() {
    return clamp(dot(directLightDir, a_normal), 0.0, 1.0);
}

float orenNayarDiffuse(vec3 eyeDir) {
    float theta_i = acos(dot(directLightDir, a_normal));
    float theta_r = acos(dot(eyeDir, a_normal));

    float alpha = max(theta_i, theta_r);
    float beta  = min(theta_i, theta_r);

    float A = 1.0 - 0.5 * (sigma_squared / (sigma_squared+0.33));
    float B = 0.45 *  (sigma_squared / (sigma_squared+0.09));

    vec3 Vi = normalize(directLightDir - dot(directLightDir, a_normal)*a_normal);
    vec3 Vr = normalize(eyeDir - dot(eyeDir, a_normal)*a_normal);

    float G = max(0.0, dot(Vi, Vr));
    float L = clamp(dot(directLightDir, a_normal), 0.0, 1.0);

    return L * (A + B * G * sin(alpha) * tan(beta));
}

float phongSpecular(vec3 eyeDir) {
    vec3 r = 2.0 * dot(directLightDir, a_normal) * a_normal - directLightDir;
    return pow(clamp(dot(eyeDir, r),0.0,1.0), SpecShine);
}

float blinnSpecular(vec3 eyeDir) {
    return pow(clamp(dot(normalize(eyeDir + directLightDir), a_normal),0.0,1.0), SpecShine);
}

vec4 calculateDayColor() {
    vec3 eyeDir = normalize(eyePos - a_position);

    float dif = 0.0;
    float spec = 0.0;

    if (diffuseMode == 1.0) dif = lambertDiffuse();
    if (diffuseMode == 2.0) dif = orenNayarDiffuse(eyeDir);

    if (specularMode == 1.0) spec = phongSpecular(eyeDir);
    if (specularMode == 2.0) spec = blinnSpecular(eyeDir);

    vec4 diffuse_contrib = dif * directLightColor;
    vec4 specular_contrib = spec * directLightColor;

    vec4 diffuse = ambientColor * diffuse_contrib;
    vec4 specular = vec4(1.0, 1.0, 1.0, 1.0) * specular_contrib;
    vec4 ambient = ambientColor * ambientLight;

    return clamp(diffuse + specular + ambient, 0.0, 1.0);
}

void main() {
    if (isDay == 1.0) {
        finalColor = calculateDayColor();
    } else {
        finalColor = clamp(ambientColor*ambientLight + emitColor, 0.0, 1.0);
    }

    gl_Position = wvpMatrix * vec4(a_position,1.0);
}