class SceneNode {
    parent = null;
    children = [];
    localCords = {
        x: 0.0, y: 0.0, z: 0.0, rx: 0.0, ry: 0.0, rz: 0.0, s: 1.0
    };
    worldMatrix;
    assetType;
    animation;
    
    constructor(assetType, cords) {
        this.assetType = assetType;
        this.setPosition(cords);
    }
    
    setPosition = (cords) => {
        if (cords){
            if (cords.x) this.localCords.x = cords.x;
            if (cords.y) this.localCords.y = cords.y;
            if (cords.z) this.localCords.z = cords.z;
            if (cords.rx) this.localCords.rx = cords.rx;
            if (cords.ry) this.localCords.ry = cords.ry;
            if (cords.rz) this.localCords.rz = cords.rz;
            if (cords.s) this.localCords.s = cords.s;
        }
    }

    setParent = (parent) => {
        // Remove this from parent children
        if (this.parent) {
            let ndx = this.parent.children.indexOf(this);
            if (ndx >= 0) this.parent.children.splice(ndx, 1);
        }

        // Add this to the new parent
        if (parent) parent.children.push(this);
        this.parent = parent;
    }

    setAnimation = (animation) => {
        if (animation) this.animation = animation;
    }
    
    getLocalMatrix = () => {
        return utils.MakeWorld(this.localCords.x, this.localCords.y, this.localCords.z, this.localCords.rx, this.localCords.ry, this.localCords.rz, this.localCords.s);
    }

    updateWorldMatrix = (parentWolrdMatrix) => {
        let localMatrix = this.getLocalMatrix();
        if (parentWolrdMatrix) this.worldMatrix = utils.multiplyMatrices(parentWolrdMatrix, localMatrix);
        else this.worldMatrix = localMatrix;

        let worldMatrix = this.worldMatrix;
        this.children.forEach((child) => {
            child.updateWorldMatrix(worldMatrix);
        })
    }
}