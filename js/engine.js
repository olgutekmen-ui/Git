<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Vyra: Neo-Seoul Grid Run (v1.4 Debug)</title>
    <style>
        body { margin: 0; overflow: hidden; background: #050510; font-family: 'Courier New', Courier, monospace; color: white; user-select: none; touch-action: none; }
        #game-container { position: relative; width: 100vw; height: 100vh; background: #000; overflow: hidden; }
        
        /* UI LAYERS */
        .ui-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10; display: none; }
        .visible { display: block !important; }
        
        /* HUD */
        .hud-element { position: absolute; padding: 10px; text-shadow: 0 0 5px #0ff; }
        #score-display { top: 20px; left: 20px; font-size: 24px; color: #00ffff; }
        #currency-display { top: 20px; left: 50%; transform: translateX(-50%); font-size: 24px; color: #ffd700; text-shadow: 0 0 10px #ffd700; }
        #flow-meter { position: absolute; top: 60px; left: 20px; width: 200px; height: 15px; background: rgba(0,0,0,0.5); border: 2px solid #555; transform: skewX(-20deg); }
        #flow-fill { width: 0%; height: 100%; background: #ff00ff; box-shadow: 0 0 10px #ff00ff; transition: width 0.1s linear; }
        #multiplier-display { top: 20px; right: 20px; font-size: 30px; color: #ff00ff; font-weight: bold; }
        
        /* MENUS */
        .menu-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 20; pointer-events: auto; }
        h1 { font-size: 40px; color: #00ffff; margin-bottom: 10px; text-shadow: 0 0 20px #00ffff; text-transform: uppercase; text-align: center; }
        
        .shop-container { display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; justify-content: center; }
        .shop-item { background: rgba(255, 255, 255, 0.1); border: 2px solid #555; padding: 15px; text-align: center; width: 140px; transition: 0.2s; cursor: pointer; }
        .shop-item:hover { border-color: #00ffff; background: rgba(0, 255, 255, 0.1); }
        .item-icon { font-size: 30px; margin-bottom: 5px; }
        .item-price { color: #ffd700; font-weight: bold; margin-top: 5px; font-size: 14px; }
        .item-desc { font-size: 10px; color: #aaa; margin-top: 5px; }
        
        button { padding: 15px 40px; font-size: 20px; background: #ff00ff; color: white; border: none; cursor: pointer; box-shadow: 0 0 20px #ff00ff; text-transform: uppercase; font-weight: bold; clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%); transition: transform 0.2s, background 0.2s; margin-top: 10px; }
        button:hover { background: #d000d0; transform: scale(1.05); }
        
        /* DEBUG LOG */
        #debug-log { width: 80%; height: 100px; overflow-y: scroll; background: rgba(0,0,0,0.5); border: 1px solid #333; font-size: 12px; color: #ccc; text-align: left; padding: 5px; margin-bottom: 20px; display: block;}
        .log-ok { color: #00ff00; }
        .log-err { color: #ff0055; }

        canvas { display: block; width: 100%; height: 100%; }
        .flow-active #flow-fill { background: #ffd700 !important; box-shadow: 0 0 20px #ffd700 !important; }
        .flow-active #flow-meter { border-color: #ffd700; }
        #beat-bar { position: absolute; bottom: 50px; left: 50%; transform: translateX(-50%); width: 60px; height: 60px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.1); transition: transform 0.05s; }
        .beat-hit { border-color: #00ffff !important; transform: translateX(-50%) scale(1.3) !important; box-shadow: 0 0 30px cyan; background: rgba(0, 255, 255, 0.2); }
    </style>
</head>
<body>

<div id="game-container">
    <canvas id="gameCanvas"></canvas>
    
    <div id="hud-layer" class="ui-layer">
        <div id="score-display">SCORE: 0</div>
        <div id="currency-display">💎 0</div>
        <div id="flow-meter"><div id="flow-fill"></div></div>
        <div id="flow-label" class="hud-element" style="top:78px; left:20px; font-size:12px; color:#aaa;">FLOW CHAIN</div>
        <div id="multiplier-display">x1.0</div>
        <div id="beat-bar"></div>
    </div>

    <div id="menu-layer" class="menu-overlay">
        <h1>VYRA: NEO-SEOUL</h1>
        
        <div id="debug-log">Initialize System...<br></div>
        
        <button id="force-start-btn" style="background: #ffaa00; font-size: 16px; padding: 10px 30px;">FORCE START (SKIP LOAD)</button>

        <div id="shop-area" style="display:none;">
            <h2>WALLET: <span id="menu-wallet" style="color:#ffd700">0</span> 💎</h2>
            <div class="shop-container">
                <div class="shop-item" id="btn-shield">
                    <div class="item-icon">🛡️</div>
                    <div class="item-name">START SHIELD</div>
                    <div class="item-price" id="price-shield">100 💎</div>
                    <div class="item-desc">Invincible Start</div>
                </div>
                <div class="shop-item" id="btn-trail">
                    <div class="item-icon">✨</div>
                    <div class="item-name">GHOST TRAIL</div>
                    <div class="item-price" id="price-trail">500 💎</div>
                    <div class="item-desc">Cyan Particle FX</div>
                </div>
            </div>
            <button id="reset-save-btn" style="font-size:10px; padding:5px; background:#555; box-shadow:none; margin-top:5px;">RESET SAVE DATA</button>
            <button id="start-btn">INITIATE RUN</button>
        </div>
    </div>
    
    <div id="gameover-layer" class="menu-overlay" style="display:none;">
        <h1 style="color:#ff0055">SYSTEM CRASH</h1>
        <p id="gameover-stats" style="text-align:center; color:#fff;"></p>
        <button id="return-btn">RETURN TO HUB</button>
    </div>
</div>

<script>
    // --- UTILS ---
    function log(msg, type='') {
        const d = document.getElementById('debug-log');
        d.innerHTML += `<span class="${type}">${msg}</span><br>`;
        d.scrollTop = d.scrollHeight;
    }

    // --- 1. STATE ---
    const State = {
        isPlaying: false, score: 0, distance: 0, flowMultiplier: 1.0, flowCharge: 0,
        isFlowState: false, gameSpeed: 6.0, runAurum: 0,
        LANE_WIDTH_BASE: 140, PLAYER_Z_DEPTH: 100,
        player: { lane: 1, state: 'RUN', animTimer: 0, invulnerable: false },
        activeBoosts: { shield: false },
        obstacles: [], particles: [], texts: []
    };

    // --- 2. ECONOMY ---
    const Economy = {
        data: { aurum: 0, unlockedTrail: false },
        init() {
            try {
                const saved = localStorage.getItem('vyraData');
                if(saved) this.data = JSON.parse(saved);
            } catch (e) { this.resetSave(); }
            this.updateUI();
        },
        save() { localStorage.setItem('vyraData', JSON.stringify(this.data)); this.updateUI(); },
        resetSave() { this.data = { aurum: 0, unlockedTrail: false }; this.save(); },
        updateUI() {
            const walletEl = document.getElementById('menu-wallet');
            if(walletEl) walletEl.innerText = this.data.aurum;
            this.updateButton('price-shield', 100, false, "EQUIPPED", State.activeBoosts.shield);
            this.updateButton('price-trail', 500, this.data.unlockedTrail, "OWNED", false);
        },
        updateButton(id, cost, isOwned, ownedText, isEquipped) {
            const el = document.getElementById(id); if(!el) return;
            if (isEquipped) { el.innerText = "EQUIPPED"; el.style.color = "#00ff00"; return; }
            if (isOwned) { el.innerText = ownedText; el.style.color = "#00ff00"; } 
            else { el.innerText = `${cost} 💎`; el.style.color = this.data.aurum >= cost ? "#ffd700" : "#555"; }
        },
        buyShield() { if (!State.activeBoosts.shield && this.data.aurum >= 100) { this.data.aurum -= 100; State.activeBoosts.shield = true; this.save(); }},
        buyTrail() { if (!this.data.unlockedTrail && this.data.aurum >= 500) { this.data.aurum -= 500; this.data.unlockedTrail = true; this.save(); }}
    };

    // --- 3. ASSETS ---
    const Assets = { images: {}, loadedCount: 0, total: 7 };
    
    // SYNTH AUDIO (NO FILES)
    const AudioSys = {
        ctx: null, masterGain: null, isPlaying: false, sequencerTimer: null, noteIndex: 0,
        bassLine: [65.41, 65.41, 77.78, 65.41, 51.91, 51.91, 58.27, 58.27], 
        init() {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.3; 
            this.masterGain.connect(this.ctx.destination);
        },
        playTone(freq, type, duration, vol=1) {
            if(!this.ctx) return;
            const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
            osc.type = type; osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
            osc.connect(gain); gain.connect(this.masterGain);
            osc.start(); osc.stop(this.ctx.currentTime + duration);
        },
        playJump() { if(!this.ctx)return; this.playTone(150, 'sawtooth', 0.2, 0.5); },
        playCollect() { if(!this.ctx)return; this.playTone(880, 'sine', 0.1, 0.5); setTimeout(()=>this.playTone(1760,'sine',0.1,0.3),50); },
        playCrash() { if(!this.ctx)return; this.playTone(100, 'sawtooth', 0.3, 0.8); this.playTone(50, 'square', 0.4, 0.8); },
        startMusic() {
            if(this.isPlaying || !this.ctx) return;
            this.isPlaying = true; this.noteIndex = 0;
            const playStep = () => {
                if(!State.isPlaying) return;
                const freq = this.bassLine[this.noteIndex % this.bassLine.length];
                this.playTone(freq, 'sawtooth', 0.15, 0.4);
                if (this.noteIndex % 2 === 0) this.playTone(10000, 'square', 0.05, 0.05); // Hat
                if (this.noteIndex % 4 === 0) this.playTone(100, 'sine', 0.1, 1); // Kick
                this.noteIndex++;
                let speedAdj = Math.max(100, 250 - (State.gameSpeed * 10));
                this.sequencerTimer = setTimeout(playStep, speedAdj);
            };
            playStep();
        },
        stopMusic() { this.isPlaying = false; clearTimeout(this.sequencerTimer); }
    };

    function loadGameAssets(onComplete) {
        log("Starting Asset Load...");
        
        const check = () => {
            Assets.loadedCount++;
            if (Assets.loadedCount >= Assets.total) {
                log("All Assets Loaded!", "log-ok");
                onComplete();
            }
        };
        const loadImg = (key, src) => {
            log(`Loading: ${src}...`);
            Assets.images[key] = new Image();
            Assets.images[key].src = src;
            Assets.images[key].onload = () => { log(`[OK] ${src}`, "log-ok"); check(); };
            Assets.images[key].onerror = () => { log(`[FAIL] ${src}`, "log-err"); check(); };
        };

        // LOAD LIST
        loadImg('player', 'assets/images/player.png');
        loadImg('bg', 'assets/images/bg.png');
        loadImg('energy', 'assets/images/aurum.png'); 
        loadImg('enemy1', 'assets/images/enemy1.jpg');
        loadImg('enemy2', 'assets/images/enemy2.jpg');
        loadImg('enemy3', 'assets/images/enemy3.jpg');
        loadImg('enemy4', 'assets/images/enemy4.jpg');
    }

    // --- 4. ENGINE ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let lastTime = 0, beatTimer = 0;
    const BPM = 120, BEAT_INTERVAL = 60 / BPM * 1000;

    function initGame() {
        resize();
        window.addEventListener('resize', resize);
        Economy.init();
        initInput();

        // Bind Buttons
        document.getElementById('start-btn').addEventListener('click', startGame);
        document.getElementById('force-start-btn').addEventListener('click', forceStart); // NEW
        document.getElementById('return-btn').addEventListener('click', returnToMenu);
        document.getElementById('btn-shield').addEventListener('click', () => Economy.buyShield());
        document.getElementById('btn-trail').addEventListener('click', () => Economy.buyTrail());
        document.getElementById('reset-save-btn').addEventListener('click', () => Economy.resetSave());

        loadGameAssets(() => {
            showShop();
        });
    }

    function showShop() {
        document.getElementById('force-start-btn').style.display = 'none'; // Hide force button if success
        document.getElementById('shop-area').style.display = 'block';
        Economy.updateUI();
    }

    function forceStart() {
        log("FORCE START TRIGGERED", "log-err");
        showShop();
    }

    function startGame() {
        document.getElementById('start-btn').blur();
        document.getElementById('menu-layer').style.display = 'none';
        document.getElementById('gameover-layer').style.display = 'none';
        document.getElementById('hud-layer').classList.add('visible');
        
        AudioSys.init();
        AudioSys.startMusic();
        
        State.isPlaying = true;
        resetGame();
        lastTime = performance.now();
        requestAnimationFrame(loop);
    }

    function resetGame() {
        State.score = 0; State.distance = 0; State.flowMultiplier = 1.0; State.flowCharge = 0; 
        State.runAurum = 0; State.isFlowState = false;
        
        if (State.activeBoosts.shield) {
            activateFlowState();
            spawnFloatingText("SHIELD ACTIVE", "#00ff00");
            State.activeBoosts.shield = false;
        } else {
            State.player.invulnerable = false;
            document.getElementById('hud-layer').classList.remove('flow-active');
        }

        State.gameSpeed = 6; State.obstacles = []; State.particles = []; 
        State.player.lane = 1; State.player.state = 'RUN';
        updateHUD();
    }

    function loop(timestamp) {
        if (!State.isPlaying) return;
        try {
            let dt = timestamp - lastTime;
            lastTime = timestamp;
            updatePhysics();
            beatTimer += dt;
            if (beatTimer > BEAT_INTERVAL) { beatTimer = 0; triggerBeat(); }
            render();
            requestAnimationFrame(loop);
        } catch (e) { console.error(e); State.isPlaying = false; }
    }

    function updatePhysics() {
        State.distance += State.gameSpeed * 0.1;
        State.score += (State.gameSpeed * 0.1) * (State.flowMultiplier * (State.isFlowState ? 2 : 1));

        if (State.isFlowState) {
            State.flowCharge -= 0.3;
            if (State.flowCharge <= 0) deactivateFlowState();
        }

        if (State.player.state !== 'RUN') {
            State.player.animTimer--;
            if (State.player.animTimer <= 0) State.player.state = 'RUN';
        }

        for (let i = State.obstacles.length - 1; i >= 0; i--) {
            let obs = State.obstacles[i];
            obs.z -= State.gameSpeed;
            let zNear = State.PLAYER_Z_DEPTH - 30;
            let zFar = State.PLAYER_Z_DEPTH + 30;
            if (obs.z < zFar && obs.z > zNear && !obs.hit) {
                if (obs.lane === State.player.lane) checkCollision(obs);
            }
            if (obs.z < -200) State.obstacles.splice(i, 1);
        }
        
        State.particles.forEach((p, i) => { p.life--; p.x += p.vx; p.y += p.vy; if (p.life<=0) State.particles.splice(i,1); });
        State.texts.forEach((t, i) => { t.y -= 1; t.life--; if (t.life<=0) State.texts.splice(i,1); });
        updateHUD();
    }

    function checkCollision(obs) {
        if (obs.type === 'ENERGY') {
            obs.hit = true; obs.visible = false; collectEnergy(); return;
        }
        if (State.isFlowState) {
            obs.hit = true; obs.visible = false;
            spawnParticles(0, 0, 10, '#ffd700'); spawnFloatingText("SMASH!", "#ffd700");
            AudioSys.playCrash();
            State.score += 500; return; 
        }
        if (State.player.state === 'JUMP') { spawnFloatingText("DODGE!", "#00ff00"); return; }
        
        shakeScreen(); 
        spawnFloatingText("CRASH!", "#ff0000"); 
        AudioSys.playCrash();
        gameOver(); 
    }

    function collectEnergy() {
        State.runAurum += 10;
        AudioSys.playCollect();
        if (State.isFlowState) { State.flowCharge = Math.min(100, State.flowCharge + 5); State.score += 200; }
        else {
            State.flowCharge += 15; spawnFloatingText("PULSE +", "#00ffff");
            spawnParticles(0, 0, 5, '#00ffff'); State.score += 100;
            if (State.flowCharge >= 100) activateFlowState();
        }
        State.flowMultiplier = Math.min(10.0, State.flowMultiplier + 0.1);
    }

    function activateFlowState() {
        State.isFlowState = true; State.flowCharge = 100; State.player.invulnerable = true; State.gameSpeed += 5;
        document.getElementById('hud-layer').classList.add('flow-active');
        spawnFloatingText("FLOW STATE", "#ffd700");
    }

    function deactivateFlowState() {
        State.isFlowState = false; State.flowCharge = 0; State.player.invulnerable = false;
        State.gameSpeed = Math.max(6, State.gameSpeed - 5);
        document.getElementById('hud-layer').classList.remove('flow-active');
        spawnFloatingText("FLOW ENDED", "#cccccc");
    }

    function gameOver() {
        State.isPlaying = false;
        AudioSys.stopMusic();
        Economy.data.aurum += State.runAurum;
        Economy.save();
        document.getElementById('hud-layer').classList.remove('visible');
        document.getElementById('gameover-layer').style.display = 'flex';
        document.getElementById('gameover-stats').innerHTML = `SCORE: ${Math.floor(State.score)}<br>DISTANCE: ${Math.floor(State.distance)}m<br><span style="color:#ffd700">COLLECTED: ${State.runAurum} 💎</span>`;
    }

    function returnToMenu() {
        document.getElementById('gameover-layer').style.display = 'none';
        document.getElementById('menu-layer').style.display = 'flex';
        Economy.updateUI();
    }

    function triggerBeat() {
        const beatBar = document.getElementById('beat-bar');
        if(beatBar) { beatBar.classList.add('beat-hit'); setTimeout(() => beatBar.classList.remove('beat-hit'), 100); }
        if (Math.random() > 0.8) return; 
        let lanes = [0, 1, 2].sort(() => Math.random() - 0.5);
        let count = Math.random() < 0.3 ? 2 : 1; 
        for (let i = 0; i < count; i++) {
            let type = Math.random() < 0.4 ? 'ENERGY' : 'ENEMY';
            State.obstacles.push({ lane: lanes[i], type: type, subType: Math.floor(Math.random()*4)+1, z: 2000, hit: false, visible: true });
        }
        if (!State.isFlowState) State.gameSpeed += 0.002;
    }

    // --- 5. INPUT & RENDER ---
    function initInput() {
        document.addEventListener('keydown', (e) => {
            if (!State.isPlaying) return;
            if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) { e.preventDefault(); }
            switch(e.key) {
                case 'ArrowLeft': case 'a': case 'A': changeLane(-1); break;
                case 'ArrowRight': case 'd': case 'D': changeLane(1); break;
                case 'ArrowUp': case 'w': case 'W': doJump(); break;
                case 'ArrowDown': case 's': case 'S': doSlide(); break;
            }
        });
        let tsX=0, tsY=0;
        document.addEventListener('touchstart', e => { tsX = e.changedTouches[0].screenX; tsY = e.changedTouches[0].screenY; }, {passive:false});
        document.addEventListener('touchend', e => {
            let teX = e.changedTouches[0].screenX; let teY = e.changedTouches[0].screenY;
            if (!State.isPlaying) return;
            let dx = teX - tsX; let dy = teY - tsY;
            if (Math.abs(dx) > Math.abs(dy)) { if (Math.abs(dx) > 30) changeLane(dx > 0 ? 1 : -1); }
            else { if (Math.abs(dy) > 30) { if (dy > 0) doSlide(); else doJump(); } }
        }, {passive:false});
    }

    function changeLane(dir) {
        let target = State.player.lane + dir;
        if (target >= 0 && target <= 2) {
            State.player.lane = target;
            let color = Economy.data.unlockedTrail ? '#00ffff' : '#ff00ff';
            spawnParticles(0, 0, 5, color);
        }
    }
    function doJump() { if(State.player.state==='RUN') { State.player.state='JUMP'; State.player.animTimer=45; AudioSys.playJump(); } }
    function doSlide() { if(State.player.state==='RUN') { State.player.state='SLIDE'; State.player.animTimer=35; } }

    function resize() {
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        let cy = canvas.height / 2; let horizonY = cy - 50;
        let playerScreenY = canvas.height - 130;
        let maxDepthHeight = canvas.height - horizonY;
        let targetScale = (playerScreenY - horizonY) / maxDepthHeight;
        State.PLAYER_Z_DEPTH = (500 / targetScale) - 500;
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // BG
        if (Assets.images.bg && Assets.images.bg.complete && Assets.images.bg.naturalWidth > 0) {
            ctx.save(); ctx.globalAlpha = 0.4;
            ctx.drawImage(Assets.images.bg, 0, 0, canvas.width, canvas.height); ctx.restore();
        } else { ctx.fillStyle = '#0a0a20'; ctx.fillRect(0,0, canvas.width, canvas.height); }
        // Grid
        let cx = canvas.width / 2; let cy = canvas.height / 2; let horizonY = cy - 50;
        ctx.strokeStyle = State.isFlowState ? '#ffd700' : '#c000ff'; 
        ctx.lineWidth = 2; ctx.shadowBlur = State.isFlowState ? 20 : 15; ctx.shadowColor = ctx.strokeStyle;
        for (let i = -1.5; i <= 1.5; i++) { 
            let x1 = cx + (i * State.LANE_WIDTH_BASE * 2); let y1 = canvas.height;
            let x2 = cx + (i * 10); let y2 = horizonY;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }
        let offset = (State.distance % 100) / 100; 
        for (let i = 0; i < 10; i++) {
            let p = (i + offset) / 10; 
            let y = horizonY + (canvas.height - horizonY) * (p * p * p); 
            ctx.globalAlpha = p; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }
        ctx.globalAlpha = 1.0; ctx.shadowBlur = 0;

        // Entities
        let sortedObs = [...State.obstacles].sort((a, b) => b.z - a.z);
        sortedObs.forEach(obs => {
            if (!obs.visible) return;
            let scale = 500 / (obs.z + 500); if (scale < 0) scale = 0;
            let laneOffset = (obs.lane - 1) * State.LANE_WIDTH_BASE * 4; 
            let screenX = cx + (laneOffset * scale * 0.5); 
            let groundY = horizonY + ((canvas.height - horizonY) * scale);
            let size = 100 * scale;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.beginPath(); ctx.ellipse(screenX, groundY, size * 0.6, size * 0.2, 0, 0, Math.PI * 2); ctx.fill();
            let drawY = groundY - size;
            if (obs.type === 'ENERGY') {
                let spin = Math.sin(Date.now() / 200); 
                let w = size * Math.abs(spin); let h = size;
                if (Assets.images.energy && Assets.images.energy.complete && Assets.images.energy.naturalWidth > 0) {
                    ctx.save(); ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 20;
                    ctx.drawImage(Assets.images.energy, screenX - w/2, groundY - h - 10, w, h); ctx.restore();
                } else { ctx.fillStyle = '#00ffff'; ctx.beginPath(); ctx.arc(screenX, groundY - size/2, size/3, 0, Math.PI*2); ctx.fill(); }
            } else { 
                let enemyImg = Assets.images['enemy' + obs.subType];
                if (enemyImg && enemyImg.complete && enemyImg.naturalWidth > 0) {
                    ctx.save(); ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 10;
                    ctx.drawImage(enemyImg, screenX - size/2, drawY, size, size); ctx.restore();
                } else { ctx.fillStyle = '#ff0000'; ctx.fillRect(screenX - size/2, drawY, size, size); }
            }
        });

        // Player
        let laneOffset = (State.player.lane - 1) * State.LANE_WIDTH_BASE * 2;
        let px = cx + laneOffset;
        let py = canvas.height - 150;
        let size = 120; let squash = 1.0;
        if (State.player.state === 'JUMP') { py -= 100; }
        if (State.player.state === 'SLIDE') { squash = 0.5; py += 50; }
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath(); ctx.ellipse(px, canvas.height - 130, 60, 20, 0, 0, Math.PI*2); ctx.fill();
        if (State.isFlowState) { ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(px, py - 40, 80, 0, Math.PI*2); ctx.stroke(); }
        if (Assets.images.player && Assets.images.player.complete && Assets.images.player.naturalWidth > 0) {
            ctx.save(); ctx.shadowColor = State.isFlowState ? '#ffd700' : '#00ff00'; ctx.shadowBlur = 20;
            let drawH = size * squash;
            ctx.drawImage(Assets.images.player, px - size/2, py - drawH, size, drawH); ctx.restore();
        } else { ctx.fillStyle = '#aa00ff'; ctx.fillRect(px - 30, py - 60, 60, 60); }
        
        // Particles/Text
        State.particles.forEach(p => {
            ctx.fillStyle = p.color; ctx.beginPath();
            let ppx = cx + (State.player.lane - 1) * 200; 
            ctx.arc(ppx + p.x, (canvas.height - 100) + p.y, p.size, 0, Math.PI*2); ctx.fill();
        });
        State.texts.forEach(t => { 
            ctx.font = "bold 24px Courier New"; ctx.textAlign = "center"; ctx.fillStyle = t.color;
            let ppx = cx + (State.player.lane - 1) * State.LANE_WIDTH_BASE * 2;
            ctx.fillText(t.msg, ppx, (canvas.height - 150) + t.y); 
        });
    }

    function spawnParticles(x, y, count, color) {
        for(let i=0; i<count; i++) {
            State.particles.push({ x: x, y: y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, life: 20, size: Math.random()*5, color: color });
        }
    }
    function spawnFloatingText(msg, color) { State.texts.push({ msg: msg, color: color, y: -50, life: 30 }); }
    function shakeScreen() { canvas.style.transform = `translate(${Math.random()*10-5}px, ${Math.random()*10-5}px)`; setTimeout(() => canvas.style.transform = 'none', 200); }
    function updateHUD() {
        document.getElementById('score-display').innerText = `SCORE: ${Math.floor(State.score)}`;
        document.getElementById('currency-display').innerText = `💎 ${State.runAurum}`;
        document.getElementById('multiplier-display').innerText = `x${State.flowMultiplier.toFixed(1)}`;
        document.getElementById('flow-fill').style.width = `${State.flowCharge}%`;
    }

    initGame();
</script>
</body>
</html>