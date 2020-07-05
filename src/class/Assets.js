let AssetType = {
    TEXTURE: 0,
    ELECTRON: 1,
    HYDROGEN: 2,
    HELIUM: 3,
    CARBON: 4,
    OXYGEN: 5,
    FLOOR: 6
}

let orbit_rad = {
    H: 1.0,
    He: 1.2,
    C: 1.5,
    O: 1.8,
    max_ax: 3.2
}

let assetsData = [
    {
        type: AssetType.TEXTURE,
        texture: null
    },

    {
        type: AssetType.ELECTRON,
        defaultCords: {
            s: 0.08
        },
        structInfo: {
            vertices: null,
            normals: null,
            indices: null,
        },
        drawInfo: {
            program: [],
            bufferLength: 0,
            vao: [],
            ambientColor: [0.97, 0.89, 0.05, 1.0],
            emissionColor: [0.97, 0.89, 0.05, 1.0],
            specShine: defaultSpecShine,
            sigma: defaultSigma,

            lightInfo: {
                color: [0.9, 0.9, 0.9, 1.0],
                g: defaultG,
                decay: defaultDecay
            },

            locations: {
                // Asset params
                positionAttributeLocation: [],
                normalsAttributeLocation: [],
                wvpMatrixLocation: [],

                // Object params
                ambientColorLocation: [],
                emissionColorLocation: [],

                // Lights params
                isDayLocation: [],
                directLightDirectionLocation: [],
                directLightColorLocation: [],
                ambientLightLocation: [],

                // BRDF
                diffuseModeLocation: [],
                specularModeLocation: [],
                specShineLocation: [],
                sigmaLocation: [],
                eyePosLocation: []
            }
        },
        other: {
            electron_velocity: 0.2,
            asset_radius: 2.5
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
            program: [],
            bufferLength: 0,
            vao: [],
            specShine: defaultSpecShine,
            sigma: defaultSigma,

            locations: {
                // Asset params
                positionAttributeLocation: [],
                normalsAttributeLocation: [],
                uvAttributeLocation: [],
                wvpMatrixLocation: [],

                // Object params
                textureLocation: [],

                // Lights params
                isDayLocation: [],
                directLightDirectionLocation: [],
                directLightColorLocation: [],
                ambientLightLocation: [],
                lightTargetLocation: [],
                lightDecayLocation: [],
                lightColorLocation: [],
                lightPositionLocation: [],

                // Raycasting params
                electronRadiusLocation: [],
                rayCastingLocation: [],

                // BRDF
                diffuseModeLocation: [],
                specularModeLocation: [],
                specShineLocation: [],
                sigmaLocation: [],
                eyePosLocation: []
            }
        },
        other: {
            n_el: 1,
            orbit: [orbit_rad.H]
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
            program: [],
            bufferLength: 0,
            vao: [],
            specShine: defaultSpecShine,
            sigma: defaultSigma,

            locations: {
                // Asset params
                positionAttributeLocation: [],
                normalsAttributeLocation: [],
                uvAttributeLocation: [],
                wvpMatrixLocation: [],

                // Object params
                textureLocation: [],

                // Lights params
                isDayLocation: [],
                directLightDirectionLocation: [],
                directLightColorLocation: [],
                ambientLightLocation: [],
                lightTargetLocation: [],
                lightDecayLocation: [],
                lightColorLocation: [],
                lightPositionLocation: [],

                // Raycasting params
                electronRadiusLocation: [],
                rayCastingLocation: [],

                // BRDF
                diffuseModeLocation: [],
                specularModeLocation: [],
                specShineLocation: [],
                sigmaLocation: [],
                eyePosLocation: []
            }
        },
        other: {
            n_el: 2,
            orbit: [orbit_rad.He, orbit_rad.He]
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
            program: [],
            bufferLength: 0,
            vao: [],
            specShine: defaultSpecShine,
            sigma: defaultSigma,

            locations: {
                // Asset params
                positionAttributeLocation: [],
                normalsAttributeLocation: [],
                uvAttributeLocation: [],
                wvpMatrixLocation: [],

                // Object params
                textureLocation: [],

                // Lights params
                isDayLocation: [],
                directLightDirectionLocation: [],
                directLightColorLocation: [],
                ambientLightLocation: [],
                lightTargetLocation: [],
                lightDecayLocation: [],
                lightColorLocation: [],
                lightPositionLocation: [],

                // Raycasting params
                electronRadiusLocation: [],
                rayCastingLocation: [],

                // BRDF
                diffuseModeLocation: [],
                specularModeLocation: [],
                specShineLocation: [],
                sigmaLocation: [],
                eyePosLocation: []
            }
        },
        other: {
            n_el: 6,
            orbit: [orbit_rad.C, orbit_rad.C, 2.0*orbit_rad.C, 2.0*orbit_rad.C, orbit_rad.max_ax*orbit_rad.C, orbit_rad.max_ax*orbit_rad.C]
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
            program: [],
            bufferLength: 0,
            vao: [],
            specShine: defaultSpecShine,
            sigma: defaultSigma,

            locations: {
                // Asset params
                positionAttributeLocation: [],
                normalsAttributeLocation: [],
                uvAttributeLocation: [],
                wvpMatrixLocation: [],

                // Object params
                textureLocation: [],

                // Lights params
                isDayLocation: [],
                directLightDirectionLocation: [],
                directLightColorLocation: [],
                ambientLightLocation: [],
                lightTargetLocation: [],
                lightDecayLocation: [],
                lightColorLocation: [],
                lightPositionLocation: [],

                // Raycasting params
                electronRadiusLocation: [],
                rayCastingLocation: [],

                // BRDF
                diffuseModeLocation: [],
                specularModeLocation: [],
                specShineLocation: [],
                sigmaLocation: [],
                eyePosLocation: []
            }
        },
        other: {
            n_el: 8,
            orbit: [orbit_rad.O, orbit_rad.O, 2.0*orbit_rad.O, 2.0*orbit_rad.O, orbit_rad.max_ax*orbit_rad.O, orbit_rad.max_ax*orbit_rad.O, orbit_rad.max_ax*orbit_rad.O, orbit_rad.max_ax*orbit_rad.O]
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
            program: [],
            bufferLength: 0,
            vao: [],
            dayColor: [0.0, 0.18, 0.79, 1.0],
            nightColor: [0.0, 0.09, 0.37, 1.0],
            ambientColor: [0.0, 0.12, 0.5, 1.0],
            locations: {
                positionAttributeLocation: [],
                wvpMatrixLocation: [],
                ambientColorLocation: [],
            },
        }
    }
]
