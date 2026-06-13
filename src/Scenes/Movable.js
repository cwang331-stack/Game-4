class Movable {
    constructor(scene, sprite, speed, maxtime = -1) {
        this.scene = scene;
        this.sprite = sprite;
        this.speed = speed;
        this.maxtime = maxtime * 1000;
        this.time = 0;
    }
    update(time, delta){
        this.time += delta;
        this.cleanup();
    }
    isinbound() {
        let s = this.sprite;
        let sc = this.scene;
        if(s.x < 0){
            return false;
        }
        if(s.x > sc.xb){
            return false;
        }
        if(s.y < 0){
            return false;
        }
        if(s.y > sc.yb){
            return false;
        }
        return true;
    }
    cleanup() {
        if (!this.isinbound()) {
            this.sprite.destroy();
        }
        if (this.maxtime > 0 && this.time > this.maxtime) {
            this.sprite.destroy();
        }
    }
}

class DirectionalMovable extends Movable {
    constructor(scene, sprite, speed, maxtime = -1, bounded = true, direction = new Phaser.Math.Vector2(0)) {
        super(scene, sprite, speed, maxtime);
        this.bounded = bounded;
        this.direction = direction.normalize()
    }
    update(time, delta) {
        let s = this.sprite;
        let sc = this.scene
        s.x += this.speed * (delta/1000) * this.direction.x;
        s.y += this.speed * (delta/1000) * this.direction.y;
        if (this.bounded) {
            if(s.x < 0){
                s.x = 0;
            }
            if(s.x > sc.xb){
                s.x = sc.xb;
            }
            if(s.y < 0){
                s.y = 0;
            }
            if(s.y > sc.yb){
                s.y = sc.yb;
            }
        }
        super.update(time, delta);
    }
    changedir(dir) {
        this.direction = dir.normalize();
    }
}

class PathMovable extends Movable {
    constructor(scene, sprite, speed, path, maxtime = -1, start = 0, loop = false, following = false) {
        super(scene, sprite, speed, maxtime);
        this.path = path;
        this.pos = start;
        this.loop = loop;
        this.following = following;
        if (loop) {
            this.path.closePath();
        }
        let s = this.sprite;
        s.x = this.path.getPoint(this.pos).x;
        s.y = this.path.getPoint(this.pos).y;
    }
    update(time, delta) {
        if (this.following) {
            let s = this.sprite;
            let l = this.path.getLength();
            let deltat = this.speed * (delta/1000) / l;
            this.pos += deltat;
            if (this.loop) {
                 this.pos %= 1;
            } else if (this.pos > 1) {
                this.pos = 1;
            }
            s.x = this.path.getPoint(this.pos).x;
            s.y = this.path.getPoint(this.pos).y;
            super.update(time, delta);
        }
    }
    startfollow(){
        this.following = true;
    }
    stopfollow(){
        this.following = false;
    }
}