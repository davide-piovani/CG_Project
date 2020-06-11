let AssetType = {
    TEXTURE: 0,
    ELECTRON: 1,
    HYDROGEN: 2,
    HELIUM: 3,
    CARBON: 4,
    OXYGEN: 5,
    FLOOR: 6
}

let r = 1.0;
let color = 2.0;

let assetsData = [
    {
        type: AssetType.TEXTURE,
        texture: null
    },


    {
        type: AssetType.ELECTRON,
        defaultCords: {
            s: 0.15
        },
        structInfo: {
            vertices: null,
            normals: null,
            indices: null,
            textures: null,
        },
        drawInfo: {
            program: null,
            bufferLength: 0,
            vao: null,
            locations: {
                positionAttributeLocation: null,
                uvAttributeLocation: null,
                wvpMatrixLocation: null,
                textureLocation: null
            }
        }
    },


    {
        type: AssetType.HYDROGEN,
        defaultCords: {
            s: 0.2,
        },
        structInfo: {
            vertices: null,
            normals: null,
            indices: null,
            textures: null,
        },
        drawInfo: {
            program: null,
            bufferLength: 0,
            vao: null,
            locations: {
                positionAttributeLocation: null,
                uvAttributeLocation: null,
                wvpMatrixLocation: null,
                textureLocation: null
            }
        },
        other: {
            n_el: 1,
            orbit: [r]
        }
    },


    {
        type: AssetType.HELIUM,
        defaultCords: {
            s: 0.2
        },
        structInfo: {
            vertices: null,
            normals: null,
            indices: null,
            textures: null,
        },
        drawInfo: {
            program: null,
            bufferLength: 0,
            vao: null,
            locations: {
                positionAttributeLocation: null,
                uvAttributeLocation: null,
                wvpMatrixLocation: null,
                textureLocation: null
            }
        },
        other: {
            n_el: 2,
            orbit: [r, r]
        }
    },


    {
        type: AssetType.CARBON,
        defaultCords: {
            x: 0.1,
            y: -0.17,
            s: 0.2
        },
        structInfo: {
            vertices: null,
            normals: null,
            indices: null,
            textures: null,
        },
        drawInfo: {
            program: null,
            bufferLength: 0,
            vao: null,
            locations: {
                positionAttributeLocation: null,
                uvAttributeLocation: null,
                wvpMatrixLocation: null,
                textureLocation: null
            }
        },
        other: {
            n_el: 6,
            orbit: [r, r, 2.0*r, 2.0*r, {a: 2.4*r, b: 3.2*r}, {a: 2.4*r, b: 3.2*r}]
        }
    },


    {
        type: AssetType.OXYGEN,
        defaultCords: {
            x: 0.1,
            y: -0.17,
            s: 0.2,
        },
        structInfo: {
            vertices: null,
            normals: null,
            indices: null,
            textures: null,
        },
        drawInfo: {
            program: null,
            bufferLength: 0,
            vao: null,
            locations: {
                positionAttributeLocation: null,
                uvAttributeLocation: null,
                wvpMatrixLocation: null,
                textureLocation: null
            }
        },
        other: {
            n_el: 8,
            orbit: [r, r, 2.0*r, 2.0*r, {a: 2.4*r, b: 3.2*r}, {a: 2.4*r, b: 3.2*r}, {a: 2.4*r, b: 3.2*r}, {a: 2.4*r, b: 3.2*r}]
        }
    },


    {
        type: AssetType.FLOOR,
        defaultCords: {
            y: -10,
            s: 500,
        },
        structInfo: {
            vertices: [-0.1, 0, -0.1, -0.1, 0, +0.1, +0.1, 0, -0.1, +0.1, 0, +0.1],
            normals: null,
            indices: [0, 1, 2, 1, 2, 3],
            textures: [0, color, 0, color, 0, color, 0, color],
        },
        drawInfo: {
            program: null,
            bufferLength: 0,
            vao: null,
            locations: {
                positionAttributeLocation: null,
                uvAttributeLocation: null,
                wvpMatrixLocation: null,
                textureLocation: null
            }
        }
    }
]