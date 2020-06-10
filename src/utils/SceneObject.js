class SceneObject {
    x = 0.0; y = 0.0; z = 0.0; rx = 0.0; ry = 0.0; rz = 0.0; s = 1.0;
    asset = null; animation = null;

    setParams = ({x, y, z, rx, ry, rz, s, asset, animation}) => {
        if (x) this.x = x;
        if (y) this.y = y;
        if (z) this.z = z;
        if (rx) this.rx = rx;
        if (ry) this.ry = ry;
        if (rz) this.rz = rz;
        if (s) this.s = s;
        if (asset) this.asset = asset;
        if (animation) this.animation = animation;
    };

    getWorldMatrix = () => {
        return utils.MakeWorld(this.x, this.y, this.z, this.rx, this.ry, this.rz, this.s);
    };
}