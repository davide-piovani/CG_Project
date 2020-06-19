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
let cameraVelocity = 0.1;
let cameraRotationVelocity = 10.0;

let ambientLight = 0.25;
let directLight = [0.7, 0.7, 0.7, 1.0];
let directLightXRot = 45.0;
let directLightYRot = 225.0;
let rayCastingActive = 1.0;
let defaultSpecShine = 70.0;
let defaultSigma = 0.7;

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

let trajectories = [
    (perc, r) => {  // 1
        return {x: r*Math.cos(2 * Math.PI * perc), y: 0.0, z: r*Math.sin(2 * Math.PI * perc)};
    },

    (perc, r) => {  // 2
        perc += 0.1;
        return {x: r*Math.cos(2 * Math.PI * perc), y: r*Math.sin(2 * Math.PI * perc), z: 0.0};
    },

    (perc, r) => {  // 3
        return {x: r*Math.cos(2 * Math.PI * perc), y: 0.5*r*Math.sin(2 * Math.PI * perc), z: 0.5*r*Math.sin(2 * Math.PI * perc)};
    },

    (perc, r) => {  // 4
        perc += 0.1;
        return {x: r*Math.cos(2 * Math.PI * perc), y: -0.5*r*Math.sin(2 * Math.PI * perc), z: 0.5*r*Math.sin(2 * Math.PI * perc)};
    },

    (perc, r) => {  // 5
        let c = Math.sqrt(r.b^2 - r.a^2);

        return {x: r.a*Math.cos(2 * Math.PI * perc) - c, y: r.b*Math.sin(2 * Math.PI * perc), z: 0.0};
    },

    (perc, r) => {  // 6
        let c = Math.sqrt(r.b^2 - r.a^2);

        return {x: r.a*Math.cos(2 * Math.PI * perc) + c, y: 0.0, z: r.b*Math.sin(2 * Math.PI * perc)};
    },

    (perc, r) => {  // 7
        let c = Math.sqrt(r.b^2 - r.a^2);

        return { x: 0.0, y: r.b*Math.sin(2 * Math.PI * perc), z: r.a*Math.cos(2 * Math.PI * perc) - c};
    },

    (perc, r) => {  // 8
        let c = Math.sqrt(r.b^2 - r.a^2);
        perc += 0.1;

        return {x: r.b*Math.sin(2 * Math.PI * perc), y: 0.0, z: r.a*Math.cos(2 * Math.PI * perc) + c};
    },
]