const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const GAME_BACKGROUND = '#010101';
const PLAYER_COLOR = '#3884FF'
const BULLET_COLOR = '#DD1335'
const ENEMY_COLOR = '#56DD13'
const SHOOT_COOLDOWN = 10;
const BULLET_SPEED = 12;
const ENEMY_SPEED = 2;
const PLAYER_MAX_HEALTH = 1000;

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
    restart: boolean;
}

type State = {
    player: Player;
    enemies: Enemy[];
    bullets: Bullet[];
    events: Events;
    shootCooldown: number;
    gameOver: boolean;
    score: number;
    level: number;
    spawnTimer: number;
};


function rectsColliding(a: Rect, b: Rect): boolean {
    return (
        a.pos.x - a.w / 2 < b.pos.x + b.w / 2 &&
        a.pos.x + a.w / 2 > b.pos.x - b.w / 2 &&
        a.pos.y - a.h / 2 < b.pos.y + b.h / 2 &&
        a.pos.y + a.h / 2 > b.pos.y - b.h / 2
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

function renderHUD(state: State) {
    if (ctx === null) return;
    ctx.fillStyle = '#444444';
    ctx.font = '16px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`HP: ${Math.round(state.player.health / PLAYER_MAX_HEALTH * 100)}  Level: ${state.level}  Score: ${state.score}`, GAME_WIDTH - 10, GAME_HEIGHT - 10);
}

function renderGame(state: State) {
    clearBackground();
    renderPlayer(state.player);
    renderBullets(state.bullets);
    renderEnemies(state.enemies);
    renderHUD(state);
}

function renderGameOverScreen(state: State) {
    if (ctx === null) return;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#444444';
    ctx.font = '48px monospace';
    ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30);
    ctx.font = '20px monospace';
    ctx.fillText(`Level: ${state.level}  Score: ${state.score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
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
        health: PLAYER_MAX_HEALTH,
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
        health: 40,
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
        shoot: false,
        restart: false,
    }
}

let inputEvents = createEvents();

document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp')    inputEvents.moveUp    = true;
    if (e.key === 'ArrowDown')  inputEvents.moveDown  = true;
    if (e.key === 'ArrowLeft')  inputEvents.moveLeft  = true;
    if (e.key === 'ArrowRight') inputEvents.moveRight = true;
    if (e.key === ' ')          inputEvents.shoot     = true;
    if (e.key === 'r')          inputEvents.restart   = true;
});

document.addEventListener('keyup', (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp')    inputEvents.moveUp    = false;
    if (e.key === 'ArrowDown')  inputEvents.moveDown  = false;
    if (e.key === 'ArrowLeft')  inputEvents.moveLeft  = false;
    if (e.key === 'ArrowRight') inputEvents.moveRight = false;
    if (e.key === ' ')          inputEvents.shoot     = false;
    if (e.key === 'r')          inputEvents.restart   = false;
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


function updateBullets(bullets: Bullet[], playerPos: Vector2, events: Events, cooldown: number): [Bullet[], number] {
    const nBullets = bullets.map((bullet) => ({
        ...bullet,
        rect: { ...bullet.rect, pos: moveBullet(bullet) }
    })).filter((b) => b.rect.pos.x + b.rect.w <= GAME_WIDTH );

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

const BASE_SPAWN_INTERVAL = 120;

function spawnInterval(level: number): number {
    return Math.max(30, BASE_SPAWN_INTERVAL - level * 10);
}

function updateEnemies(level: number, enemies: Enemy[], spawnTimer: number): [Enemy[], number] {
    const nEnemies = enemies.map((enemy) => ({
        ...enemy,
        rect: { ...enemy.rect, pos: moveEnemy(enemy) }
    })).filter((e) => e.rect.pos.x - e.rect.w / 2 > 0);

    if (spawnTimer <= 0) {
        const y = Math.random() * (GAME_HEIGHT - 100) + 50;
        return [[...nEnemies, createEnemy(GAME_WIDTH - 100, y, ENEMY_SPEED)], spawnInterval(level)];
    }
    return [nEnemies, spawnTimer - 1];
}

function checkBulletEnemyCollisions(bullets: Bullet[], enemies: Enemy[], score: number): [Bullet[], Enemy[], number] {
    return enemies.reduce<[Bullet[], Enemy[], number]>(
        ([accBullets, accEnemies, accScore], enemy) => {
            const hitBullet = accBullets.find(b => b.isActive && !enemy.isDead && rectsColliding(b.rect, enemy.rect));
            if (hitBullet) {
                return [
                    accBullets.filter(b => b !== hitBullet),
                    [...accEnemies, { ...enemy, health: enemy.health - 10, isDead: enemy.health - 10 <= 0 }]
                        .filter((e) => !e.isDead),
                    accScore + 1
                ];
            }
            return [accBullets, [...accEnemies, enemy], accScore];
        },
        [bullets, [], score]
    );
}

function checkPlayerEnemyCollisions(player: Player, enemies: Enemy[]): Player {
    const hit = enemies.some(e => rectsColliding(player.rect, e.rect));
    return hit ? { ...player, health: player.health - 10 } : player;
}

function updateLevel(current: number, score: number): number {
    if (score < 100) return 1;
    return score % 10 > current ? score % 10 : current;
}

function updateGame(state: State, events: Events): State {
    const movedPlayer = updatePlayer(state.player, events);
    const [movedBullets, newCooldown] = updateBullets(state.bullets, movedPlayer.rect.pos, events, state.shootCooldown);
    const [movedEnemies, newSpawnTimer] = updateEnemies(state.level, state.enemies, state.spawnTimer);
    const [survivingBullets, damagedEnemies, newScore] = checkBulletEnemyCollisions(movedBullets, movedEnemies, state.score);
    const damagedPlayer = checkPlayerEnemyCollisions(movedPlayer, movedEnemies);
    const newLevel = updateLevel(state.level, state.score);
    const gameOver = damagedPlayer.health <= 0;

    return {
        ...state,
        player: damagedPlayer,
        bullets: survivingBullets,
        enemies: damagedEnemies,
        shootCooldown: newCooldown,
        gameOver,
        score: newScore,
        level: newLevel,
        spawnTimer: newSpawnTimer,
    };
}

const TARGET_FPS = 60;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
let lastTime = 0;

function loop(state: State, timestamp: number = 0): void {
    const elapsed = timestamp - lastTime;
    if (elapsed >= FRAME_INTERVAL) {
        lastTime = timestamp - (elapsed % FRAME_INTERVAL);
        if (state.gameOver) {
            renderGame(state);
            renderGameOverScreen(state);
            if (inputEvents.restart) {
                requestAnimationFrame((t) => loop(createInitialState(), t));
            } else {
                requestAnimationFrame((t) => loop(state, t));
            }
            return;
        }
        const newState = updateGame(state, { ...inputEvents });
        renderGame(newState);
        requestAnimationFrame((t) => loop(newState, t));
    } else {
        requestAnimationFrame((t) => loop(state, t));
    }
}

function createInitialState(): State {
    return {
        player: createPlayer(100, 300, 8),
        enemies: [],
        bullets: [],
        events: createEvents(),
        shootCooldown: 0,
        gameOver: false,
        score: 0,
        level: 0,
        spawnTimer: BASE_SPAWN_INTERVAL,
    };
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
    loop(createInitialState());
}

init();
