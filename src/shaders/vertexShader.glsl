#version 300 es

in vec3 a_position;
in vec2 a_uv;
out vec2 uvFS;

uniform mat4 wvpMatrix;

void main() {
    uvFS = a_uv;
    gl_Position = wvpMatrix * vec4(a_position,1.0);
}