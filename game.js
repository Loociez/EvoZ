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

// ---------------- Player ----------------
const player = {
    x: 0,
    y: 0,
    size: 5,
    minSize: 3,
    baseColor: '#00ff00',
    color: '#00ff00',
    speed: 3,
    xp: 0,
    level: 1,
    skillPoints: 0,
    bullets: [],
    fireRate: 500,
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
const enemyTypes = [
    { color:'#ff0000', baseSize:4, speed:1.5, xp:5, type:'basic' },
    { color:'#ff8800', baseSize:6, speed:1, xp:10, type:'slow' },
    { color:'#ff00ff', baseSize:3, speed:2, xp:7, type:'fast' },
    { color:'#00ffff', baseSize:5, speed:1.2, xp:12, type:'shooter', shootRate: 2000, lastShot: 0 },
    { color:'#ffff00', baseSize:7, speed:0.8, xp:15, type:'tank', shield:true }
];

// ---------------- Skills ----------------
const skillsList = [
    { name:'Rapid Fire', unlockedAt:2, effect:()=>{ player.fireRate = Math.max(50, player.fireRate*0.85); }, level:0 },
    { name:'Shield', unlockedAt:3, effect:()=>{ player.shield = true; }, level:0 },
    { name:'Speed Boost', unlockedAt:4, effect:()=>{ player.speed += 0.5; }, level:0 },
    { name:'Explosion', unlockedAt:5, effect:()=>{ player.explosion = true; }, level:0 },
    { name:'Heal', unlockedAt:6, effect:()=>{ player.heal = true; }, level:0 },
    { name:'Homing Bullets', unlockedAt:8, effect:()=>{ player.homing = true; }, level:0 },
    { name:'Bigger Shield', unlockedAt:10, effect:()=>{ player.shieldSize = (player.shieldSize||10)+5; }, level:0 }
];

// ---------------- Game Variables ----------------
let keys = {};
let gameOver = false;

// ---------------- Camera ----------------
const camera = { x: 0, y: 0, zoom: 2, minZoom: 1.0 };

// ---------------- Background ----------------
const bgParticles = [];
const BG_PARTICLE_COUNT = 200;
for(let i=0;i<BG_PARTICLE_COUNT;i++){
    bgParticles.push({
        x: Math.random()*canvas.width - canvas.width/2,
        y: Math.random()*canvas.height - canvas.height/2,
        size: Math.random()*2+1,
        dx: (Math.random()-0.5)*0.3,
        dy: (Math.random()-0.5)*0.3,
        alpha: Math.random()*0.3+0.1
    });
}

// ---------------- Event Listeners ----------------
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if(gameOver && e.key.toLowerCase() === 'r') restartGame();
});
document.addEventListener('keyup', e => keys[e.key] = false);

let mouse = { x: canvas.width/2, y: canvas.height/2 };
canvas.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
canvas.addEventListener('mousedown', shootBullet);

// ---------------- Bullets ----------------
function shootBullet() {
    if(gameOver) return;
    const now = Date.now();
    if (now - player.lastShot < player.fireRate) return;
    player.lastShot = now;

    const angle = Math.atan2(mouse.y - canvas.height/2, mouse.x - canvas.width/2);
    player.bullets.push({
        x: player.x,
        y: player.y,
        dx: Math.cos(angle) * 7,
        dy: Math.sin(angle) * 7,
        size: 4,
        life: 3000, // 3 seconds lifetime
        homing: player.homing || false,
        color: '#fff'
    });
}

// ---------------- Enemy Spawning ----------------
function spawnEnemy() {
    if(gameOver) return;
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const x = player.x + (Math.random()-0.5)*800;
    const y = player.y + (Math.random()-0.5)*600;
    enemies.push({
        x, y,
        size: type.baseSize + Math.floor(player.size/2),
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

// ---------------- Game Logic ----------------
function update() {
    if(gameOver) return;

    // Player movement
    if(keys['w'] || keys['ArrowUp']) player.y -= player.speed;
    if(keys['s'] || keys['ArrowDown']) player.y += player.speed;
    if(keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
    if(keys['d'] || keys['ArrowRight']) player.x += player.speed;

    player.pulse += 0.05;

    // Shooting
    if(keys[' ']) shootBullet();

    const now = Date.now();

    // Update bullets
    for(let i = player.bullets.length-1; i>=0; i--){
        const b = player.bullets[i];
        if(b.homing && enemies.length > 0){
            let nearest = enemies.reduce((prev, curr)=>{
                const pd = Math.hypot(curr.x - b.x, curr.y - b.y);
                return (!prev || pd < prev.dist) ? { enemy: curr, dist: pd } : prev;
            }, null);
            if(nearest){
                const angle = Math.atan2(nearest.enemy.y - b.y, nearest.enemy.x - b.x);
                b.dx = Math.cos(angle) * 7;
                b.dy = Math.sin(angle) * 7;
            }
        }
        b.x += b.dx;
        b.y += b.dy;

        b.life -= 16;
        if(b.life <= 0){ player.bullets.splice(i,1); continue; }

        // Bullet-enemy collision
        for(let j=enemies.length-1;j>=0;j--){
            const e = enemies[j];
            const dist = Math.hypot(b.x - e.x, b.y - e.y);
            if(dist < b.size + e.size){
                player.xp += e.xp;
                player.size += 0.5;
                player.level = Math.floor(player.size/10)+1;
                updateUI();
                enemies.splice(j,1);
                player.bullets.splice(i,1);
                break;
            }
        }
    }

    // Update enemies
    for(let i = enemies.length-1; i>=0; i--){
        const e = enemies[i];
        e.pulse += 0.05;
        const angle = Math.atan2(player.y - e.y, player.x - e.x);
        e.x += Math.cos(angle)*e.speed;
        e.y += Math.sin(angle)*e.speed;

        if(e.type==='shooter'){
            if(now - e.lastShot > e.shootRate){
                e.lastShot = now;
                const angle = Math.atan2(player.y - e.y, player.x - e.x);
                player.bullets.push({x:e.x,y:e.y,dx:Math.cos(angle)*5,dy:Math.sin(angle)*5,size:3,color:e.color,life:3000});
            }
        }

        // Player collision
        const distPlayer = Math.hypot(player.x - e.x, player.y - e.y);
        if(distPlayer < player.size + e.size){
            player.size -= 1;
            if(player.size <= player.minSize) endGame();
        }
    }

    // Spawn enemies
    if(Math.random()<0.03) spawnEnemy();

    // Skills XP
    const requiredXP = player.level*10;
    if(player.xp>=requiredXP){
        player.xp-=requiredXP;
        player.skillPoints++;
        updateUI();
    }

    // Camera
    camera.zoom = Math.max(camera.minZoom, 2 - (player.size - 5)*0.05);
    camera.x = player.x - canvas.width/(2*camera.zoom);
    camera.y = player.y - canvas.height/(2*camera.zoom);
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

    // Particles
    bgParticles.forEach(p=>{
        p.x += p.dx; p.y += p.dy;
        ctx.beginPath();
        ctx.arc(p.x + player.x, p.y + player.y, p.size,0,Math.PI*2);
        ctx.fillStyle = `rgba(0,200,255,${p.alpha})`;
        ctx.fill();
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

    // Enemies
    enemies.forEach(e=>{
        const enemyPulse = e.size + Math.sin(e.pulse)*1.2;
        ctx.beginPath();
        ctx.arc(e.x,e.y,enemyPulse,0,Math.PI*2);
        ctx.fillStyle = e.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = e.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        if(e.shield){
            ctx.beginPath();
            ctx.arc(e.x,e.y,e.size+3,0,Math.PI*2);
            ctx.strokeStyle = 'rgba(255,255,0,0.5)';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    });

    // Game Over
    if(gameOver){
        ctx.resetTransform();
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over! Press R to Restart', canvas.width/2, canvas.height/2);
    }

    ctx.restore();
    requestAnimationFrame(draw);
}

// ---------------- UI ----------------
function updateUI(){
    document.getElementById('size').innerText = Math.floor(player.size);
    document.getElementById('xp').innerText = Math.floor(player.xp);
    document.getElementById('level').innerText = player.level;
    updateSkillButtons();
}

function updateSkillButtons(){
    const container = document.getElementById('skillButtons');
    container.innerHTML = '';
    skillsList.forEach((s)=>{
        if(player.level >= s.unlockedAt){
            const btn = document.createElement('button');
            btn.innerText = `${s.name} (Lv ${s.level})`;
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
            size: Math.floor(player.size),
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
        const q = query(collection(db,'scores'),orderBy('size','desc'),limit(limitCount));
        const snapshot = await getDocs(q);
        const container = document.getElementById('leaderboard');
        container.innerHTML = '<h3>Leaderboard</h3>';
        snapshot.forEach(doc=>{
            const d = doc.data();
            const div = document.createElement('div');
            div.innerText = `${d.name}: Size ${d.size}, Lv ${d.level}, XP ${d.xp}`;
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
    player.xp = 0;
    player.level = 1;
    player.skillPoints = 0;
    player.bullets = [];
    player.shield = false;
    player.pulse = 0;
    player.hp = player.maxHp;
    player.homing = false;
    player.shieldSize = undefined;
    player.fireRate = 500;
    player.speed = 3;
    player.explosion = false;
    player.heal = false;
    skillsList.forEach(s=> s.level = 0);
    enemies.length = 0;
    gameOver = false;
    player.x = 0;
    player.y = 0;
    updateUI();
}

// ---------------- Game Loop ----------------
function gameLoop(){ update(); requestAnimationFrame(gameLoop); }

// ---------------- Start ----------------
updateUI();
draw();
gameLoop();
fetchLeaderboard();
