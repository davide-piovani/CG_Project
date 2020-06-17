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
        atom: paths.shaders.base + paths.shaders.vs.atom,
        electron: paths.shaders.base + paths.shaders.vs.electron,
        floor: paths.shaders.base + paths.shaders.vs.floor,
        cube: paths.shaders.base + paths.shaders.vs.cube
    }

    paths.shaders.fs = {
        atom: paths.shaders.base + paths.shaders.fs.atom,
        electron: paths.shaders.base + paths.shaders.fs.electron,
        floor: paths.shaders.base + paths.shaders.fs.floor,
        cube: paths.shaders.base + paths.shaders.fs.cube
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
    assetsData[AssetType.ELECTRON].drawInfo.program = await loadProgram(paths.shaders.vs.electron, paths.shaders.fs.electron);
    let atomProgram = await loadProgram(paths.shaders.vs.atom, paths.shaders.fs.atom);
    assetsData[AssetType.HYDROGEN].drawInfo.program = atomProgram;
    assetsData[AssetType.HELIUM].drawInfo.program = atomProgram;
    assetsData[AssetType.CARBON].drawInfo.program = atomProgram;
    assetsData[AssetType.OXYGEN].drawInfo.program = atomProgram;
    assetsData[AssetType.FLOOR].drawInfo.program = await loadProgram(paths.shaders.vs.floor, paths.shaders.fs.floor);
    assetsData[AssetType.CUBE].drawInfo.program = await loadProgram(paths.shaders.vs.cube, paths.shaders.fs.cube);
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
    let program = assetsData[assetType].drawInfo.program;
    let locations = assetsData[assetType].drawInfo.locations;

    if (locations.hasOwnProperty("positionAttributeLocation")) assetsData[assetType].drawInfo.locations.positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    if (locations.hasOwnProperty("normalsAttributeLocation")) assetsData[assetType].drawInfo.locations.normalsAttributeLocation = gl.getAttribLocation(program, "a_normal");
    if (locations.hasOwnProperty("uvAttributeLocation")) assetsData[assetType].drawInfo.locations.uvAttributeLocation = gl.getAttribLocation(program, "a_uv");
    if (locations.hasOwnProperty("wvpMatrixLocation")) assetsData[assetType].drawInfo.locations.wvpMatrixLocation = gl.getUniformLocation(program, "wvpMatrix");
    if (locations.hasOwnProperty("normalMatrixLocation")) assetsData[assetType].drawInfo.locations.normalMatrixLocation = gl.getUniformLocation(program, "normalMatrix");
    if (locations.hasOwnProperty("textureLocation")) assetsData[assetType].drawInfo.locations.textureLocation = gl.getUniformLocation(program, "u_texture");
    if (locations.hasOwnProperty("lightColorLocation")) assetsData[assetType].drawInfo.locations.lightColorLocation = gl.getUniformLocation(program, "light_color");
    if (locations.hasOwnProperty("lightPositionLocation")) assetsData[assetType].drawInfo.locations.lightPositionLocation = gl.getUniformLocation(program, "light_pos");
    if (locations.hasOwnProperty("lightTargetLocation")) assetsData[assetType].drawInfo.locations.lightTargetLocation = gl.getUniformLocation(program, "light_g");
    if (locations.hasOwnProperty("lightDecayLocation")) assetsData[assetType].drawInfo.locations.lightDecayLocation = gl.getUniformLocation(program, "light_decay");
    if (locations.hasOwnProperty("ambientColorLocation")) assetsData[assetType].drawInfo.locations.ambientColorLocation = gl.getUniformLocation(program, "ambientColor");
    if (locations.hasOwnProperty("ambientLightLocation")) assetsData[assetType].drawInfo.locations.ambientLightLocation = gl.getUniformLocation(program, "ambientLight");
    if (locations.hasOwnProperty("difColorLocation")) assetsData[assetType].drawInfo.locations.difColorLocation = gl.getUniformLocation(program, "difColor");
    if (locations.hasOwnProperty("emissionColorLocation")) assetsData[assetType].drawInfo.locations.emissionColorLocation = gl.getUniformLocation(program, "emitColor");
    if (locations.hasOwnProperty("electronRadiusLocation")) assetsData[assetType].drawInfo.locations.electronRadiusLocation = gl.getUniformLocation(program, "electronRadius");
    if (locations.hasOwnProperty("eyePosLocation")) assetsData[assetType].drawInfo.locations.eyePosLocation = gl.getUniformLocation(program, "eyePos");
    if (locations.hasOwnProperty("specShineLocation")) assetsData[assetType].drawInfo.locations.specShineLocation = gl.getUniformLocation(program, "SpecShine");

}

function loadAttribAndUniformsLocations() {
    let types = [AssetType.ELECTRON, AssetType.HYDROGEN, AssetType.HELIUM, AssetType.CARBON, AssetType.OXYGEN, AssetType.FLOOR, AssetType.CUBE];

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

function loadVao(assetType) {
    let vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    let asset = assetsData[assetType];
    let structInfo = asset.structInfo;
    let locations = asset.drawInfo.locations;

    loadArrayBuffer(new Float32Array(structInfo.vertices), locations.positionAttributeLocation, 3);
    if (locations.hasOwnProperty("normalsAttributeLocation")) loadArrayBuffer(new Float32Array(structInfo.normals), locations.normalsAttributeLocation, 3);
    if (locations.hasOwnProperty("uvAttributeLocation")) loadArrayBuffer(new Float32Array(structInfo.textures), locations.uvAttributeLocation, 2);
    loadIndexBuffer(new Uint16Array(structInfo.indices));

    assetsData[assetType].drawInfo.bufferLength = assetsData[assetType].structInfo.indices.length;
    assetsData[assetType].drawInfo.vao = vao;
}

function loadVaos() {
    loadVao(AssetType.ELECTRON);
    loadVao(AssetType.HYDROGEN);
    loadVao(AssetType.HELIUM);
    loadVao(AssetType.CARBON);
    loadVao(AssetType.OXYGEN);
    loadVao(AssetType.FLOOR);
    loadVao(AssetType.CUBE);
}