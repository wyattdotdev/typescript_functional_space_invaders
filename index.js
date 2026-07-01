"use strict";
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const GAME_BACKGROUND = '#010101';
const RECT_HEIGHT = 10;
const RECT_WIDTH = 10;
const canvas = document.getElementById('game');
const ctx = canvas?.getContext('2d');
function drawRectangle(pos, w, h, color) {
    if (ctx === null)
        return;
    ctx.fillStyle = color;
    ctx.fillRect(pos.x, pos.y, w, h);
}
function clearBackground() {
    if (ctx === null)
        return;
    ctx.fillStyle = GAME_BACKGROUND;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}
let num = GAME_WIDTH / 2;
function loop(state) {
    setTimeout(() => {
        clearBackground();
        drawRectangle({ x: num, y: GAME_HEIGHT / 2 }, 10, 10, '#FFFFFF');
        num += 0.1;
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
    let state = { ctx };
    loop(state);
}
init();
