const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const GAME_BACKGROUND = '#010101';
const PLAYER_COLOR = '#3884FF'
const BULLET_COLOR = '#DD1335'
const ENEMY_COLOR = '#56DD13'

const RECT_HEIGHT = 10;
const RECT_WIDTH = 10;

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ctx = canvas?.getContext('2d');

type Vector2 = {
    x: number;
    y: number;
};

type Rect = {
    pos: Vector2;
    w: number;
    h: number;
};

type Player = {
    rect: Rect;
    health: number;
    speed: number;
}

type Enemy = {
    rect: Rect;
    health: number;
    speed: number;
    isDead: boolean;
}

type Bullet = {
    rect: Rect;
    isActive: boolean;
    speed: number;
}

type Events = {
    moveUp: boolean;
    moveDown: boolean;
    moveLeft: boolean;
    moveRight: boolean;
    shoot: boolean;
}

type State = {
    player: Player;
    enemies: Enemy[];
    bullets: Bullet[];
    events: Events;
};


function rectsColliding(a: Rect, b: Rect): boolean {
    return (
        a.pos.x < b.pos.x + b.w &&
        a.pos.x + a.w > b.pos.x &&
        a.pos.y < b.pos.y + b.h &&
        a.pos.y + a.h > b.pos.y
    );
}

function drawRectangle(rect: Rect, color: string) {
    if (ctx === null) return;
    ctx.fillStyle = color;
    ctx.fillRect(rect.pos.x - rect.w / 2, rect.pos.y - rect.h / 2, rect.w, rect.h);
}

function clone<T>(obj: T): T {
    return structuredClone(obj);
}

function clearBackground() {
    if (ctx === null) return;
    ctx.fillStyle = GAME_BACKGROUND;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

function renderPlayer(player: Player) {
    drawRectangle(player.rect, PLAYER_COLOR);
}

function renderEnemy(enemy: Enemy) {
    drawRectangle(enemy.rect, ENEMY_COLOR);
}

function renderBullet(bullet: Bullet) {
    drawRectangle(bullet.rect, ENEMY_COLOR);
}

function renderGame(state: State) {
    clearBackground();
    renderPlayer(state.player);
}


function createPlayer(x: number, y: number, speed: number): Player {
    return {
        rect: {
            pos: {
                x, 
                y 
            },
            h: 100,
            w: 50,
        },
        health: 100,
        speed,
    }
}

function createEnemy(x: number, y: number, speed: number): Enemy {
    return {
        rect: {
            pos: {
                x, 
                y 
            },
            h: 100,
            w: 50,
        },
        isDead: false,
        health: 100,
        speed,
    }
}

function createBullet(x: number, y: number, speed: number): Bullet {
    return {
        rect: {
            pos: {
                x, 
                y 
            },
            h: 10,
            w: 25,
        },
        isActive: false,
        speed,
    }
}

function createEvents(): Events {
    return {
        moveUp: false,
        moveDown: false,
        moveLeft: false,
        moveRight: false,
        shoot: false
    }
}

function loop(state: State): void {
    setTimeout(() => {
        clearBackground();
        loop(state);
    }, 500);
}

function init(): void {
    if (canvas == null) {
        console.log('Broken html');
        return;
    }
    if (ctx == null) {
        console.log('Could not get 2d context');
        return;
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.translate(
        Math.floor((canvas.width - GAME_WIDTH) / 2),
        Math.floor((canvas.height - GAME_HEIGHT) / 2)
    );
    let state: State = {
        player: createPlayer(100, 300, 25),
        enemies: [],
        bullets: [],
        events: createEvents()
    };
    loop(state);
}

init();
