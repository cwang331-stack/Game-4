class Agent {
    constructor(movable, fullcd, atkfunc = null, hp = 1) {
        this.movable = movable;
        this.sprite = movable.sprite;
        this.fullcd = fullcd * 1000;
        this.atkfunc = atkfunc;
        this.cd = 0;
        this.hp = hp;
    }
    update(time, delta){
        this.cd -= delta;
        if (this.cd < 0) {
            this.cd = 0;
        }
        this.movable.update(time, delta);
    }
    attack() {
        if (this.cd <= 0) {
            this.cd = this.fullcd;
            if (this.atkfunc != null) {
                return this.atkfunc();
            }
        }
        return null;
    }
    addhp(hp) {
        this.hp += hp;
        return this.hp;
    }
    subhp(hp) {
        this.hp -= hp;
        if (this.hp <= 0) {
            this.sprite.destroy();
        }
        return this.hp;
    }
    sethp(hp) {
        this.hp = hp;
    }
}

class PlayerAgent extends Agent{
    constructor(movable, fullcd, atkfunc = null, hp = 1) {
        super(movable, fullcd, atkfunc, hp)
        this.moveAD = 0
    }
    update(time, delta){
        if (this.moveAD == 0) {
            let v2 = new Phaser.Math.Vector2();
            this.movable.changedir(v2);
        } else if (this.moveAD == -1) {
            let v2 = new Phaser.Math.Vector2(-1,0);
            this.movable.changedir(v2);
        } else if (this.moveAD == 1) {
            let v2 = new Phaser.Math.Vector2(1,0);
            this.movable.changedir(v2);
        }
        super.update(time, delta);
    }
}