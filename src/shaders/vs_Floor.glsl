#version 300 es

in vec3 a_position;

uniform mat4 wvpMatrix;

void main() {
    gl_Position = wvpMatrix * vec4(a_position,1.0);
}