#version 300 es

in vec3 a_position;
in vec3 a_normal;

uniform mat4 wvpMatrix;

out vec3 fs_pos;
out vec3 fs_normal;

void main() {
    fs_pos = a_position;
    fs_normal = a_normal;
    gl_Position = wvpMatrix * vec4(a_position,1.0);
}