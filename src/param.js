let gl;
let program;
let vao;

let a;
let n = 0.1;
let f = 100.0;

let w = 3;              //only if we use parallel projection
let fieldOfView = 90;   //only if we use perspective projection

let e_scale = 0.15;
let nucleous_scale = 0.2;

let atom;
let sceneObjects = [];

let paths = {
    base: "",
    assets: "src/assets",
    shaders: "src/shaders",
    texture: "src/assets/texture.png"
}

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
    uvAttributeLocation: null,
    wvpMatrixLocation: null,
    textureLocation: null
}

let assets = {
    electron: {
        vertices: null,
        normals: null,
        indices: null,
        textures: null,
        n_el: 1
    },
    hydrogen: {
        vertices: null,
        normals: null,
        indices: null,
        textures: null,
        n_el: 1
    },
    helium: {
        vertices: null,
        normals: null,
        indices: null,
        textures: null,
        n_el: 2
    },
    carbon: {
        vertices: null,
        normals: null,
        indices: null,
        textures: null,
        n_el: 6
    },
    oxygen: {
        vertices: null,
        normals: null,
        indices: null,
        textures: null,
        n_el: 8
    },
    texture: null
}