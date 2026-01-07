// ---------------- Firebase Setup ----------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAGySg8cLaHi3Mbs14nnunceEVk6MJX1Q4",
  authDomain: "evoz-e2636.firebaseapp.com",
  projectId: "evoz-e2636",
  storageBucket: "evoz-e2636.firebasestorage.app",
  messagingSenderId: "73987614644",
  appId: "1:73987614644:web:d8ca7579201375ba1fb4e1",
  measurementId: "G-082SPJTC6T"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ---------------- Canvas ----------------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --------- WORLD SIZE ---------
const WORLD_WIDTH = 1600;  // total map width
const WORLD_HEIGHT = 1600; // total map height


// ---------------- Player ----------------
const player = {
    x: canvas.width / 4,
    y: canvas.height / 4,
    size: 5,
       // visual size
    actualSize: 5, // growth tracker
    minSize: 5,
    baseColor: '#00ff00',
    color: '#00ff00',
    speed: 2,
    xp: 0,
    level: 1,
    skillPoints: 0,
    bullets: [],
    fireRate: 750,
    lastShot: 0,
    shield: false,
    pulse: 0,
    hp: 100,
    maxHp: 100,
    explosion: false,
    heal: false
};

// ---------------- Enemies ----------------
const enemies = [];
const ELITE_CHANCE = 0.12;

const eliteModifiers = [
    { name: 'fast', speedMult: 1.6, color: '#ffffff', xpMult: 2 },
    { name: 'tank', sizeMult: 1.8, speedMult: 0.7, xpMult: 3 },
    { name: 'exploder', explodeOnDeath: true, xpMult: 2.5 }
];

let boss = null;
let lastBossLevel = 0;
const enemyTypes = [


    { color:'#ff0000', baseSize:4, speed:1.5, xp:5, type:'basic' },
    { color:'#ff8800', baseSize:6, speed:1, xp:10, type:'slow' },
    { color:'#ff00ff', baseSize:3, speed:2, xp:7, type:'fast' },
    { color:'#00ffff', baseSize:5, speed:1.2, xp:12, type:'shooter', shootRate: 2000 },
    { color:'#ffff00', baseSize:7, speed:0.8, xp:15, type:'tank', shield:true }
];

// ---------------- Skills ----------------
const skillsList = [
    { name:'Rapid Fire', unlockedAt:2, effect:()=>{ player.fireRate = Math.max(50, player.fireRate*0.85); }, level:0 },
    { name:'Shield', unlockedAt:3, effect:()=>{ player.shield = true; }, level:0 },
    { name:'Speed Boost', unlockedAt:4, effect:()=>{ player.speed += 0.5; }, level:0 },
    { name:'Explosion', unlockedAt:5, effect:()=>{ player.explosion = true; }, level:0 },
    { name:'Heal', unlockedAt:6, effect:()=>{ player.heal = true; }, level:0 },
    { name:'Bigger Shield', unlockedAt:10, effect:()=>{ player.shieldSize = (player.shieldSize||10)+5; }, level:0 }
];

// ---------------- Game Variables ----------------
let keys = {};
let gameOver = false;
const explosions = [];
const heals = [];
let lastPowerStage = 0;
let powerStage = 0;

const powerStages = [
    { bg:'#00131f', aura:'#00ffcc', glow:15 },
    { bg:'#001f3f', aura:'#00ffff', glow:20 },
    { bg:'#002a4d', aura:'#00ff88', glow:25 },
    { bg:'#1a0033', aura:'#cc00ff', glow:30 },
    { bg:'#330000', aura:'#ff3300', glow:35 },
    { bg:'#331a00', aura:'#ffaa00', glow:45 },
    { bg:'#000000', aura:'#ffffff', glow:60 } // GOD MODE
];

// ---------------- Camera ----------------
const camera = {
    x: 0,
    y: 0,
    zoom: 2,
    minZoom: 1.0
};

// ---------------- Camera Update ----------------
function updateCamera() {
    // Zoom based on player size
    camera.zoom = Math.max(camera.minZoom, 2 - (player.actualSize - 5) * 0.03);

    // Target camera position (centered on player)
    const targetX = player.x - canvas.width / (2 * camera.zoom);
    const targetY = player.y - canvas.height / (2 * camera.zoom);

    // Smooth camera movement (optional, for nice feel)
    const lerpFactor = 0.2;
    camera.x += (targetX - camera.x) * lerpFactor;
    camera.y += (targetY - camera.y) * lerpFactor;

    // Clamp so camera doesn't show outside the world
    const maxX = WORLD_WIDTH - canvas.width / camera.zoom;
    const maxY = WORLD_HEIGHT - canvas.height / camera.zoom;
    camera.x = Math.max(0, Math.min(camera.x, maxX));
    camera.y = Math.max(0, Math.min(camera.y, maxY));
}


// ---------------- Background ----------------
let bgParticles = [];
const BG_PARTICLE_COUNT = 200;
function generateBackground() {
    bgParticles = [];
    const stage = powerStages[powerStage % powerStages.length];
    const halfSpread = 2000; // how far particles can be from player

    for (let i = 0; i < BG_PARTICLE_COUNT; i++) {
        bgParticles.push({
            x: player.x + (Math.random() - 0.5) * halfSpread,
            y: player.y + (Math.random() - 0.5) * halfSpread,
            size: Math.random() * 2 + 1,
            dx: (Math.random() - 0.5) * 0.4,
            dy: (Math.random() - 0.5) * 0.4,
            alpha: Math.random() * 0.4 + 0.1,
            color: stage.aura
        });
    }

    document.body.style.background = stage.bg;
}

generateBackground();

// ---------------- Event Listeners ----------------
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    // Skill shortcuts 1-6
    if(!gameOver){
        if(e.key >= '1' && e.key <= '6'){
            const skillIndex = parseInt(e.key)-1;
            const skill = skillsList[skillIndex];
            if(skill && player.skillPoints>0 && player.level >= skill.unlockedAt){
                skill.level++;
                player.skillPoints--;
                skill.effect();
                updateUI();
            }
        }
    }
    if(gameOver && e.key.toLowerCase() === 'r') restartGame();
});
document.addEventListener('keyup', e => keys[e.key] = false);

let mouse = { x: canvas.width/2, y: canvas.height/2 };
canvas.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / camera.zoom) + camera.x;
    mouse.y = (e.clientY / camera.zoom) + camera.y;
});
canvas.addEventListener('mousedown', shootBullet);

// ---------------- Bullets ----------------
function shootBullet() {
    if(gameOver) return;
    const now = Date.now();
    if (now - player.lastShot < player.fireRate) return;
    player.lastShot = now;

    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    player.bullets.push({
        x: player.x,
        y: player.y,
        dx: Math.cos(angle) * 7,
        dy: Math.sin(angle) * 7,
        size: 4,
        life: 3000,
        color: '#fff'
    });
}

// ---------------- Enemy Spawning ----------------
function spawnEnemy() {
    if(gameOver) return;
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    let x, y;
    do {
        x = player.x + (Math.random()-0.5)*800;
        y = player.y + (Math.random()-0.5)*600;
    } while(Math.hypot(x - player.x, y - player.y) < 200);

    const growthFactor = Math.floor(player.actualSize/10); // enemies grow with player
    
    const isElite = Math.random() < ELITE_CHANCE;
    let elite = null;
    if(isElite) elite = eliteModifiers[Math.floor(Math.random()*eliteModifiers.length)];
    enemies.push({
        isElite,
        elite,

        x, y,
        size: type.baseSize + growthFactor,
        speed: type.speed,
        color: type.color,
        type: type.type,
        xp:type.xp,
        shootRate: type.shootRate || 0,
        lastShot: 0,
        shield: type.shield || false,
        pulse: Math.random()*Math.PI*2
    });
}

// ---------------- Explosion Helper ----------------
function createExplosion(x, y, size) {
    explosions.push({ x, y, size, life: 300 });

    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const dist = Math.hypot(e.x - x, e.y - y);

        if (dist <= size * 1.2 && !e.killedByPlayer) {
            // Only award XP if player caused explosion
            e.killedByPlayer = true;
            player.xp += e.xp;

            const requiredXP = player.level * 10;
            while (player.xp >= requiredXP) {
                player.xp -= requiredXP;
                player.skillPoints++;
                player.level++;
            }

            enemies.splice(i, 1);
        }
    }
}


// ---------------- Heal Visual Helper ----------------
function createHealEffect(){
    heals.push({x:player.x, y:player.y, size: player.size+5, life:500});
}

// ---------------- Game Logic ----------------
function update() {
    if(gameOver) return;

// Player movement
if(keys['w'] || keys['ArrowUp']) player.y -= player.speed;
if(keys['s'] || keys['ArrowDown']) player.y += player.speed;
if(keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
if(keys['d'] || keys['ArrowRight']) player.x += player.speed;

    player.pulse += 0.05;
	
// Clamp player inside world boundaries
player.x = Math.max(player.size, Math.min(WORLD_WIDTH - player.size, player.x));
player.y = Math.max(player.size, Math.min(WORLD_HEIGHT - player.size, player.y));

// Update camera AFTER player moves
updateCamera();



    // Shooting
    if(keys[' ']) shootBullet();

    const now = Date.now();

    // Update bullets
    for(let i = player.bullets.length-1; i>=0; i--){
        const b = player.bullets[i];
        b.x += b.dx;
        b.y += b.dy;
        b.life -= 16;
        if(b.life <= 0){ player.bullets.splice(i,1); continue; }

        
        if(boss){
            const db = Math.hypot(b.x - boss.x, b.y - boss.y);
            if(db < b.size + boss.size){
                boss.hp -= 20;
                player.bullets.splice(i,1);
                if(boss.hp <= 0){
                    player.xp += 200;
                    boss = null;
                }
                break;
            }
        }

        // Bullet-enemy collision
        for (let j = enemies.length - 1; j >= 0; j--) {
    const e = enemies[j];
    const dist = Math.hypot(b.x - e.x, b.y - e.y);

    if (b.owner !== 'enemy' && dist < b.size + e.size && !e.killedByPlayer) {
        e.killedByPlayer = true; // mark as player-killed
        player.xp += e.xp;

        // Level up logic
        const requiredXP = player.level * 10;
        while (player.xp >= requiredXP) {
            player.xp -= requiredXP;
            player.skillPoints++;
            player.level++;
        }

        // Optional visual growth
        const growthFactor = 0;
        player.actualSize += growthFactor;

        updateUI();

        if (player.explosion) createExplosion(e.x, e.y, e.size * 2);
        if (player.heal) createHealEffect();

        enemies.splice(j, 1);
        player.bullets.splice(i, 1);
        break;
    }
}


    }

    // ---------------- Update enemies ----------------
for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.pulse += 0.05;

    // Freeze visual growth
    const scaleFactor = 0;
    e.size = enemyTypes.find(t => t.type === e.type).baseSize + scaleFactor;

    // Move enemy
    const angle = Math.atan2(player.y - e.y, player.x - e.x);
    const sm = e.isElite && e.elite?.speedMult ? e.elite.speedMult : 1;
    e.x += Math.cos(angle) * e.speed * sm;
    e.y += Math.sin(angle) * e.speed;

    // Shooter behavior
    if (e.type === 'shooter') {
        if (Date.now() - e.lastShot > e.shootRate) {
            e.lastShot = Date.now();
            const a = Math.atan2(player.y - e.y, player.x - e.x);
            player.bullets.push({
    x: e.x,
    y: e.y,
    dx: Math.cos(a) * 5,
    dy: Math.sin(a) * 5,
    size: 3,
    color: e.color,
    life: 3000,
    owner: 'enemy'
});

        }
    }

    // Player collision
    const distPlayer = Math.hypot(player.x - e.x, player.y - e.y);
    if (distPlayer < player.size + e.size) {
        player.size -= 1;
        if (player.size <= player.minSize) endGame();
    }

    // Remove enemies that leave the world WITHOUT giving XP
    if (e.x < 0 || e.x > WORLD_WIDTH || e.y < 0 || e.y > WORLD_HEIGHT) {
        enemies.splice(i, 1); // XP is never awarded here
        continue; // skip further logic for this enemy
    }
}



    
    if(boss){
        boss.pulse += 0.03;
        const a = Math.atan2(player.y - boss.y, player.x - boss.x);
        boss.x += Math.cos(a) * boss.speed;
        boss.y += Math.sin(a) * boss.speed;
        if(now - boss.lastShot > boss.shootRate){
            boss.lastShot = now;
            player.bullets.push({x:boss.x,y:boss.y,dx:Math.cos(a)*6,dy:Math.sin(a)*6,size:6,color:'#ff6666',life:4000});
        }
    }

// Spawn enemies
    if(Math.random()<0.03) spawnEnemy();

    // Every 10 levels: reset visual player size and background
    const newStage = Math.floor(player.level / 10);

    if(player.level % 10 === 0 && player.level !== lastBossLevel){
        spawnBoss();
        lastBossLevel = player.level;
    }

if(newStage > powerStage){
    powerStage = newStage;
    lastPowerStage = player.level;

    player.color = powerStages[powerStage % powerStages.length].aura;
    generateBackground();
}

    // Update explosions and heals
    explosions.forEach((ex, idx)=>{ ex.life -= 16; if(ex.life <= 0) explosions.splice(idx,1); });
    heals.forEach((h, idx)=>{ h.life -=16; if(h.life <=0) heals.splice(idx,1); });
}

// ---------------- Draw ----------------
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();
ctx.scale(camera.zoom, camera.zoom);
ctx.translate(-camera.x, -camera.y);


    // Grid
    const gridSize = 50;
    const startX = Math.floor((camera.x - 50)/gridSize)*gridSize;
    const startY = Math.floor((camera.y - 50)/gridSize)*gridSize;
    const endX = startX + canvas.width/camera.zoom + gridSize*2;
    const endY = startY + canvas.height/camera.zoom + gridSize*2;
    ctx.strokeStyle = 'rgba(0,50,50,0.3)';
    ctx.lineWidth = 1;
    for(let x=startX; x<=endX; x+=gridSize){ ctx.beginPath(); ctx.moveTo(x,startY); ctx.lineTo(x,endY); ctx.stroke(); }
    for(let y=startY; y<=endY; y+=gridSize){ ctx.beginPath(); ctx.moveTo(startX,y); ctx.lineTo(endX,y); ctx.stroke(); }

   // Background particles (infinite, parallax)
const parallax = 0.25;
const halfSpread = 2000;

bgParticles.forEach(p => {
    // move particles
    p.x += p.dx;
    p.y += p.dy;

    // wrap particles around player for infinite effect
    if (p.x < player.x - halfSpread/2) p.x += halfSpread;
    if (p.x > player.x + halfSpread/2) p.x -= halfSpread;
    if (p.y < player.y - halfSpread/2) p.y += halfSpread;
    if (p.y > player.y + halfSpread/2) p.y -= halfSpread;

    // draw with parallax
    const drawX = p.x - camera.x * parallax;
    const drawY = p.y - camera.y * parallax;

    ctx.beginPath();
    ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(
        ${parseInt(p.color.slice(1,3),16)},
        ${parseInt(p.color.slice(3,5),16)},
        ${parseInt(p.color.slice(5,7),16)},
        ${p.alpha}
    )`;
    ctx.fill();
});



    // Explosions
    explosions.forEach(ex=>{
        const radius = ex.size * Math.sin((ex.life/300)*Math.PI);
        for(let i=0;i<10;i++){
            const angle = Math.random()*Math.PI*2;
            const r = radius*Math.random();
            ctx.beginPath();
            ctx.arc(ex.x + Math.cos(angle)*r, ex.y + Math.sin(angle)*r, 2 + Math.random()*2,0,Math.PI*2);
            ctx.fillStyle = `rgba(${200+Math.random()*55},${100+Math.random()*55},0,0.7)`;
            ctx.fill();
        }
    });

    // Heal visual
    heals.forEach(h=>{
        ctx.beginPath();
        ctx.arc(h.x,h.y,h.size*Math.sin((h.life/500)*Math.PI),0,Math.PI*2);
        ctx.strokeStyle = `rgba(0,255,100,0.7)`;
        ctx.lineWidth = 3;
        ctx.stroke();
    });

    // Shield
    if(player.shield){
        ctx.beginPath();
        const sSize = (player.shieldSize||player.size+5);
        ctx.arc(player.x, player.y, sSize, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(0,200,255,0.5)`;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'cyan';
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Player
    const pulseSize = player.size + Math.sin(player.pulse)*1.5;
    ctx.beginPath();
    ctx.arc(player.x, player.y, pulseSize,0,Math.PI*2);
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = player.color;
    ctx.fill();
    ctx.shadowBlur = 0;

if(powerStage >= 2){
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size + 8 + Math.sin(player.pulse)*3,0,Math.PI*2);
    ctx.strokeStyle = `rgba(255,255,255,0.3)`;
    ctx.lineWidth = 2;
    ctx.stroke();
}
    // Bullets
    player.bullets.forEach(b=>{
        ctx.beginPath();
        ctx.arc(b.x,b.y,b.size,0,Math.PI*2);
        ctx.fillStyle = b.color||'#fff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = b.color||'#fff';
        ctx.fill();
        ctx.shadowBlur = 0;
    });

   
    if(boss){
        ctx.beginPath();
        ctx.arc(boss.x, boss.y, boss.size + Math.sin(boss.pulse)*4, 0, Math.PI*2);
        ctx.fillStyle = boss.color;
        ctx.shadowBlur = 30;
        ctx.shadowColor = boss.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'red';
        ctx.fillRect(boss.x - 40, boss.y - boss.size - 20, 80*(boss.hp/boss.maxHp), 6);
    }

    // Enemies
enemies.forEach(e=>{
    const enemyPulse = e.size + Math.sin(e.pulse)*1.2;

    ctx.beginPath();
    ctx.arc(e.x, e.y, enemyPulse, 0, Math.PI*2);
    ctx.fillStyle = e.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = e.color;
    ctx.fill();
    ctx.shadowBlur = 0;

    if(e.shield){
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size + 3, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(255,255,0,0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
});


    if(gameOver){
        ctx.resetTransform();
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over! Press R to Restart', canvas.width/2, canvas.height/2);
    }
	if(powerStage >= 4){
    ctx.resetTransform();
    const g = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, canvas.width/4,
        canvas.width/2, canvas.height/2, canvas.width/1.2
    );
    g.addColorStop(0,'rgba(0,0,0,0)');
    g.addColorStop(1,'rgba(0,0,0,0.4)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,canvas.width,canvas.height);
}


    ctx.restore();
    requestAnimationFrame(draw);
}

// ---------------- UI ----------------
function updateUI(){
    document.getElementById('size').innerText = Math.floor(player.actualSize);
    document.getElementById('xp').innerText = Math.floor(player.xp);
    document.getElementById('level').innerText = player.level;
    updateSkillButtons();
}

function updateSkillButtons(){
    const container = document.getElementById('skillButtons');
    container.innerHTML = '';
    skillsList.forEach((s,index)=>{
        if(player.level >= s.unlockedAt){
            const btn = document.createElement('button');
            btn.innerText = `${index+1}: ${s.name} (Lv ${s.level})`;
            btn.onclick = ()=>{ if(player.skillPoints<=0) return; s.level++; player.skillPoints--; s.effect(); updateSkillButtons(); };
            btn.disabled = player.skillPoints<=0;
            container.appendChild(btn);
        }
    });
}

// ---------------- Leaderboard ----------------
async function submitScore(name){
    const skillLevels = {};
    skillsList.forEach(s=> skillLevels[s.name] = s.level);
    try{
        await addDoc(collection(db,'scores'),{
            name,
            size: Math.floor(player.actualSize),
            xp: Math.floor(player.xp),
            level: player.level,
            skills: skillLevels,
            time: Date.now()
        });
        fetchLeaderboard();
    }catch(e){ console.error(e); }
}

async function fetchLeaderboard(limitCount=10){
    try{
        const q = query(collection(db,'scores'),orderBy('level','desc'),limit(limitCount));
        const snapshot = await getDocs(q);
        const container = document.getElementById('leaderboard');
        container.innerHTML = '<h3>Leaderboard</h3>';
        snapshot.forEach(doc=>{
            const d = doc.data();
            const div = document.createElement('div');
            div.innerText = `${d.name}: Lv ${d.level}, Size ${d.size}, XP ${d.xp}`;
            container.appendChild(div);
        });
    }catch(e){ console.error(e); }
}

// ---------------- Game Over / Restart ----------------
function endGame(){
    gameOver = true;
    const name = prompt('Game Over! Enter your name for the leaderboard:');
    if(name) submitScore(name);
}

function restartGame(){
    player.size = 5;
    player.actualSize = 5;
    player.xp = 0;
    player.level = 1;
    player.skillPoints = 0;
    player.bullets = [];
    player.shield = false;
    player.pulse = 0;
    player.hp = player.maxHp;
    player.shieldSize = undefined;
    player.fireRate = 500;
    player.speed = 3;
    player.explosion = false;
    player.heal = false;
    skillsList.forEach(s=> s.level = 0);
    enemies.length = 0;
    explosions.length = 0;
    heals.length = 0;
    gameOver = false;
    player.x = WORLD_WIDTH / 2;
    player.y = WORLD_HEIGHT / 2;
    powerStage = 0;
lastPowerStage = 0;
player.color = powerStages[0].aura;
    generateBackground();
    updateUI();
}

// ---------------- Game Loop ----------------
function gameLoop(){ update(); requestAnimationFrame(gameLoop); }

// ---------------- Start ----------------
updateUI();
draw();
gameLoop();
fetchLeaderboard();


function spawnBoss(){
    boss = {
        x: player.x + 300,
        y: player.y,
        size: 40 + player.level * 2,
        hp: 500 + player.level * 100,
        maxHp: 500 + player.level * 100,
        speed: 0.8,
        pulse: 0,
        color: '#ff4444',
        lastShot: 0,
        shootRate: 1200
    };
}
