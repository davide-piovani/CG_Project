#version 300 es

in vec3 a_position;

uniform mat4 wvpMatrix;

out vec3 fs_pos;

void main() {
    fs_pos = a_position;
    gl_Position = wvpMatrix * vec4(a_position,1.0);
}