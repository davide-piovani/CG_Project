class AtomAnimation {
    radius; calculatePos;

    constructor(r, func) {
        this.radius = r;
        this.calculatePos = func;
    }

    getPosAtTime = (t) => {
        let perc = electron_velocity * t / 1000;
        return this.calculatePos(perc, this.radius);
    }
}