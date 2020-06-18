function eraseCanvas() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function resizeCanvas() {
    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    camera.setAspectRatio(gl.canvas.width/gl.canvas.height);
}

function setUpCanvas() {
    let canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {document.write("GL context not opened"); return; }

    resizeCanvas();
    eraseCanvas();
    gl.enable(gl.DEPTH_TEST);
}

function initializePaths() {
    let path = window.location.pathname;
    let page = path.split("/").pop();

    paths.base = window.location.href.replace(page, '');
    paths.assets = paths.base + paths.assets;
    paths.texture = paths.base + paths.texture;

    paths.shaders.base = paths.base + paths.shaders.base;

    paths.shaders.vs = {
        atomVertex: paths.shaders.base + paths.shaders.vs.atomVertex,
        atomPixel: paths.shaders.base + paths.shaders.vs.atomPixel,
        electron: paths.shaders.base + paths.shaders.vs.electron,
        floor: paths.shaders.base + paths.shaders.vs.floor,
    }

    paths.shaders.fs = {
        atomVertex: paths.shaders.base + paths.shaders.fs.atomVertex,
        atomPixel: paths.shaders.base + paths.shaders.fs.atomPixel,
        electron: paths.shaders.base + paths.shaders.fs.electron,
        floor: paths.shaders.base + paths.shaders.fs.floor,
    }
}

async function loadProgram(vs_path, fs_path) {
    await utils.loadFiles([vs_path, fs_path], function (shaderText) {
        let vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        let fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
        program = utils.createProgram(gl, vertexShader, fragmentShader);
    });
    return program;
}

async function loadPrograms() {
    assetsData[AssetType.ELECTRON].drawInfo.program.push(await loadProgram(paths.shaders.vs.electron, paths.shaders.fs.electron));

    let atomVertexProgram = await loadProgram(paths.shaders.vs.atomVertex, paths.shaders.fs.atomVertex);
    let atomPixelProgram = await loadProgram(paths.shaders.vs.atomPixel, paths.shaders.fs.atomPixel);

    assetsData[AssetType.HYDROGEN].drawInfo.program.push(atomVertexProgram, atomPixelProgram);
    assetsData[AssetType.HELIUM].drawInfo.program.push(atomVertexProgram, atomPixelProgram);
    assetsData[AssetType.CARBON].drawInfo.program.push(atomVertexProgram, atomPixelProgram);
    assetsData[AssetType.OXYGEN].drawInfo.program.push(atomVertexProgram, atomPixelProgram);

    assetsData[AssetType.FLOOR].drawInfo.program.push(await loadProgram(paths.shaders.vs.floor, paths.shaders.fs.floor));
}

async function getStruct(path) {
    let objStr = await utils.get_objstr(path);
    let objModel = new OBJ.Mesh(objStr);

    return {
        vertices: objModel.vertices,
        normals: objModel.vertexNormals,
        indices: objModel.indices,
        textures: objModel.textures
    }
}

async function loadAssetsStruct() {
    let electronPath = paths.assets + "/E/electron.obj";
    let carbonPath = paths.assets + "/C/nucleusC.obj";
    let hydrogenPath = paths.assets + "/H/nucleusH.obj";
    let heliumPath = paths.assets + "/He/nucleusHe.obj";
    let oxygenPath = paths.assets + "/O/nucleusO.obj";

    assetsData[AssetType.ELECTRON].structInfo = await getStruct(electronPath);
    assetsData[AssetType.HYDROGEN].structInfo = await getStruct(hydrogenPath);
    assetsData[AssetType.HELIUM].structInfo = await getStruct(heliumPath);
    assetsData[AssetType.CARBON].structInfo = await getStruct(carbonPath);
    assetsData[AssetType.OXYGEN].structInfo = await getStruct(oxygenPath);
}

function loadTexture() {
    let texture = gl.createTexture();
    assetsData[AssetType.TEXTURE].texture = texture;
    gl.bindTexture(gl.TEXTURE_2D, texture);

    let image = new Image();
    image.src = paths.texture;
    image.onload= function() {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
    };
    gl.activeTexture(gl.TEXTURE0);
}


function loadAttribAndUniformsLocationsForAsset(assetType) {
    if (!assetsData[assetType].hasOwnProperty("drawInfo")) return;
    let programs = assetsData[assetType].drawInfo.program;
    let locations = assetsData[assetType].drawInfo.locations;

    for(let program of programs) {
        // Asset params
        if (locations.hasOwnProperty("positionAttributeLocation")) assetsData[assetType].drawInfo.locations.positionAttributeLocation.push(gl.getAttribLocation(program, "a_position"));
        if (locations.hasOwnProperty("normalsAttributeLocation")) assetsData[assetType].drawInfo.locations.normalsAttributeLocation.push(gl.getAttribLocation(program, "a_normal"));
        if (locations.hasOwnProperty("uvAttributeLocation")) assetsData[assetType].drawInfo.locations.uvAttributeLocation.push(gl.getAttribLocation(program, "a_uv"));
        if (locations.hasOwnProperty("wvpMatrixLocation")) assetsData[assetType].drawInfo.locations.wvpMatrixLocation.push(gl.getUniformLocation(program, "wvpMatrix"));

        // Object params
        if (locations.hasOwnProperty("textureLocation")) assetsData[assetType].drawInfo.locations.textureLocation.push(gl.getUniformLocation(program, "u_texture"));
        if (locations.hasOwnProperty("ambientColorLocation")) assetsData[assetType].drawInfo.locations.ambientColorLocation.push(gl.getUniformLocation(program, "ambientColor"));
        if (locations.hasOwnProperty("emissionColorLocation")) assetsData[assetType].drawInfo.locations.emissionColorLocation.push(gl.getUniformLocation(program, "emitColor"));

        // Lights params
        if (locations.hasOwnProperty("ambientLightLocation")) assetsData[assetType].drawInfo.locations.ambientLightLocation.push(gl.getUniformLocation(program, "ambientLight"));
        if (locations.hasOwnProperty("lightTargetLocation")) assetsData[assetType].drawInfo.locations.lightTargetLocation.push(gl.getUniformLocation(program, "light_g"));
        if (locations.hasOwnProperty("lightDecayLocation")) assetsData[assetType].drawInfo.locations.lightDecayLocation.push(gl.getUniformLocation(program, "light_decay"));
        if (locations.hasOwnProperty("lightColorLocation")) assetsData[assetType].drawInfo.locations.lightColorLocation.push(gl.getUniformLocation(program, "light_color"));
        if (locations.hasOwnProperty("lightPositionLocation")) assetsData[assetType].drawInfo.locations.lightPositionLocation.push(gl.getUniformLocation(program, "light_pos"));

        // Raycasting params
        if (locations.hasOwnProperty("electronRadiusLocation")) assetsData[assetType].drawInfo.locations.electronRadiusLocation.push(gl.getUniformLocation(program, "electronRadius_squared"));
        if (locations.hasOwnProperty("rayCastingLocation")) assetsData[assetType].drawInfo.locations.rayCastingLocation.push(gl.getUniformLocation(program, "rayCasting"));

        // BRDF
        if (locations.hasOwnProperty("diffuseModeLocation")) assetsData[assetType].drawInfo.locations.diffuseModeLocation.push(gl.getUniformLocation(program, "diffuseMode"));
        if (locations.hasOwnProperty("specularModeLocation")) assetsData[assetType].drawInfo.locations.specularModeLocation.push(gl.getUniformLocation(program, "specularMode"));
        if (locations.hasOwnProperty("specShineLocation")) assetsData[assetType].drawInfo.locations.specShineLocation.push(gl.getUniformLocation(program, "SpecShine"));
        if (locations.hasOwnProperty("sigmaLocation")) assetsData[assetType].drawInfo.locations.sigmaLocation.push(gl.getUniformLocation(program, "sigma_squared"));
        if (locations.hasOwnProperty("eyePosLocation")) assetsData[assetType].drawInfo.locations.eyePosLocation.push(gl.getUniformLocation(program, "eyePos"));
    }
}

function loadAttribAndUniformsLocations() {
    let types = [AssetType.ELECTRON, AssetType.HYDROGEN, AssetType.HELIUM, AssetType.CARBON, AssetType.OXYGEN, AssetType.FLOOR];

    for (let assetType of types){
        loadAttribAndUniformsLocationsForAsset(assetType);
    }
}

function loadArrayBuffer(data, location, size) {
    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
}

function loadIndexBuffer(data) {
    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
}

function loadVao(assetType, i) {
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let asset = assetsData[assetType];
    let structInfo = asset.structInfo;
    let locations = asset.drawInfo.locations;
    
    if (!i) i = 0;

    loadArrayBuffer(new Float32Array(structInfo.vertices), locations.positionAttributeLocation[i], 3);
    if (locations.hasOwnProperty("normalsAttributeLocation")) loadArrayBuffer(new Float32Array(structInfo.normals), locations.normalsAttributeLocation[i], 3);
    if (locations.hasOwnProperty("uvAttributeLocation")) loadArrayBuffer(new Float32Array(structInfo.textures), locations.uvAttributeLocation[i], 2);
    loadIndexBuffer(new Uint16Array(structInfo.indices));

    assetsData[assetType].drawInfo.bufferLength = assetsData[assetType].structInfo.indices.length;
    assetsData[assetType].drawInfo.vao.push(vao);
}

function loadVaos() {
    loadVao(AssetType.ELECTRON);
    
    loadVao(AssetType.HYDROGEN, Smooth.VERTEX);
    loadVao(AssetType.HELIUM, Smooth.VERTEX);
    loadVao(AssetType.CARBON, Smooth.VERTEX);
    loadVao(AssetType.OXYGEN, Smooth.VERTEX);

    loadVao(AssetType.HYDROGEN, Smooth.PIXEL);
    loadVao(AssetType.HELIUM, Smooth.PIXEL);
    loadVao(AssetType.CARBON, Smooth.PIXEL);
    loadVao(AssetType.OXYGEN, Smooth.PIXEL);
    
    loadVao(AssetType.FLOOR);
}

function initElectronRadiusSquared() {
    let rad_world = assetsData[AssetType.ELECTRON].other.asset_radius * assetsData[AssetType.ELECTRON].defaultCords.s;
    let rad_object = rad_world / assetsData[AssetType.HYDROGEN].defaultCords.s;
    assetsData[AssetType.ELECTRON].other.asset_radius = rad_object*rad_object;
}