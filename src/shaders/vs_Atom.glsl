#version 300 es

in vec3 a_position;
in vec2 a_uv;

uniform mat4 wvpMatrix;

out vec3 fs_pos;
out vec2 uvFS;

void main() {
    fs_pos = a_position;
    uvFS = a_uv;
    gl_Position = wvpMatrix * vec4(a_position,1.0);
}