class AtomAnimation {
    radious; calculatePos;

    constructor(r, func) {
        this.radious = r;
        this.calculatePos = func;
    }

    getPosAtTime = (t) => {
        let perc = electron_velocity * t / 1000;
        return this.calculatePos(perc, this.radious);
    }
}