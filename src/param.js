let gl;
let program;
let vao;

let a;
let n = 0.1;
let f = 100.0;

let w = 3;              //only if we use parallel projection
let fieldOfView = 90;   //only if we use perspective projection

let electron_velocity = 0.3;

let sceneObjects = [];
let camera = new Camera();

let paths = {
    base: "",
    assets: "src/assets",
    shaders: "src/shaders",
    texture: "src/assets/texture.png"
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

let r = 5.0;

let color = 2.0;

let assets = [
    {
        type: AssetType.TEXTURE,
        texture: null
    },
    {
        type: AssetType.ELECTRON,
        assetInfo: {
            vertices: null,
            normals: null,
            indices: null,
            textures: null,
        },
        geometry: {
            s: 0.5
        }
    },
    {
        type: AssetType.HYDROGEN,
        assetInfo: {
            vertices: null,
            normals: null,
            indices: null,
            textures: null,
        },
        geometry: {
            x: 0.0,
            y: 0.0,
            s: 0.2,
        },
        n_el: 1,
        orbit: [r]
    },
    {
        type: AssetType.HELIUM,
        assetInfo: {
            vertices: null,
            normals: null,
            indices: null,
            textures: null,
        },
        geometry: {
            x: 0.0,
            y: 0.0,
            s: 0.2,
        },
        n_el: 2,
        orbit: [r, r]
    },
    {
        type: AssetType.CARBON,
        assetInfo: {
            vertices: null,
            normals: null,
            indices: null,
            textures: null,
        },
        geometry: {
            x: 0.1,
            y: -0.17,
            s: 0.2,
        },
        n_el: 6,
        orbit: [r, r, 2.0*r, 2.0*r, {a: 2.4*r, b: 3.2*r}, {a: 2.4*r, b: 3.2*r}]
    },
    {
        type: AssetType.OXYGEN,
        assetInfo: {
            vertices: null,
            normals: null,
            indices: null,
            textures: null,
        },
        geometry: {
            x: 0.1,
            y: -0.17,
            s: 0.2,
        },
        n_el: 8,
        orbit: [r, r, 2.0*r, 2.0*r, {a: 2.4*r, b: 3.2*r}, {a: 2.4*r, b: 3.2*r}, {a: 2.4*r, b: 3.2*r}, {a: 2.4*r, b: 3.2*r}]
    },
    {
        type: AssetType.FLOOR,
        assetInfo: {
            vertices: [-0.1, 0, -0.1, -0.1, 0, +0.1, +0.1, 0, -0.1, +0.1, 0, +0.1],
            normals: null,
            indices: [0, 1, 2, 1, 2, 3],
            textures: [0, color, 0, color, 0, color, 0, color],
        },
        geometry: {
            y: -10,
            s: 500,
        },
    }
]

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