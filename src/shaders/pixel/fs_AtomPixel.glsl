#version 300 es

precision mediump float;

in vec3 fs_pos;
in vec3 fs_normal;
in vec2 uvFS;

uniform sampler2D u_texture;
uniform vec4 ambientLight;

uniform vec3 directLightDir;
uniform vec4 directLightColor;
uniform vec4 pointLightColor[8];
uniform vec3 pointLightPos[8];
uniform float pointLightG;
uniform float pointLightDecay;
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
        if (k != i && isLightOn(pointLightColor[k])) {
            bool hit = lightHitObject(pointLightPos[i], lightDir, pointLightPos[k]);
            if (hit) return false;
        }
    }
    return true;
}

vec4 pointLight(int i) {
    float decay_factor = pow(pointLightG / length(pointLightPos[i] - fs_pos), pointLightDecay);
    return decay_factor * pointLightColor[i];
}

float lambertDiffuse(vec3 lightDir, vec3 norm) {
    return clamp(dot(lightDir, norm), 0.0, 1.0);
}

float orenNayarDiffuse(vec3 eyeDir, vec3 lightDir, vec3 norm) {
    float theta_i = acos(dot(lightDir, norm));
    float theta_r = acos(dot(eyeDir, norm));

    float alpha = max(theta_i, theta_r);
    float beta  = min(theta_i, theta_r);

    float A = 1.0 - 0.5 * (sigma_squared / (sigma_squared+0.33));
    float B = 0.45 *  (sigma_squared / (sigma_squared+0.09));

    vec3 Vi = normalize(lightDir - dot(lightDir, norm)*norm);
    vec3 Vr = normalize(eyeDir - dot(eyeDir, norm)*norm);

    float G = max(0.0, dot(Vi, Vr));
    float L = clamp(dot(lightDir, norm), 0.0, 1.0);

    return L * (A + B * G * sin(alpha) * tan(beta));
}

float phongSpecular(vec3 eyeDir, vec3 lightDir, vec3 norm) {
    vec3 r = 2.0 * dot(lightDir, norm) * norm - lightDir;
    return pow(clamp(dot(eyeDir, r),0.0,1.0), SpecShine);
}

float blinnSpecular(vec3 eyeDir, vec3 lightDir, vec3 norm) {
    return pow(clamp(dot(normalize(eyeDir + lightDir), norm),0.0,1.0), SpecShine);
}

void calculateDiffuseAndSpecularContrib(vec4 lightColor, vec3 lightDir, vec3 eyeDir, inout vec4 diffuse_contrib, inout vec4 specular_contrib, vec3 norm) {
    float dif = 0.0;
    float spec = 0.0;

    if (diffuseMode == 1.0) dif = lambertDiffuse(lightDir, norm);
    if (diffuseMode == 2.0) dif = orenNayarDiffuse(eyeDir, lightDir, norm);

    if (specularMode == 1.0) spec = phongSpecular(eyeDir, lightDir, norm);
    if (specularMode == 2.0) spec = blinnSpecular(eyeDir, lightDir, norm);

    diffuse_contrib = diffuse_contrib + dif * lightColor;
    specular_contrib = specular_contrib + spec * lightColor;
}

void main() {
    vec3 norm = normalize(fs_normal);
    vec4 objectColor = texture(u_texture, uvFS);

    vec4 diffuse_contrib = vec4(0.0, 0.0, 0.0, 0.0);
    vec4 specular_contrib = vec4(0.0, 0.0, 0.0, 0.0);
    vec3 eyeDir = normalize(eyePos - fs_pos);

    if (isDay == 1.0) {
        calculateDiffuseAndSpecularContrib(directLightColor, directLightDir, eyeDir, diffuse_contrib, specular_contrib, norm);
    } else {
        for(int i = 0; i < 8; i++) {
            vec3 lightDir = normalize(pointLightPos[i] - fs_pos);
            if (rayCasting == 1.0 && !lightIlluminateObject(i, lightDir)) continue;

            vec4 lightColor = pointLight(i);
            calculateDiffuseAndSpecularContrib(lightColor, lightDir, eyeDir, diffuse_contrib, specular_contrib, norm);
        }
    }

    vec4 diffuse = objectColor * diffuse_contrib;
    vec4 specular = vec4(1.0, 1.0, 1.0, 1.0) * specular_contrib;
    vec4 ambient = objectColor * ambientLight;

    outColor = clamp(diffuse + specular + ambient, 0.0, 1.0);
}