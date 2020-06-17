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

let assetsData = [
    {
        type: AssetType.TEXTURE,
        texture: null
    },

    {
        type: AssetType.ELECTRON,
        defaultCords: {
            s: 0.25
        },
        structInfo: {
            vertices: null,
            normals: null,
            indices: null,
        },
        drawInfo: {
            program: null,
            bufferLength: 0,
            vao: null,
            ambientColor: [0.97, 0.89, 0.05, 1.0],
            emissionColor: [0.97, 0.89, 0.05, 1.0],

            lightInfo: {
                color: [0.9, 0.9, 0.9, 1.0],
                g: 3.0,
                decay: 2.0
            },

            locations: {
                // Asset params
                positionAttributeLocation: null,
                normalsAttributeLocation: null,
                wvpMatrixLocation: null,

                // Object params
                ambientColorLocation: null,
                emissionColorLocation: null,

                // Lights params
                ambientLightLocation: null,
            }
        },
        other: {
            electron_velocity: 0.2,
            asset_radius: 0.4
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
            specShine: defaultSpecShine,
            sigma: defaultSigma,

            locations: {
                // Asset params
                positionAttributeLocation: null,
                normalsAttributeLocation: null,
                uvAttributeLocation: null,
                wvpMatrixLocation: null,

                // Object params
                textureLocation: null,

                // Lights params
                ambientLightLocation: null,
                lightTargetLocation: null,
                lightDecayLocation: null,
                lightColorLocation: null,
                lightPositionLocation: null,

                // Raycasting params
                electronRadiusLocation: null,
                rayCastingLocation: null,

                // BRDF
                diffuseModeLocation: null,
                specularModeLocation: null,
                specShineLocation: null,
                sigmaLocation: null,
                eyePosLocation: null
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
            specShine: defaultSpecShine,
            sigma: defaultSigma,

            locations: {
                // Asset params
                positionAttributeLocation: null,
                normalsAttributeLocation: null,
                uvAttributeLocation: null,
                wvpMatrixLocation: null,

                // Object params
                textureLocation: null,

                // Lights params
                ambientLightLocation: null,
                lightTargetLocation: null,
                lightDecayLocation: null,
                lightColorLocation: null,
                lightPositionLocation: null,

                // Raycasting params
                electronRadiusLocation: null,
                rayCastingLocation: null,

                // BRDF
                diffuseModeLocation: null,
                specularModeLocation: null,
                specShineLocation: null,
                sigmaLocation: null,
                eyePosLocation: null
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
            specShine: defaultSpecShine,
            sigma: defaultSigma,

            locations: {
                // Asset params
                positionAttributeLocation: null,
                normalsAttributeLocation: null,
                uvAttributeLocation: null,
                wvpMatrixLocation: null,

                // Object params
                textureLocation: null,

                // Lights params
                ambientLightLocation: null,
                lightTargetLocation: null,
                lightDecayLocation: null,
                lightColorLocation: null,
                lightPositionLocation: null,

                // Raycasting params
                electronRadiusLocation: null,
                rayCastingLocation: null,

                // BRDF
                diffuseModeLocation: null,
                specularModeLocation: null,
                specShineLocation: null,
                sigmaLocation: null,
                eyePosLocation: null
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
            specShine: defaultSpecShine,
            sigma: defaultSigma,

            locations: {
                // Asset params
                positionAttributeLocation: null,
                normalsAttributeLocation: null,
                uvAttributeLocation: null,
                wvpMatrixLocation: null,

                // Object params
                textureLocation: null,

                // Lights params
                ambientLightLocation: null,
                lightTargetLocation: null,
                lightDecayLocation: null,
                lightColorLocation: null,
                lightPositionLocation: null,

                // Raycasting params
                electronRadiusLocation: null,
                rayCastingLocation: null,

                // BRDF
                diffuseModeLocation: null,
                specularModeLocation: null,
                specShineLocation: null,
                sigmaLocation: null,
                eyePosLocation: null
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
        },
        drawInfo: {
            program: null,
            bufferLength: 0,
            vao: null,
            ambientColor: [0.0, 0.12, 0.5, 1.0],
            locations: {
                positionAttributeLocation: null,
                wvpMatrixLocation: null,
                ambientColorLocation: null,
            },
        }
    }
]