# Functional Space Invaders (TypeScript)

A browser-based Space Invaders clone written in TypeScript using functional programming principles. Enemies spawn from the right and move left; shoot them before they reach you. Score goes up, levels get harder, you die when health hits zero.

**Controls:** Arrow keys to move, Space to shoot, R to restart.

## Running

```
npx tsc && open index.html
```

## Why It's Functional

The core game logic is structured around a single immutable `State` value that flows through the game loop. Nothing mutates in-place — every update returns a new value.

**Immutable state updates.** Every entity update uses object spread to produce a new value:
```ts
function updatePlayer(player: Player, events: Events) {
    return { ...player, rect: { ...player.rect, pos: movePlayer(player, events) } }
}
```

**Pure update functions.** `updateGame` takes a `State` and `Events` and returns a new `State` with no side effects. The render step is entirely separate from the logic step.

**Recursive game loop.** Instead of a `while(true)` loop with a mutable state variable, `loop` calls itself by passing the new state as an argument:
```ts
function loop(state: State, timestamp: number = 0): void {
    const newState = updateGame(state, { ...inputEvents });
    requestAnimationFrame((t) => loop(newState, t));
}
```

**Tuple returns for multi-value results.** Functions that need to return updated state alongside a derived value (cooldown, spawn timer, score) return tuples instead of mutating anything:
```ts
function updateBullets(...): [Bullet[], number]
function updateEnemies(...): [Enemy[], number]
function checkBulletEnemyCollisions(...): [Bullet[], Enemy[], number]
```

**Filter instead of delete.** Dead enemies and spent bullets are removed by filtering arrays, not by splicing or nulling entries:
```ts
.filter((e) => !e.isDead)
```

**Plain data types, no classes.** All entities (`Player`, `Enemy`, `Bullet`, `State`) are simple TypeScript types — records with no methods, no encapsulated mutation.

**`reduce` for collision resolution.** `checkBulletEnemyCollisions` uses `reduce` to fold enemy/bullet pairs into an accumulated result without any intermediate mutable state.

## Where It's Not (Browser Limitations)

The browser's APIs are inherently imperative, so a few things can't be made pure without significant extra machinery:

**Keyboard input is a mutable global.** `inputEvents` is a module-level object that `keydown`/`keyup` event listeners write to directly. There's no functional alternative here — the DOM event model is callback-based and gives you no way to pull input as a value. A fully pure approach would require an event stream abstraction (like RxJS) and still has to connect to the same imperative DOM underneath.

**`requestAnimationFrame` is a side effect.** The game loop drives itself by scheduling future callbacks. There's no pure way to do this; the browser owns the clock.

**Canvas rendering is all side effects.** Every `render*` function writes to `ctx`, a mutable `CanvasRenderingContext2D`. The canvas is a giant piece of mutable shared state — drawing is fundamentally a write operation, not a value.

**`lastTime` is a mutable global.** Frame-rate capping requires tracking when the last frame ran. This could be threaded through `loop` as an argument, but it's left as a module-level `let` for simplicity.

**`Math.random()` in enemy spawning.** Enemy Y position is randomized with `Math.random()`, which is impure (no seed, hidden state). A pure version would thread a PRNG seed through the state.

The pattern the code follows — pure logic core, effects pushed to the edges — is the practical way to apply FP in an environment like the browser. The `updateGame` function and everything it calls are pure and testable in isolation; only `loop`, the render functions, and the event listeners touch the outside world.
