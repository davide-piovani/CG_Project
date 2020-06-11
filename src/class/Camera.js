class Camera {
    x = 0.0; y = 0.0; z = 2.0;
    elev = 0.0;         //rotation over the x-axis
    angle = 0.0;        //rotation over the y-axis
    mode = 2;           //0: viewFromX, 1: viewFromY, 2: viewFromZ
    viewMatrix = utils.MakeView(this.x, this.y, this.z, this.elev, this.angle);

    updateViewMatrix = () => {
        this.viewMatrix = utils.MakeView(this.x, this.y, this.z, this.elev, this.angle);
    }

    viewFromX = () => {
        this.x = 2.0;
        this.y = 0.0;
        this.z = 0.0;
        this.elev = 0.0;
        this.angle = 90.0;
        this.mode = 0;
        this.updateViewMatrix();
    }

    viewFromY = () => {
        this.x = 0.0;
        this.y = 2.0;
        this.z = 0.0;
        this.elev = -90.0;
        this.angle = 0.0;
        this.mode = 1;
        this.updateViewMatrix();
    }

    viewFromZ = () => {
        this.x = 0.0;
        this.y = 0.0;
        this.z = 2.0;
        this.elev = 0.0;
        this.angle = 0.0;
        this.mode = 2;
        this.updateViewMatrix();
    }

    moveBack = (amount) => {
        switch (this.mode) {
            case 0:
                camera.x += amount;
                break;
            case 1:
                camera.y += amount;
                break;
            case 2:
                camera.z += amount;
                break;
        }
        this.updateViewMatrix();
    }

    moveForward = (amount) => {
        switch (this.mode) {
            case 0:
                camera.x -= amount;
                break;
            case 1:
                camera.y -= amount;
                break;
            case 2:
                camera.z -= amount;
                break;
        }
        this.updateViewMatrix();
    }
}