class Camera {
    viewInfo = {
        x: 0.0, y: 0.0, z: 2.0,
        elev: 0.0,        //rotation over the x-axis
        angle: 0.0        //rotation over the y-axis
    }

    projectionInfo = {
        a: 1.0, n: 0.1, f: 100.0, fieldOfView: 90
    }

    viewMatrix;
    projectionMatrix;

    Mode = {
        OUTSIDE: 0,
        INSIDE: 1
    }
    mode = this.Mode.OUTSIDE;

    updateViewMatrix = () => {
        this.viewMatrix = utils.MakeLookIn(this.viewInfo.x, this.viewInfo.y, this.viewInfo.z, this.viewInfo.elev, this.viewInfo.angle);
    }

    updateProjectionMatrix = () => {
        this.projectionMatrix = utils.MakePerspective(this.projectionInfo.fieldOfView, this.projectionInfo.a, this.projectionInfo.n, this.projectionInfo.f);
    }

    setAspectRatio = (a) => {
        this.projectionInfo.a = a;
        this.updateProjectionMatrix();
    }

    getWorldPosition = () => {
        return [this.viewInfo.x, this.viewInfo.y, this.viewInfo.z, 1.0];
    }

    getWorldMatrix = () => {
        return utils.MakeWorld(this.viewInfo.x, this.viewInfo.y, this.viewInfo.z, this.viewInfo.elev, this.viewInfo.angle, 0.0, 1.0);
    }

    getCordsInObjectSpace = (inverseObjectMatrix) => {
        let objectSpaceMatrix = utils.multiplyMatrices(inverseObjectMatrix, this.getWorldMatrix());
        return utils.multiplyMatrixVector(objectSpaceMatrix, [this.viewInfo.x, this.viewInfo.y, this.viewInfo.z, 1.0]);
    }

    setPosition = (cords) => {
        if (cords){
            if (cords.x !== undefined) this.viewInfo.x = cords.x;
            if (cords.y !== undefined) this.viewInfo.y = cords.y;
            if (cords.z !== undefined) this.viewInfo.z = cords.z;
            if (cords.elev !== undefined) this.viewInfo.elev = cords.elev;
            if (cords.angle !== undefined) this.viewInfo.angle = cords.angle;
            this.updateViewMatrix();
        }
    }

    setMode = (mode) => {
        if (mode === this.mode) return;
        this.mode = mode;

        if (this.mode === this.Mode.OUTSIDE) {
            camera.viewFromZ();
            objectsToRender.unshift(atom);
        } else {
            camera.setPosition({x: 0.0, y: 0.0, z: 0.0, elev: 0.0, angle: 0.0});

            let newObjs = [];
            objectsToRender.forEach((obj) => {
               if (obj.assetType !== atom.assetType) newObjs.push(obj);
            });

            objectsToRender = newObjs;
        }
    }

    viewFromX = () => {
        this.setPosition({ x: 2.0, y: 0.0, z: 0.0, elev: 0.0, angle: 90.0 });
    }

    viewFromY = () => {
        this.setPosition({ x: 0.0, y: 2.0, z: 0.0, elev: -90.0, angle: 0.0 });
    }

    viewFromZ = () => {
        this.setPosition({ x: 0.0, y: 0.0, z: 2.0, elev: 0.0, angle: 0.0 });
    }

    Magnitude = {
        FORWARD:    +1.0,
        BACKWARD:   -1.0,
        LEFT:       +1.0,
        RIGHT:      -1.0,
        ROT_UP:     +1.0,
        ROT_DOWN:   -1.0,
        ROT_LEFT:   +1.0,
        ROT_RIGHT:  -1.0,
    }

    moveInDirection = (cameraDir, magnitude) => {
        let translateVector = [magnitude*cameraDir[0]*cameraVelocity, magnitude*cameraDir[1]*cameraVelocity, magnitude*cameraDir[2]*cameraVelocity];
        let translateMatrix = utils.MakeTranslateMatrix(translateVector[0], translateVector[1], translateVector[2]);
        let newPos = utils.multiplyMatrixVector(translateMatrix, this.getWorldPosition());
        this.setPosition({x: newPos[0], y: newPos[1], z: newPos[2]});
    }

    moveBackward = () => {
        if (this.mode !== this.Mode.OUTSIDE) return;
        let cameraDir = utils.getDir(this.viewInfo.elev, this.viewInfo.angle);
        this.moveInDirection(cameraDir, this.Magnitude.BACKWARD);
    }

    moveForward = () => {
        if (this.mode !== this.Mode.OUTSIDE) return;
        let cameraDir = utils.getDir(this.viewInfo.elev, this.viewInfo.angle);
        this.moveInDirection(cameraDir, this.Magnitude.FORWARD);
    }

    moveLeft = () => {
        if (this.mode !== this.Mode.OUTSIDE) return;
        let cameraDir = utils.getDir(this.viewInfo.elev, this.viewInfo.angle);
        let leftDir = utils.multiplyMatrixVector(utils.MakeRotateYMatrix(90), [cameraDir[0], cameraDir[1], cameraDir[2], 1.0]);
        this.moveInDirection([leftDir[0], leftDir[1], leftDir[2]], this.Magnitude.LEFT);
    }

    moveRight = () => {
        if (this.mode !== this.Mode.OUTSIDE) return;
        let cameraDir = utils.getDir(this.viewInfo.elev, this.viewInfo.angle);
        let leftDir = utils.multiplyMatrixVector(utils.MakeRotateYMatrix(90), [cameraDir[0], cameraDir[1], cameraDir[2], 1.0]);
        this.moveInDirection([leftDir[0], leftDir[1], leftDir[2]], this.Magnitude.RIGHT);
    }

    rotateUp = () => {
        this.setPosition({elev: this.viewInfo.elev + this.Magnitude.ROT_UP * cameraRotationVelocity});
    }

    rotateDown = () => {
        this.setPosition({elev: this.viewInfo.elev + this.Magnitude.ROT_DOWN * cameraRotationVelocity});
    }

    rotateLeft = () => {
        this.setPosition({angle: this.viewInfo.angle + this.Magnitude.ROT_LEFT * cameraRotationVelocity});
    }

    rotateRight = () => {
        this.setPosition({angle: this.viewInfo.angle + this.Magnitude.ROT_RIGHT * cameraRotationVelocity});
    }
}