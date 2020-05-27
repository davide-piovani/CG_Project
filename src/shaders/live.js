var vs =

`#version 300 es

in vec3 a_position;
in vec3 a_color;
out vec3 colorV;

uniform mat4 wvpMatrix;

void main() {
colorV = a_color;
gl_Position = wvpMatrix * vec4(a_position,1.0);

}`;

var fs =

    `#version 300 es

precision mediump float;

in vec3 colorV;
out vec4 outColor;

void main() {
    outColor = vec4(colorV,1.0);
}`;