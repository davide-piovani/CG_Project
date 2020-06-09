var vs =

`#version 300 es

in vec3 a_position;
in vec2 a_uv;
out vec2 uvFS;

uniform mat4 wvpMatrix;

void main() {
    uvFS = a_uv;
    gl_Position = wvpMatrix * vec4(a_position,1.0);
}`;

var fs =

`#version 300 es

precision mediump float;

in vec2 uvFS;
out vec4 outColor;
uniform sampler2D u_texture;

void main() {
    outColor = texture(u_texture, uvFS);
}`;