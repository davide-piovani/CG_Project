let gl;
let rootNode = new SceneNode();
let atomOrbit = new SceneNode();

let a;
let n = 0.1;
let f = 100.0;

let w = 3;              //only if we use parallel projection
let fieldOfView = 90;   //only if we use perspective projection

let electron_velocity = 0.3;

let objectsToRender = [];
let camera = new Camera();

let paths = {
    base: "",
    assets: "src/assets",
    shaders: {
        base: "src/shaders",
        vs: {
            atom: "/vs_Atom.glsl",
            electron: "/vs_Electron.glsl",
            floor: "/vs_Floor.glsl"
        },
        fs: {
            atom: "/fs_Atom.glsl",
            electron: "/fs_Electron.glsl",
            floor: "/fs_Floor.glsl"
        }
    },
    texture: "src/assets/texture.png"
}

let projectionMatrix = null;

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