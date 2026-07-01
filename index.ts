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
    shootCooldown: number;
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
    drawRectangle(bullet.rect, BULLET_COLOR);
}

function renderBullets(bullets: Bullet[]) {
    bullets.forEach((bullet) => renderBullet(bullet));
}

function renderEnemies(enemies: Enemy[]) {
    enemies.forEach((enemy) => renderEnemy(enemy));
}

function renderGame(state: State) {
    clearBackground();
    renderPlayer(state.player);
    renderBullets(state.bullets);
    renderEnemies(state.enemies);
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
        isActive: true,
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

let inputEvents = createEvents();

document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp')    inputEvents.moveUp    = true;
    if (e.key === 'ArrowDown')  inputEvents.moveDown  = true;
    if (e.key === 'ArrowLeft')  inputEvents.moveLeft  = true;
    if (e.key === 'ArrowRight') inputEvents.moveRight = true;
    if (e.key === ' ')          inputEvents.shoot     = true;
});

document.addEventListener('keyup', (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp')    inputEvents.moveUp    = false;
    if (e.key === 'ArrowDown')  inputEvents.moveDown  = false;
    if (e.key === 'ArrowLeft')  inputEvents.moveLeft  = false;
    if (e.key === 'ArrowRight') inputEvents.moveRight = false;
    if (e.key === ' ')          inputEvents.shoot     = false;
});

function movePlayer(player: Player,  events: Events): Vector2 {
    let x = player.rect.pos.x;
    let y = player.rect.pos.y;

    if (events.moveUp)
        y = y - player.speed < player.rect.h / 2 ? player.rect.h / 2 : y - player.speed;
    if (events.moveDown)
        y = y + player.speed > GAME_HEIGHT - player.rect.h / 2 ? GAME_HEIGHT - player.rect.h / 2 : y + player.speed;
    
    if (events.moveLeft)
        x = x - player.speed < 0 + player.rect.w / 2 ? 0 + player.rect.w / 2 : x - player.speed;
    if (events.moveRight)
        x = x + player.speed > GAME_WIDTH - player.rect.w / 2 ? GAME_WIDTH - player.rect.w / 2 : x + player.speed;

    return {
        x,
        y
    }
}


function updatePlayer(player: Player, events: Events) {
    return {
        ...player,
        rect: {
            ...player.rect,
            pos: movePlayer(player, events)
        }
    }
}

function moveBullet(bullet: Bullet): Vector2 {
    return {
        ...bullet.rect.pos,
        x: bullet.rect.pos.x + bullet.speed
    }
}

const SHOOT_COOLDOWN = 6;
const BULLET_SPEED = 12;

function updateBullets(bullets: Bullet[], playerPos: Vector2, events: Events, cooldown: number): [Bullet[], number] {
    const nBullets = bullets.map((bullet) => ({
        ...bullet,
        rect: { ...bullet.rect, pos: moveBullet(bullet) }
    }));

    if (events.shoot && cooldown === 0) {
        return [[...nBullets, createBullet(playerPos.x, playerPos.y, BULLET_SPEED)], SHOOT_COOLDOWN];
    }
    return [nBullets, Math.max(0, cooldown - 1)];
}

function moveEnemy(enemy: Enemy): Vector2 {
    return {
        ...enemy.rect.pos,
        x: enemy.rect.pos.x - enemy.speed
    }
}

function updateEnemies(enemies: Enemy[]): Enemy[] {
    let nEnemies = enemies.map((enemy) => {
        let nEnemy = {
            ...enemy,
            rect: {
                ...enemy.rect,
                pos: moveEnemy(enemy)
            }
        }
        return nEnemy;
    })

    return nEnemies;
}

function checkBulletEnemyCollisions(bullets: Bullet[], enemies: Enemy[]): [Bullet[], Enemy[]] {
    return enemies.reduce<[Bullet[], Enemy[]]>(
        ([accBullets, accEnemies], enemy) => {
            const hitBullet = accBullets.find(b => rectsColliding(b.rect, enemy.rect));
            if (hitBullet) {
                return [
                    accBullets.filter(b => b !== hitBullet),
                    [...accEnemies, { ...enemy, health: enemy.health - 10 }]
                ];
            }
            return [accBullets, [...accEnemies, enemy]];
        },
        [bullets, []]
    );
}

function checkPlayerEnemyCollisions(player: Player, enemies: Enemy[]): Player {
    const hit = enemies.some(e => rectsColliding(player.rect, e.rect));
    return hit ? { ...player, health: player.health - 10 } : player;
}

function updateGame(state: State, events: Events): State {
    const movedPlayer = updatePlayer(state.player, events);
    const [movedBullets, newCooldown] = updateBullets(state.bullets, movedPlayer.rect.pos, events, state.shootCooldown);
    const movedEnemies = updateEnemies(state.enemies);
    const [survivingBullets, damagedEnemies] = checkBulletEnemyCollisions(movedBullets, movedEnemies);
    const damagedPlayer = checkPlayerEnemyCollisions(movedPlayer, movedEnemies);
    return {
        ...state,
        player: damagedPlayer,
        bullets: survivingBullets,
        enemies: damagedEnemies,
        shootCooldown: newCooldown,
    };
}


function loop(state: State): void {
    let events = { ...inputEvents }
    state = updateGame(state, events);
    renderGame(state);

    requestAnimationFrame(() => loop(state))
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
        events: createEvents(),
        shootCooldown: 0,
    };
    loop(state);
}

init();
