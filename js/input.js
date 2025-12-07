import { State } from './state.js';
import { Economy } from './economy.js';

export function initInput(spawnParticles) {
    // --- KEYBOARD ---
    document.addEventListener('keydown', (e) => {
        handleInput(e.key);
    });

    // --- MOBILE TOUCH SWIPES ---
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, {passive: false});

    document.addEventListener('touchend', (e) => {
        let touchEndX = e.changedTouches[0].screenX;
        let touchEndY = e.changedTouches[0].screenY;
        handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
    }, {passive: false});

    function handleSwipe(sx, sy, ex, ey) {
        if (!State.isPlaying) return;
        
        let dx = ex - sx;
        let dy = ey - sy;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal Swipe
            if (Math.abs(dx) > 30) { // Threshold
                changeLane(dx > 0 ? 1 : -1);
            }
        } else {
            // Vertical Swipe
            if (Math.abs(dy) > 30) {
                if (dy > 0) doSlide(); // Swipe Down
                else doJump();         // Swipe Up
            }
        }
    }

    function handleInput(key) {
        if (!State.isPlaying) return;
        switch(key) {
            case 'ArrowLeft': case 'a': case 'A': changeLane(-1); break;
            case 'ArrowRight': case 'd': case 'D': changeLane(1); break;
            case 'ArrowUp': case 'w': case 'W': doJump(); break;
            case 'ArrowDown': case 's': case 'S': doSlide(); break;
        }
    }

    function changeLane(dir) {
        let target = State.player.lane + dir;
        if (target >= 0 && target <= 2) {
            State.player.lane = target;
            let color = Economy.data.unlockedTrail ? '#00ffff' : '#ff00ff';
            spawnParticles(0, 0, 5, color);
        }
    }

    function doJump() {
        if (State.player.state === 'RUN') {
            State.player.state = 'JUMP';
            State.player.animTimer = 45;
        }
    }

    function doSlide() {
        if (State.player.state === 'RUN') {
            State.player.state = 'SLIDE';
            State.player.animTimer = 35;
        }
    }
}