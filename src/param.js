let gl;
let program;
let vao;

let a;
let n = 0.1;
let f = 100.0;

let w = 3;              //only if we use parallel projection
let fieldOfView = 90;   //only if we use perspective projection

let sceneObjects = [];

let camera = {
    x: 0.0,
    y: 0.0,
    z: 1.0,
    elev:   0.0,        //rotation over the x-axis
    angle:  0.0         //rotation over the y-axis
}

let matrices = {
    viewMatrix: null,
    projectionMatrix: null
}

//List of locations we are going to use in the shaders
let locations = {
    positionAttributeLocation: null,
    colorAttributeLocation: null,
    wvpMatrixLocation: null
}