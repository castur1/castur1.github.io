const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const blockingDiv = document.getElementById("home");

function FullscreenCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

FullscreenCanvas();
window.addEventListener("resize", FullscreenCanvas);

class Boid {
    constructor(x, y) {
        this.pos = {x, y};
        this.vel = {
            x: 2 * Math.random() - 1,
            y: 2 * Math.random() - 1
        };
        this.acc = {x: 0, y: 0};
    }

    ApplyForce(force) {
        this.acc.x += force.x / 1;
        this.acc.y += force.y / 1;
    }

    Separate(boids, params) {
        let steer = {x: 0, y: 0};
        let count = 0;

        for (let other of boids) {
            if (other == this) 
                continue;

            const dx = this.pos.x - other.pos.x;
            const dy = this.pos.y - other.pos.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < params.desiredDist * params.desiredDist) {
                const dist = Math.sqrt(distSq);
                steer.x += dx / dist;
                steer.y += dy / dist;
                ++count;
            }
        }

        if (count > 0) {
            steer.x /= count;
            steer.y /= count;

            let magnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
            steer.x = (steer.x / magnitude) * params.maxSpeed;
            steer.y = (steer.y / magnitude) * params.maxSpeed;
            
            steer.x -= this.vel.x;
            steer.y -= this.vel.y;

            magnitude = steer.x * steer.x + steer.y * steer.y;
            if (magnitude > params.maxForce * params.maxForce) {
                magnitude = Math.sqrt(magnitude);
                steer.x = (steer.x / magnitude) * params.maxForce;
                steer.y = (steer.y / magnitude) * params.maxForce;
            }

            steer.x *= params.seperationFactor;
            steer.y *= params.seperationFactor;
        }

        return steer;
    }

    Align(boids, params) {
        let steer = {x: 0, y: 0};
        let count = 0;

        for (let other of boids) {
            if (other == this) 
                continue;

            const dx = this.pos.x - other.pos.x;
            const dy = this.pos.y - other.pos.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < params.radius * params.radius) {
                steer.x += other.vel.x;
                steer.y += other.vel.y;
                ++count;
            }
        }

        if (count > 0) {
            steer.x /= count;
            steer.y /= count;

            let magnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
            steer.x = (steer.x / magnitude) * params.maxSpeed;
            steer.y = (steer.y / magnitude) * params.maxSpeed;

            steer.x -= this.vel.x;
            steer.y -= this.vel.y;

            magnitude = steer.x * steer.x + steer.y * steer.y;
            if (magnitude > params.maxForce * params.maxForce) {
                magnitude = Math.sqrt(magnitude);
                steer.x = (steer.x / magnitude) * params.maxForce;
                steer.y = (steer.y / magnitude) * params.maxForce;
            }

            steer.x *= params.alignFactor;
            steer.y *= params.alignFactor;
        }

        return steer;
    }

    Cohesion(boids, params) {
        let steer = {x: 0, y: 0};
        let count = 0;

        for (let other of boids) {
            if (other == this) 
                continue;

            const dx = this.pos.x - other.pos.x;
            const dy = this.pos.y - other.pos.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < params.radius * params.radius) {
                steer.x += other.pos.x;
                steer.y += other.pos.y;
                ++count;
            }
        }

        if (count > 0) {
            steer.x /= count;
            steer.y /= count;

            steer.x -= this.pos.x;
            steer.y -= this.pos.y;

            let magnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
            steer.x = (steer.x / magnitude) * params.maxSpeed;
            steer.y = (steer.y / magnitude) * params.maxSpeed;

            steer.x -= this.vel.x;
            steer.y -= this.vel.y;

            magnitude = steer.x * steer.x + steer.y * steer.y;
            if (magnitude > params.maxForce * params.maxForce) {
                magnitude = Math.sqrt(magnitude);
                steer.x = (steer.x / magnitude) * params.maxForce;
                steer.y = (steer.y / magnitude) * params.maxForce;
            }

            steer.x *= params.cohesionFactor;
            steer.y *= params.cohesionFactor
        }

        return steer;
    }

    AvoidBorders(params) {
        return {
            x: this.pos.x < params.margin ? params.maxForceBorders : this.pos.x > (canvas.width - params.margin) ? -params.maxForceBorders : 0,
            y: this.pos.y < params.margin ? params.maxForceBorders : this.pos.y > (canvas.height - params.margin) ? -params.maxForceBorders : 0
        }
    }

    TargetMouse(boids, params, mousePos) {
        if (mousePos.x == null) 
            return {x: 0, y: 0};

        let steer = {x: 0, y: 0};

        const dx = mousePos.x - this.pos.x;
        const dy = mousePos.y - this.pos.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < params.mouseRadius * params.mouseRadius) {
            steer.x = dx;
            steer.y = dy;

            let magnitude = Math.sqrt(steer.x * steer.x + steer.y * steer.y);
            steer.x = (steer.x / magnitude) * params.maxSpeed;
            steer.y = (steer.y / magnitude) * params.maxSpeed;

            magnitude = steer.x * steer.x + steer.y * steer.y;
            if (magnitude > params.maxForce * params.maxForce) {
                magnitude = Math.sqrt(magnitude);
                steer.x = (steer.x / magnitude) * params.maxForce;
                steer.y = (steer.y / magnitude) * params.maxForce;
            }

            steer.x *= params.mouseFactor;
            steer.y *= params.mouseFactor;
        }

        return steer;
    }

    Flock(boids, params, mousePos) {
        const seperation = this.Separate(boids, params);
        const align = this.Align(boids, params);
        const cohesion = this.Cohesion(boids, params);
        const borders = this.AvoidBorders(params);
        const mouse = this.TargetMouse(boids, params, mousePos);

        this.ApplyForce(seperation);
        this.ApplyForce(align);
        this.ApplyForce(cohesion);
        this.ApplyForce(borders);
        this.ApplyForce(mouse);
    }

    Update(params) {
        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;

        const speedSq = this.vel.x * this.vel.x + this.vel.y * this.vel.y;
        if (speedSq > params.maxSpeed * params.maxSpeed) {
            const speed = Math.sqrt(speedSq);
            this.vel.x = (this.vel.x / speed) * params.maxSpeed;
            this.vel.y = (this.vel.y / speed) * params.maxSpeed;
        }

        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
    }

    Draw(params) {
        context.fillStyle = "#c8cbd2";
        
        const angle = Math.atan2(this.vel.y, this.vel.x);

        context.save()

        context.translate(this.pos.x, this.pos.y);
        context.rotate(angle);

        context.beginPath();
        context.moveTo(2 * params.size, 0);
        context.lineTo(-params.size, -params.size);
        context.lineTo(-params.size, params.size);
        context.closePath();
        context.fill();

        context.restore();
    }
}

let boids = [];
const params = {
    maxSpeed: 4.5,
    desiredDist: 35,
    seperationFactor: 6,
    maxForce: 0.2,
    radius: 65,
    alignFactor: 4,
    cohesionFactor: 0.5,
    margin: 50,
    maxForceBorders: 0.5,
    size: 8,
    mouseRadius: 400,
    mouseFactor: 2
};
let mousePos = {x: null, y: null};
let isMouseDown = false;

function InitBoids(count) {
    boids.length = 0;
    for (let i = 0; i < count; ++i) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        boids.push(new Boid(x, y));
    }
}

InitBoids(80);

["mousedown", "mouseup", "mousemove", "mouseleave"].forEach(eventType => {
    blockingDiv.addEventListener(eventType, (e) => {
      const canvasEvent = new MouseEvent(eventType, {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: true
      });
      canvas.dispatchEvent(canvasEvent);
    });
  });

canvas.addEventListener("mousedown", (e) => {
    isMouseDown = true;

    mousePos.x = e.clientX;
    mousePos.y = e.clientY;

    document.body.classList.add('no-select');
});

canvas.addEventListener("mouseup", (e) => {
    isMouseDown = false;

    mousePos.x = null;
    mousePos.y = null;

    document.body.classList.remove('no-select');
});

canvas.addEventListener("mousemove", (e) => {
    if (isMouseDown) {
        mousePos.x = e.clientX;
        mousePos.y = e.clientY;
    }
});

canvas.addEventListener("mouseleave", () => {
    mousePos.x = null;
    mousePos.y = null;
    
    document.body.classList.remove('no-select');
});

let lastTime;
const frameTime = 1000 / 60;

function Render(time) {
    requestAnimationFrame(Render);

    if (!lastTime) 
        lastTime = time;
    let elapsed = time - lastTime;

    if (elapsed < frameTime) 
        return;
    
    context.fillStyle = "#1D1A05"
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (let boid of boids) {
        boid.Flock(boids, params, mousePos);
    }

    for (let boid of boids) {
        boid.Update(params);
        boid.Draw(params)
    }

    lastTime = time;
}

Render();

document.getElementById('count').addEventListener('input', function() {
    const count = parseInt(this.value);
    document.getElementById('count-value').textContent = count;
    InitBoids(count);

    const percentage = 100 * (this.value - this.min) / (this.max - this.min);
    this.style.background = 'linear-gradient(to right, #DC143C 0%, #DC143C ' + percentage + '%, #700A1D ' + percentage + '%, #700A1D 100%)';
});