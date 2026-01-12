const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// COLORS
const WHITE = '#FFFFFF';
const BLACK = '#000000';
const RED = '#FF0000';
const LIGHT_RED = '#ff9c9cff';
const TRANSL_RED = 'rgba(255, 0, 0, 0.8)'
const BLUE = '#0000FF';
const TRANSL_BLUE = 'rgba(0, 0, 255, 0.8)'
const DARK_RED = '#320000';
const DARK_BLUE = '#000032';
const LIGHT_GREEN = "#e6ffe8ff"
const GRAY = '#888888';

let testVar = 1;
let paused = false;
let gravity = 0.3;
let bounciness = 0.8;
let holding = false;
let holdOffset = [0, 0];
let objects = [];

class Ball {
    constructor() {
        this.pos = [canvas.width /2 , canvas.height/2]
        this.size = 50
        this.velocity = [4, 4]
        this.lastPos = []
    }

    collide() {
        if (this.pos[0] + this.size > canvas.width) {
            this.pos[0] = canvas.width-this.size;
            this.velocity[0] = (this.velocity[0] < 0 ? -this.velocity[0] : this.velocity[0]) * bounciness
        }
        else if (this.pos[0] < 0) {
            this.pos[0] = 1;
            this.velocity[0] = (this.velocity[0] > 0 ? -this.velocity[0] : this.velocity[0]) * bounciness
        }
        else if (this.pos[1] + this.size > canvas.height) {
            this.pos[1] = canvas.height-this.size;
            this.velocity[1] = (this.velocity[1] < 0 ? -this.velocity[1] : this.velocity[1]) * bounciness
        }
        else if (this.pos[1] < 0) {
            this.pos[1] = 1;
            this.velocity[1] = (this.velocity[1] > 0 ? -this.velocity[1] : this.velocity[1]) * bounciness
        }
        for (let i = 0; i<objects.length; i++) {
            if (this.isTouching(objects[i])) {

            }
        }
    }

    move() {
        this.collide();
        this.pos[0] -= this.velocity[0]
        this.pos[1] -= this.velocity[1]
        if (this.pos[1] + this.size + 5 > canvas.height && Math.abs(this.velocity[1]) < 2) {
            if (this.velocity[1] > 0)
                this.velocity[1] -= 0.1;
            else
                this.velocity[1] = 0;
                this.pos[1] = canvas.height - this.size
        }
        else 
            this.velocity[1] -= gravity;
    }

}



function gameLoop() {
    // draw background
    ctx.fillStyle = paused === true ? LIGHT_RED : LIGHT_GREEN;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    

    // physics
    if (!paused && !holding) {
        ball.move();
    }

    // draw the ball!
    ctx.fillStyle = BLACK;
    ctx.fillRect(ball.pos[0], ball.pos[1], ball.size, ball.size);
    
    //ball.getMoved(null);
    window.requestAnimationFrame(gameLoop);
}

function onResize() {
    canvas.height = window.innerHeight - 50;
    canvas.width = window.innerWidth - 50;
}


function onMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (ball.pos[0] < x && ball.pos[0] + ball.size > x
        && ball.pos[1] < y && ball.pos[1] + ball.size > y) {
        holding = true;
        holdOffset = [x-ball.pos[0], y-ball.pos[1]];
        console.log('grabbied');
        canvas.addEventListener("mousemove", onMouseMove);
    }
}

function onMouseMove(e) {
    console.log('tryna move')
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - holdOffset[0] - 0.5;
    const y = e.clientY - rect.top - holdOffset[1] - 0.5;

    ball.lastPos.push([ball.pos[0], ball.pos[1]])
    if (ball.lastPos.length >= 2) {
        ball.lastPos.splice(0, ball.lastPos.length - 2)
    }
    console.log(ball.lastPos)

    ball.pos[0] = x;
    if (x < 0)
        ball.pos[0] = 0
    if (x > canvas.width - ball.size)
        ball.pos[0] = canvas.width - ball.size
    ball.pos[1] = y;
    if (y < 0)
        ball.pos[1] = 0
    if (y > canvas.height - ball.size)
        ball.pos[1] = canvas.height - ball.size
}

function onMouseRelease(e) {
    if (!holding)
        return
    holding = false;
    let positions;
    let velocities;
    let avg;
    for (let i = 0; i<2; i++) {
        positions = [ball.pos[i]];
        velocities = [];
        avg = 0;
        console.log(ball.lastPos.spl)
        for (let j = ball.lastPos.length-1; j>=0; j--)
            positions.push(ball.lastPos[j][i]);
        console.log(positions)
        for (let j = 0; j<positions.length-1; j++)
            velocities.push(positions[j] - positions[j+1])
        
        for (let j = 0; j<velocities.length;j++)
            avg += velocities[j]
        ball.velocity[i] = -avg/(velocities.length*5)
        

    }
    console.log('leggo'); 
    canvas.removeEventListener("mousemove", onMouseMove);
}


//canvas.addEventListener('click', onClick);
window.addEventListener("resize", onResize);
window.addEventListener("keypress", (e) => {
    if (e.key === " ") 
        paused = !paused;
    console.log('clicked!')
})
let ball = new Ball();

canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener('mouseup', onMouseRelease);
canvas.addEventListener("mouseleave", onMouseRelease);
onResize();
gameLoop();