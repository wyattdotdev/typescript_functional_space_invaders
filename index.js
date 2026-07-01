"use strict";
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const GAME_BACKGROUND = '#010101';
const PLAYER_COLOR = '#3884FF';
const BULLET_COLOR = '#DD1335';
const ENEMY_COLOR = '#56DD13';
const RECT_HEIGHT = 10;
const RECT_WIDTH = 10;
const canvas = document.getElementById('game');
const ctx = canvas?.getContext('2d');
function rectsColliding(a, b) {
    return (a.pos.x < b.pos.x + b.w &&
        a.pos.x + a.w > b.pos.x &&
        a.pos.y < b.pos.y + b.h &&
        a.pos.y + a.h > b.pos.y);
}
function drawRectangle(rect, color) {
    if (ctx === null)
        return;
    ctx.fillStyle = color;
    ctx.fillRect(rect.pos.x - rect.w / 2, rect.pos.y - rect.h / 2, rect.w, rect.h);
}
function clone(obj) {
    return structuredClone(obj);
}
function clearBackground() {
    if (ctx === null)
        return;
    ctx.fillStyle = GAME_BACKGROUND;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}
function renderPlayer(player) {
    drawRectangle(player.rect, PLAYER_COLOR);
}
function renderEnemy(enemy) {
    drawRectangle(enemy.rect, ENEMY_COLOR);
}
function renderBullet(bullet) {
    drawRectangle(bullet.rect, ENEMY_COLOR);
}
function renderGame(state) {
    clearBackground();
    renderPlayer(state.player);
}
function createPlayer(x, y, speed) {
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
    };
}
function createEnemy(x, y, speed) {
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
    };
}
function createBullet(x, y, speed) {
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
    };
}
function createEvents() {
    return {
        moveUp: false,
        moveDown: false,
        moveLeft: false,
        moveRight: false,
        shoot: false
    };
}
function loop(state) {
    setTimeout(() => {
        clearBackground();
        loop(state);
    }, 500);
}
function init() {
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
    ctx.translate(Math.floor((canvas.width - GAME_WIDTH) / 2), Math.floor((canvas.height - GAME_HEIGHT) / 2));
    let state = {
        player: createPlayer(100, 300, 25),
        enemies: [],
        bullets: [],
        events: createEvents()
    };
    loop(state);
}
init();
