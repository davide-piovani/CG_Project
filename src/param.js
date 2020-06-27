let Diffuse = {
    NO: 0.0,
    LAMBERT: 1.0,
    OREN_NAYAR: 2.0
}

let Specular = {
    NO: 0.0,
    PHONG: 1.0,
    BLINN: 2.0
}

let Smooth = {
    VERTEX: 0.0,
    PIXEL: 1.0
}

let gl;
let isDay = 0.0;
let dayCanvasColor = 0.9;
let nightCanvasColor = 0.0;

let rootNode = new SceneNode();
let atomOrbit = new SceneNode();
let atom = new SceneNode();

let objectsToRender = [];
let nodesToAnimate = [];
let lights = [];

let camera = new Camera();
let cameraVelocity = 0.3;
let cameraRotationVelocity = 10.0;

let ambientLight = 0.25;
let directLight = [0.7, 0.7, 0.7, 1.0];
let directLightXRot = 45.0;
let directLightYRot = 225.0;
let rayCastingActive = 1.0;
let defaultSpecShine = 70.0;
let defaultSigma = 0.7;
let defaultDecay = 1.0;
let defaultG = 4.0;

let diffuseMode = Diffuse.LAMBERT;
let specularMode = Specular.BLINN;
let smoothType = Smooth.PIXEL;

let paths = {
    base: "",
    assets: "src/assets",
    shaders: {
        base: "src/shaders",
        vertex: "/vertex",
        pixel: "/pixel",
        vs: {
            atomVertex: "/vs_AtomVertex.glsl",
            atomPixel: "/vs_AtomPixel.glsl",
            electronVertex: "/vs_ElectronVertex.glsl",
            electronPixel: "/vs_ElectronPixel.glsl",
            floor: "/vs_Floor.glsl",
        },
        fs: {
            atomVertex: "/fs_AtomVertex.glsl",
            atomPixel: "/fs_AtomPixel.glsl",
            electronVertex: "/fs_ElectronVertex.glsl",
            electronPixel: "/fs_ElectronPixel.glsl",
            floor: "/fs_Floor.glsl",
        }
    },
    texture: "src/assets/texture.png"
}

let rap = 0.625;
let delta = [Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random()];

let trajectories = [
    (perc, r) => {  // 1
        perc += delta[0];
        return {x: r*Math.cos(2 * Math.PI * perc), y: 0.0, z: r*Math.sin(2 * Math.PI * perc)};
    },

    (perc, r) => {  // 2
        perc += delta[1];
        return {x: r*Math.cos(2 * Math.PI * perc), y: r*Math.sin(2 * Math.PI * perc), z: 0.0};
    },

    (perc, r) => {  // 3
        perc += delta[2];
        return {x: r*Math.cos(2 * Math.PI * perc), y: 0.5*r*Math.sin(2 * Math.PI * perc), z: 0.5*r*Math.sin(2 * Math.PI * perc)};
    },

    (perc, r) => {  // 4
        perc += delta[3];
        return {x: r*Math.cos(2 * Math.PI * perc), y: -0.5*r*Math.sin(2 * Math.PI * perc), z: 0.5*r*Math.sin(2 * Math.PI * perc)};
    },

    (perc, r) => {  // 5
        perc += delta[4];
        let a = r, b = r*rap;
        return {x: a*Math.cos(2 * Math.PI * perc) - a/4.0, y: b*Math.sin(2 * Math.PI * perc), z: 0.0};
    },

    (perc, r) => {  // 6
        perc += delta[5];
        let a = r, b = r*rap;
        return {x: a*Math.cos(2 * Math.PI * perc) + a/4.0, y: 0.0, z: b*Math.sin(2 * Math.PI * perc)};
    },

    (perc, r) => {  // 7
        perc += delta[6];
        let a = r, b = r*rap;
        return {x: 0.0, y: b*Math.sin(2 * Math.PI * perc), z: a*Math.cos(2 * Math.PI * perc) - a/4.0};
    },

    (perc, r) => {  // 8
        perc += delta[7];
        let a = r, b = r*rap;
        return {x: b*Math.sin(2 * Math.PI * perc), y: 0.0, z: a*Math.cos(2 * Math.PI * perc) + a/4.0};
    },
]