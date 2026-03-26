export {};
"use strict";
// 文字数制限：25字
const itemName = [
    ["馬形埴輪", "うまがたはにわ"],
    ["家形埴輪", "いえがたはにわ"],
    ["琴を弾く人物埴輪", "ことをひくじんぶつはにわ"],
    ["子馬形埴輪", "こうまがたはにわ"],
    ["翡翠製獣形勾玉", "ひすいせいじゅうけいまがたま"],
    ["青磁袴腰香炉", "せいじはかまごしこうろ"]
];
// 15文字区切り、文脈をスペースで調整
const explain = [
    "馬を表したはにわです。現代の馬と比べて足が短く、体には乗馬　する時に必要なさまざまな道具がつけられています。",
    "高床式（たかゆかしき）の建物を表現したはにわです。屋根には　鰹木（かつおぎ）という、その　家に住んでいた人の地位の高さを表すものがついています。",
    "イスにすわり、５本の弦がある　琴をヒザにのせた人物のはにわ　です。はにわのカケラが発掘　　されたあと、それをもとに復元　されました。",
    "子馬のはにわです。他の馬の　　はにわにある鞍（くら）や　　　たてがみがなく、発見されたときは「子犬形埴輪」として紹介　　されていました。",
    "横から見た動物のように見える　ことから獣形勾玉と呼ばれており弥生（やよい）時代前期のものと考えられています。",
    "田原城主の菩提寺（ぼだいじ）、先祖のお墓がある寺である　　　千光寺（せんこうじ）跡の墓地　から発見された香炉です。"
];
let canvas;
let ctx;
let scaleRate;
const SCREEN_WIDTH = 432;
const SCREEN_HEIGHT = 432;
let pointer = {
    x: 0,
    y: 0
};
let state = 4;
let digTargetX = 0;
let digTargetY = 0;
let tool = 1;
let hp = 0;
let item;
let isGameClear;
let isDamaged = false; // この番ダメージを受けたか
let isExcavated = false; // この番土を掘ったか
let particles = [];
let damageAnimation = 0;
let tutorialPage = 1;
let tutorialAnimation = 0;
let startTime;
let timer;
let timerMinites;
let timerSeconds;
let isCollectionDetail = false;
let ls_Ponyhaniwa;
let ls_horsehaniwa;
let ls_kotohaniwa;
let ls_househaniwa;
let ls_magatama;
let ls_seijikouro;
let field = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
];
const imgSoil = new Image();
const imgSoil2 = new Image();
const imgShovel1 = new Image();
const imgShovel2 = new Image();
const imgSankakuho1 = new Image();
const imgSankakuho2 = new Image();
const imgTakebera1 = new Image();
const imgTakebera2 = new Image();
const imgHeart1 = new Image();
const imgHeart2 = new Image();
const imgTitle = new Image();
const imgBack = new Image();
const imgDig = new Image();
const imgHand = new Image();
const imgButtonFrame = new Image();
const imgCollectionBack = new Image();
imgSoil.src = "img/soil.png";
imgSoil2.src = "img/soil2.png";
imgShovel1.src = "img/shovel1.png";
imgShovel2.src = "img/shovel2.png";
imgSankakuho1.src = "img/sankakuho-1.png";
imgSankakuho2.src = "img/sankakuho-2.png";
imgTakebera1.src = "img/takebera1.png";
imgTakebera2.src = "img/takebera2.png";
imgHeart1.src = "img/heart1.png";
imgHeart2.src = "img/heart2.png";
imgTitle.src = "img/title.png";
imgBack.src = "img/back.png";
imgDig.src = "img/dig.png";
imgHand.src = "img/hand.png";
imgButtonFrame.src = "img/buttonframe_sp.png";
imgCollectionBack.src = "img/collectionBack.png";
const sndExcavate = new Audio();
const sndMiss = new Audio();
const sndJingle = new Audio();
const sndTool = new Audio();
sndExcavate.src = "sound/excavate.mp3";
sndMiss.src = "sound/miss.mp3";
sndJingle.src = "sound/jingle.mp3";
sndTool.src = "sound/tool.mp3";
// 出土品
const imgExPaths = ["img/ex_horsehaniwa.png",
    "img/ex_househaniwa.png",
    "img/ex_kotohaniwa.png",
    "img/ex_ponyhaniwa.png",
    "img/ex_magatama.png",
    "img/ex_seijikouro.png"
];
let imgEx = imgExPaths.map(path => {
    const img = new Image();
    img.src = path;
    return img;
});
window.onload = setup;
function setup() {
    canvas = document.createElement("canvas");
    const container = document.getElementById("canvas-container");
    let rawScale = Math.min((window.innerWidth - 60) / SCREEN_WIDTH, (window.innerHeight - 200) / SCREEN_HEIGHT);
    if (!isFinite(rawScale) || rawScale <= 0) {
        rawScale = 1;
    }
    scaleRate = rawScale;
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    canvas.style.backgroundColor = "white";
    ctx = canvas.getContext("2d");
    container.appendChild(canvas);
    // ボタンの生成
    createButtons();
    // HPの初期化
    initHP();
    ls_Ponyhaniwa = loadLocalStorage("pony");
    ls_horsehaniwa = loadLocalStorage("horse");
    ls_kotohaniwa = loadLocalStorage("koto");
    ls_househaniwa = loadLocalStorage("house");
    ls_magatama = loadLocalStorage("magatama");
    ls_seijikouro = loadLocalStorage("kouro");
    canvas.addEventListener("touchstart", function (e) {
        updateTouchPos(e);
        if (state === 0) {
            if (pointer.x > 33 && pointer.x < 183 && pointer.y > 320 && pointer.y < 370) {
                playSound(sndJingle);
                gameInit();
                state = 1;
            }
            if (pointer.x > 249 && pointer.x < 399 && pointer.y > 320 && pointer.y < 370) {
                state = 5;
            }
        }
        else if (state === 1) {
            // タップ座標を盤面座標に変換
            const tapX = Math.floor(pointer.x / 48);
            const tapY = Math.floor(pointer.y / 48);
            if (tapX >= 0 && tapX < 9 && tapY >= 0 && tapY < 9) {
                digTargetX = tapX;
                digTargetY = tapY;
            }
        }
        else if (state === 2 || state === 3) {
            if (pointer.x > 33 && pointer.x < 183 && pointer.y > 320 && pointer.y < 370) {
                playSound(sndJingle);
                gameInit();
                state = 1;
            }
            if (pointer.x > 249 && pointer.x < 399 && pointer.y > 320 && pointer.y < 370) {
                gameInit();
                state = 0;
            }
        }
        else if (state === 4) {
            tutorialPage++;
            particles = [];
            tutorialAnimation = 0;
            if (tutorialPage > 6) {
                tutorialPage = 0;
                state = 0;
            }
        }
        else if (state === 5) {
            if (isCollectionDetail) {
                isCollectionDetail = false;
            }
            else {
                if (pointer.x > SCREEN_WIDTH / 2 - 150 + 2 && pointer.x < SCREEN_WIDTH / 2 - 150 + 2 + 96 && pointer.y > SCREEN_HEIGHT / 2 - 100 + 2 && pointer.y < SCREEN_HEIGHT / 2 - 100 + 2 + 96 && ls_Ponyhaniwa) {
                    item = 3;
                    isCollectionDetail = true;
                }
                else if (pointer.x > SCREEN_WIDTH / 2 - 150 + 100 + 2 && pointer.x < SCREEN_WIDTH / 2 - 150 + 100 + 2 + 96 && pointer.y > SCREEN_HEIGHT / 2 - 100 + 2 && pointer.y < SCREEN_HEIGHT / 2 - 100 + 2 + 96 && ls_horsehaniwa) {
                    item = 0;
                    isCollectionDetail = true;
                }
                else if (pointer.x > SCREEN_WIDTH / 2 - 150 + 200 + 2 && pointer.x < SCREEN_WIDTH / 2 - 150 + 200 + 2 + 96 && pointer.y > SCREEN_HEIGHT / 2 - 100 + 2 && pointer.y < SCREEN_HEIGHT / 2 - 100 + 2 + 96 && ls_kotohaniwa) {
                    item = 2;
                    isCollectionDetail = true;
                }
                else if (pointer.x > SCREEN_WIDTH / 2 - 150 + 2 && pointer.x < SCREEN_WIDTH / 2 - 150 + 2 + 96 && pointer.y > SCREEN_HEIGHT / 2 - 100 + 100 + 2 && pointer.y < SCREEN_HEIGHT / 2 - 100 + 100 + 2 + 96 && ls_househaniwa) {
                    item = 1;
                    isCollectionDetail = true;
                }
                else if (pointer.x > SCREEN_WIDTH / 2 - 150 + 100 + 2 && pointer.x < SCREEN_WIDTH / 2 - 150 + 100 + 2 + 96 && pointer.y > SCREEN_HEIGHT / 2 - 100 + 100 + 2 && pointer.y < SCREEN_HEIGHT / 2 - 100 + 100 + 2 + 96 && ls_magatama) {
                    item = 4;
                    isCollectionDetail = true;
                }
                else if (pointer.x > SCREEN_WIDTH / 2 - 150 + 200 + 2 && pointer.x < SCREEN_WIDTH / 2 - 150 + 200 + 2 + 96 && pointer.y > SCREEN_HEIGHT / 2 - 100 + 100 + 2 && pointer.y < SCREEN_HEIGHT / 2 - 100 + 100 + 2 + 96 && ls_seijikouro) {
                    item = 5;
                    isCollectionDetail = true;
                }
                if (pointer.x > 40 && pointer.x < 190 && pointer.y > 330 && pointer.y < 390) {
                    state = 0;
                }
            }
        }
    }, { passive: false });
    canvas.addEventListener("touchmove", function (e) {
        updateTouchPos(e);
        if (state === 1) {
            const tapX = Math.floor(pointer.x / 48);
            const tapY = Math.floor(pointer.y / 48);
            // 盤面の範囲内なら更新する
            if (tapX >= 0 && tapX < 9 && tapY >= 0 && tapY < 9) {
                digTargetX = tapX;
                digTargetY = tapY;
            }
        }
    }, { passive: false });
    update();
}
function updateTouchPos(e) {
    e.preventDefault(); // スクロール防止
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    pointer.x = (t.clientX - rect.left) * (canvas.width / rect.width);
    pointer.y = (t.clientY - rect.top) * (canvas.height / rect.height);
}
function update() {
    // animationを規定値に → 0までの間アニメーションする
    // stateの切り替わりに対応するためstateに関わらず実行する
    if (damageAnimation > 0)
        damageAnimation--;
    if (state === 1) {
        // パーティクルの動き
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.life--;
            if (p.life <= 0)
                particles.splice(i, 1);
        }
        if (isGameClear) {
            playSound(sndJingle);
            switch (item) {
                case 0:
                    ls_horsehaniwa = true;
                    saveLocalStorage("horse", true);
                    break;
                case 1:
                    ls_househaniwa = true;
                    saveLocalStorage("house", true);
                    break;
                case 2:
                    ls_kotohaniwa = true;
                    saveLocalStorage("koto", true);
                    break;
                case 3:
                    ls_Ponyhaniwa = true;
                    saveLocalStorage("pony", true);
                    break;
                case 4:
                    ls_magatama = true;
                    saveLocalStorage("magatama", true);
                    break;
                case 5:
                    ls_seijikouro = true;
                    saveLocalStorage("kouro", true);
                    break;
            }
            state = 2;
        }
        // タイマー機能
        const now = Date.now();
        timer = Number(((now - startTime) / 1000).toFixed(0));
        timerMinites = ("0" + Math.round(timer / 60)).slice(-2);
        timerSeconds = ("0" + (timer % 60)).slice(-2);
    }
    else if (state === 4) {
        tutorialAnimation++;
        // パーティクルの動き
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.life--;
            if (p.life <= 0)
                particles.splice(i, 1);
        }
    }
    draw();
    setTimeout(update, 1000 / 30);
}
function draw() {
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.imageSmoothingEnabled = false; // ドット絵のボケ防止処理
    ctx.drawImage(imgBack, 20, 5, 100, 70, 0, 0, 700, 490);
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.font = "bold 15px sans-serif";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    // CSSでダメージアニメーション
    // stateの切り替わりに対応するためstateに関わらず実行
    const canvasContainer = document.getElementById("canvas-container");
    if (damageAnimation > 0) {
        const alpha = damageAnimation / 15;
        canvasContainer.style.borderColor = `rgba(255, 50, 50, ${alpha})`;
        canvasContainer.style.boxShadow = `0 0 10px rgba(255, 50, 50, ${alpha})`;
    }
    else {
        canvasContainer.style.borderColor = "#cc9933";
        canvasContainer.style.boxShadow = "none";
    }
    if (state === 0) {
        // タイトル
        ctx.drawImage(imgTitle, 0, 0, 180, 100, 36, 50, 360, 200);
        // ゲームスタート
        ctx.drawImage(imgButtonFrame, 0, 0, 50, 20, 33, 320, 150, 60);
        ctx.fillStyle = "#000";
        ctx.font = "15px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ゲームスタート", SCREEN_WIDTH / 4, 350);
        // コレクション
        ctx.drawImage(imgButtonFrame, 0, 0, 50, 20, 249, 320, 150, 60);
        ctx.fillStyle = "#000";
        ctx.font = "15px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("コレクション", SCREEN_WIDTH / 4 * 3, 350);
    }
    if (state === 1) {
        // 出土品画像
        if (imgEx[item].complete) {
            ctx.drawImage(imgEx[item], 0, 0, 48, 48, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        }
        // 盤面
        for (let y = 0; y < field.length; y++) {
            for (let x = 0; x < field[y].length; x++) {
                if (field[x][y] == 1) {
                    ctx.drawImage(imgSoil2, 0, 0, 16, 16, x * 48, y * 48, 48, 48);
                }
                else if (field[x][y] == 2) {
                    ctx.drawImage(imgSoil, 0, 0, 16, 16, x * 48, y * 48, 48, 48);
                }
            }
        }
        // 採掘範囲の線
        if (digTargetX >= 0 && digTargetX < 9 && digTargetY >= 0 && digTargetY < 9) {
            ctx.strokeStyle = "#cc9933";
            ctx.lineWidth = 5;
            switch (tool) {
                case 1:
                    ctx.strokeRect((digTargetX - 1) * 48, (digTargetY - 1) * 48, 48 * 3, 48 * 3);
                    break;
                case 2:
                    ctx.strokeRect(digTargetX * 48, (digTargetY - 1) * 48, 48, 48 * 3);
                    break;
                case 3:
                    ctx.strokeRect(digTargetX * 48, digTargetY * 48, 48, 48);
                    break;
            }
        }
        // パーティクルの描画
        for (let p of particles) {
            ctx.drawImage(p.img, p.sx, p.sy, p.size, p.size, p.x, p.y, p.size * 3, p.size * 3);
        }
    }
    if (state === 2 || state === 3) {
        // 背景
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillRect(20, 20, SCREEN_WIDTH - 40, SCREEN_HEIGHT - 40);
        // もう一度遊ぶ
        ctx.drawImage(imgButtonFrame, 0, 0, 50, 20, 33, 320, 150, 60);
        ctx.fillStyle = "#000";
        ctx.font = "15px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("もう１回あそぶ", SCREEN_WIDTH / 4, 350);
        // タイトルに戻る
        ctx.drawImage(imgButtonFrame, 0, 0, 50, 20, 249, 320, 150, 60);
        ctx.fillStyle = "#000";
        ctx.font = "15px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("タイトルにもどる", SCREEN_WIDTH / 4 * 3, 350);
    }
    if (state === 2) {
        // 出土品の名前
        ctx.fillStyle = "#000";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(itemName[item][0], SCREEN_WIDTH / 2, 60);
        // ふりがな
        ctx.font = "12px sans-serif";
        ctx.fillText(itemName[item][1], SCREEN_WIDTH / 2, 40);
        // 出土品の説明
        ctx.font = "14px sans-serif";
        ctx.textAlign = "left";
        fillTextLine(explain[item], 194, 100, 15);
        // 出土品の画像
        ctx.drawImage(imgEx[item], 0, 0, 48, 48, 40, 80, 144, 144);
        // クリアタイム
        ctx.font = "16px monospace";
        ctx.textAlign = "center";
        ctx.fillText("クリアタイム：" + timerMinites + "分" + timerSeconds + "秒", SCREEN_WIDTH / 2, 290);
    }
    if (state === 3) {
        // ゲームオーバー
        ctx.fillStyle = "#000";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ゲームオーバー", SCREEN_WIDTH / 2, 60);
    }
    if (state === 4) {
        // 背景
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillRect(20, 20, SCREEN_WIDTH - 40, SCREEN_HEIGHT - 40);
        ctx.fillStyle = "#000";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("あそびかた", SCREEN_WIDTH / 2, 60);
        ctx.fillStyle = "#666666";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        if (tutorialPage < 6) {
            ctx.fillText("タッチでつぎのページへ", 320, 400);
        }
        else {
            ctx.fillText("タッチでせつめいをおわる", 320, 400);
        }
        if (tutorialPage === 1) {
            const animationFrame = tutorialAnimation % 90;
            // 本文
            ctx.fillStyle = "#000000";
            ctx.font = "16px sans-serif";
            ctx.textAlign = "left";
            fillTextLine("スワイプでほる場所をきめます。", 35, 350, 22);
            // 採掘範囲
            ctx.strokeStyle = "#cc9933";
            ctx.lineWidth = 5;
            if (animationFrame < 10) {
                ctx.strokeRect(2 * 48, 3 * 48, 48, 48);
            }
            else if (animationFrame < 18) {
                ctx.strokeRect(3 * 48, 3 * 48, 48, 48);
            }
            else if (animationFrame < 26) {
                ctx.strokeRect(4 * 48, 3 * 48, 48, 48);
            }
            else if (animationFrame < 34) {
                ctx.strokeRect(5 * 48, 3 * 48, 48, 48);
            }
            else if (animationFrame < 54) {
                ctx.strokeRect(6 * 48, 3 * 48, 48, 48);
            }
            else if (animationFrame < 62) {
                ctx.strokeRect(5 * 48, 3 * 48, 48, 48);
            }
            else if (animationFrame < 70) {
                ctx.strokeRect(4 * 48, 3 * 48, 48, 48);
            }
            else if (animationFrame < 78) {
                ctx.strokeRect(3 * 48, 3 * 48, 48, 48);
            }
            else {
                ctx.strokeRect(2 * 48, 3 * 48, 48, 48);
            }
            // 指
            if (animationFrame < 40) {
                ctx.drawImage(imgHand, 0, 0, 16, 16, animationFrame * 6 + 80, 170, 64, 64);
            }
            else if (animationFrame < 45) {
                ctx.drawImage(imgHand, 0, 0, 16, 16, 320, 170, 64, 64);
            }
            else if (animationFrame < 85) {
                ctx.drawImage(imgHand, 0, 0, 16, 16, 320 - (animationFrame - 45) * 6, 170, 64, 64);
            }
            else {
                ctx.drawImage(imgHand, 0, 0, 16, 16, 80, 170, 64, 64);
            }
        }
        else if (tutorialPage === 2) {
            const animationFrame = tutorialAnimation % 60;
            // 本文
            ctx.fillStyle = "#000000";
            ctx.font = "16px sans-serif";
            ctx.textAlign = "left";
            fillTextLine("きめたらこのボタンで土をほりましょう。", 35, 350, 22);
            // 土
            if (animationFrame < 30) {
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 4 * 48, 2 * 48, 48, 48);
            }
            // 採掘範囲
            ctx.strokeStyle = "#cc9933";
            ctx.lineWidth = 5;
            ctx.strokeRect(4 * 48, 2 * 48, 48, 48);
            // パーティクルの生成
            if (animationFrame === 30) {
                createParticles(4, 2, imgSoil2);
            }
            // パーティクルの描画
            for (let p of particles) {
                ctx.drawImage(p.img, p.sx, p.sy, p.size, p.size, p.x, p.y, p.size * 3, p.size * 3);
            }
            // ボタン
            ctx.drawImage(imgDig, 0, 0, 16, 16, SCREEN_WIDTH / 2 - 32, 180, 64, 64);
            // 指
            if (animationFrame < 30) {
                ctx.drawImage(imgHand, 0, 0, 16, 16, SCREEN_WIDTH / 2 - 32, 235, 64, 64);
            }
            else if (animationFrame < 33) {
                ctx.drawImage(imgHand, 0, 0, 16, 16, SCREEN_WIDTH / 2 - 32, 225, 64, 64);
            }
            else {
                ctx.drawImage(imgHand, 0, 0, 16, 16, SCREEN_WIDTH / 2 - 32, 235, 64, 64);
            }
        }
        else if (tutorialPage === 3) {
            const animationFrame = tutorialAnimation % 60;
            // 本文
            ctx.fillStyle = "#000000";
            ctx.font = "16px sans-serif";
            ctx.textAlign = "left";
            fillTextLine("土ではないところをたたくとライフがへります。ライフは全部で５つあり、０になるとゲームオーバー。", 35, 335, 22);
            // 土
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 3 * 48, 2 * 48, 48, 48);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 5 * 48, 2 * 48, 48, 48);
            // 採掘範囲
            ctx.strokeStyle = "#cc9933";
            ctx.lineWidth = 5;
            ctx.strokeRect(4 * 48, 2 * 48, 48, 48);
            // ボタン
            ctx.drawImage(imgDig, 0, 0, 16, 16, SCREEN_WIDTH / 2 - 32, 180, 64, 64);
            // 指
            if (animationFrame < 30) {
                ctx.drawImage(imgHand, 0, 0, 16, 16, SCREEN_WIDTH / 2 - 32, 235, 64, 64);
            }
            else if (animationFrame < 33) {
                ctx.drawImage(imgHand, 0, 0, 16, 16, SCREEN_WIDTH / 2 - 32, 225, 64, 64);
            }
            else {
                ctx.drawImage(imgHand, 0, 0, 16, 16, SCREEN_WIDTH / 2 - 32, 235, 64, 64);
            }
            // ダメージ処理(例外的)
            if (animationFrame === 0) {
                hp = 5;
                updateHP(hp);
            }
            else if (animationFrame === 30) {
                damageAnimation = 15;
                hp = 4;
                updateHP(hp);
            }
        }
        else if (tutorialPage === 4) {
            // 前ページのHP処理をリセット
            if (hp === 4) {
                hp = 5;
                updateHP(hp);
            }
            // 本文
            ctx.fillStyle = "#000000";
            ctx.font = "16px sans-serif";
            ctx.textAlign = "left";
            fillTextLine("道具は３つあって、それぞれはんいがきまって　います。", 35, 350, 22);
            // 土
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 40, 80, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 40, 80 + 32, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 40, 80 + 64, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 40 + 32, 80, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 40 + 32, 80 + 32, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 40 + 32, 80 + 64, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 40 + 64, 80, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 40 + 64, 80 + 32, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 40 + 64, 80 + 64, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 210, 80, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 210, 80 + 32, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 210, 80 + 64, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 330, 80 + 32, 32, 32);
            // ボタン
            ctx.drawImage(imgShovel1, 0, 0, 16, 16, 72, 200, 32, 32);
            ctx.drawImage(imgSankakuho1, 0, 0, 16, 16, 210, 200, 32, 32);
            ctx.drawImage(imgTakebera1, 0, 0, 16, 16, 330, 200, 32, 32);
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("シャベル", 72 + 16, 200 + 60);
            ctx.fillText("三角ホー", 210 + 16, 200 + 60);
            ctx.fillText("竹べら", 330 + 16, 200 + 60);
        }
        else if (tutorialPage === 5) {
            const animationFrame = tutorialAnimation % 120;
            // 本文
            ctx.fillStyle = "#000000";
            ctx.font = "16px sans-serif";
            ctx.textAlign = "left";
            fillTextLine("色がこい土は２回ほりましょう", 35, 350, 22);
            // 土
            if (animationFrame < 30) {
                ctx.drawImage(imgSoil, 0, 0, 16, 16, 4 * 48, 2 * 48, 48, 48);
            }
            else if (animationFrame < 80) {
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 4 * 48, 2 * 48, 48, 48);
            }
            // 採掘範囲
            ctx.strokeStyle = "#cc9933";
            ctx.lineWidth = 5;
            ctx.strokeRect(4 * 48, 2 * 48, 48, 48);
            // パーティクルの生成
            if (animationFrame === 30) {
                createParticles(4, 2, imgSoil);
            }
            else if (animationFrame === 80) {
                createParticles(4, 2, imgSoil2);
            }
            // パーティクルの描画
            for (let p of particles) {
                ctx.drawImage(p.img, p.sx, p.sy, p.size, p.size, p.x, p.y, p.size * 3, p.size * 3);
            }
            // ボタン
            ctx.drawImage(imgDig, 0, 0, 16, 16, SCREEN_WIDTH / 2 - 32, 180, 64, 64);
            // 指
            if (animationFrame < 30) {
                ctx.drawImage(imgHand, 0, 0, 16, 16, SCREEN_WIDTH / 2 - 32, 235, 64, 64);
            }
            else if (animationFrame < 33) {
                ctx.drawImage(imgHand, 0, 0, 16, 16, SCREEN_WIDTH / 2 - 32, 225, 64, 64);
            }
            else if (animationFrame < 80) {
                ctx.drawImage(imgHand, 0, 0, 16, 16, SCREEN_WIDTH / 2 - 32, 235, 64, 64);
            }
            else if (animationFrame < 83) {
                ctx.drawImage(imgHand, 0, 0, 16, 16, SCREEN_WIDTH / 2 - 32, 225, 64, 64);
            }
            else {
                ctx.drawImage(imgHand, 0, 0, 16, 16, SCREEN_WIDTH / 2 - 32, 235, 64, 64);
            }
        }
        else if (tutorialPage === 6) {
            const animationFrame = tutorialAnimation % 210;
            // 本文
            ctx.fillStyle = "#000000";
            ctx.font = "16px sans-serif";
            ctx.textAlign = "left";
            fillTextLine("すべての土をほって、四條畷（しじょうなわて）の文化財（ぶんかざい）をはっくつしよう！", 35, 350, 22);
            // 出土品
            ctx.drawImage(imgEx[3], 0, 0, 48, 48, 48 * 3, 48 * 2, 144, 144);
            // 土
            if (animationFrame < 30) {
                ctx.drawImage(imgSoil, 0, 0, 16, 16, 3 * 48, 2 * 48, 48, 48);
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 4 * 48, 2 * 48, 48, 48);
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 5 * 48, 2 * 48, 48, 48);
                ctx.drawImage(imgSoil, 0, 0, 16, 16, 3 * 48, 3 * 48, 48, 48);
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 4 * 48, 3 * 48, 48, 48);
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 5 * 48, 3 * 48, 48, 48);
                ctx.drawImage(imgSoil, 0, 0, 16, 16, 3 * 48, 4 * 48, 48, 48);
                ctx.drawImage(imgSoil, 0, 0, 16, 16, 4 * 48, 4 * 48, 48, 48);
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 5 * 48, 4 * 48, 48, 48);
            }
            else if (animationFrame < 90) {
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 3 * 48, 2 * 48, 48, 48);
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 3 * 48, 3 * 48, 48, 48);
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 3 * 48, 4 * 48, 48, 48);
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 4 * 48, 4 * 48, 48, 48);
            }
            else if (animationFrame < 150) {
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 4 * 48, 4 * 48, 48, 48);
            }
            // 採掘範囲
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#cc9933";
            if (animationFrame < 50) {
                ctx.strokeRect(3 * 48, 2 * 48, 48 * 3, 48 * 3);
            }
            else if (animationFrame < 60) {
                ctx.strokeRect(4 * 48, 2 * 48, 48, 48 * 3);
            }
            else if (animationFrame < 110) {
                ctx.strokeRect(3 * 48, 2 * 48, 48, 48 * 3);
            }
            else if (animationFrame < 120) {
                ctx.strokeRect(3 * 48, 3 * 48, 48, 48);
            }
            else if (animationFrame < 130) {
                ctx.strokeRect(3 * 48, 4 * 48, 48, 48);
            }
            else if (animationFrame < 160) {
                ctx.strokeRect(4 * 48, 4 * 48, 48, 48);
            }
            // パーティクルの生成
            if (animationFrame === 30) {
                createParticles(3, 2, imgSoil);
                createParticles(4, 2, imgSoil2);
                createParticles(5, 2, imgSoil2);
                createParticles(3, 3, imgSoil);
                createParticles(4, 3, imgSoil2);
                createParticles(5, 3, imgSoil2);
                createParticles(3, 4, imgSoil);
                createParticles(4, 4, imgSoil);
                createParticles(5, 4, imgSoil2);
            }
            else if (animationFrame === 90) {
                createParticles(3, 2, imgSoil2);
                createParticles(3, 3, imgSoil2);
                createParticles(3, 4, imgSoil2);
            }
            else if (animationFrame === 150) {
                createParticles(4, 4, imgSoil2);
            }
            // パーティクルの描画
            for (let p of particles) {
                ctx.drawImage(p.img, p.sx, p.sy, p.size, p.size, p.x, p.y, p.size * 3, p.size * 3);
            }
        }
    }
    if (state === 5) {
        // 背景
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillRect(20, 20, SCREEN_WIDTH - 40, SCREEN_HEIGHT - 40);
        if (isCollectionDetail) {
            // 出土品の名前
            ctx.fillStyle = "#000";
            ctx.font = "bold 20px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(itemName[item][0], SCREEN_WIDTH / 2, 60);
            // ふりがな
            ctx.font = "12px sans-serif";
            ctx.fillText(itemName[item][1], SCREEN_WIDTH / 2, 40);
            // 出土品の説明
            ctx.font = "14px sans-serif";
            ctx.textAlign = "left";
            fillTextLine(explain[item], 194, 100, 15);
            // 出土品の画像
            ctx.drawImage(imgEx[item], 0, 0, 48, 48, 40, 80, 144, 144);
            ctx.fillStyle = "#666666";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "right";
            ctx.fillText("タッチでコレクションへもどる", SCREEN_WIDTH - 30, 400);
        }
        else {
            ctx.fillStyle = "#000";
            ctx.font = "bold 20px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("コレクション", SCREEN_WIDTH / 2, 60);
            ctx.drawImage(imgCollectionBack, 0, 0, 150, 100, SCREEN_WIDTH / 2 - 150, SCREEN_HEIGHT / 2 - 100, 300, 200);
            if (ls_Ponyhaniwa)
                ctx.drawImage(imgEx[3], 0, 0, 48, 48, SCREEN_WIDTH / 2 - 150 + 2, SCREEN_HEIGHT / 2 - 100 + 2, 96, 96);
            if (ls_horsehaniwa)
                ctx.drawImage(imgEx[0], 0, 0, 48, 48, SCREEN_WIDTH / 2 - 150 + 100 + 2, SCREEN_HEIGHT / 2 - 100 + 2, 96, 96);
            if (ls_kotohaniwa)
                ctx.drawImage(imgEx[2], 0, 0, 48, 48, SCREEN_WIDTH / 2 - 150 + 200 + 2, SCREEN_HEIGHT / 2 - 100 + 2, 96, 96);
            if (ls_househaniwa)
                ctx.drawImage(imgEx[1], 0, 0, 48, 48, SCREEN_WIDTH / 2 - 150 + 2, SCREEN_HEIGHT / 2 - 100 + 100 + 2, 96, 96);
            if (ls_magatama)
                ctx.drawImage(imgEx[4], 0, 0, 48, 48, SCREEN_WIDTH / 2 - 150 + 100 + 2, SCREEN_HEIGHT / 2 - 100 + 100 + 2, 96, 96);
            if (ls_seijikouro)
                ctx.drawImage(imgEx[5], 0, 0, 48, 48, SCREEN_WIDTH / 2 - 150 + 200 + 2, SCREEN_HEIGHT / 2 - 100 + 100 + 2, 96, 96);
            ctx.fillStyle = "#666666";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "right";
            ctx.fillText("タッチでせつめいページへ", SCREEN_WIDTH - 30, 400);
            // タイトルに戻る
            ctx.drawImage(imgButtonFrame, 0, 0, 50, 20, 40, 330, 150, 60);
            ctx.fillStyle = "#000";
            ctx.font = "15px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("タイトルにもどる", 55, 360);
        }
    }
}
function gameInit() {
    hp = 5;
    tool = 1;
    particles = [];
    damageAnimation = 0;
    startTime = Date.now();
    // HP表示を初期化
    updateHP(hp);
    // 道具ボタンの表示を初期化
    updateToolButtons(tool);
    // 盤面リセット
    for (let y = 0; y < field.length; y++) {
        for (let x = 0; x < field[y].length; x++) {
            field[x][y] = 0;
        }
    }
    // 土を被せる
    for (let i = 0; i < 2; i++) {
        for (let y = 0; y < field.length; y++) {
            for (let x = 0; x < field[y].length; x++) {
                if (Math.floor(Math.random() * 5) > 1)
                    field[x][y]++;
            }
        }
    }
    // 出土品を決める
    item = Math.floor(Math.random() * itemName.length);
    isGameClear = false;
}
// HP表示の初期化
function initHP() {
    const container = document.getElementById("hp-container");
    if (!container)
        return;
    container.innerHTML = ""; // 中身を空にする
    for (let i = 0; i < 5; i++) {
        const img = document.createElement("img");
        img.src = imgHeart1.src; // 初期は満タン
        container.appendChild(img);
    }
}
// HP表示の更新
function updateHP(currentHP) {
    const container = document.getElementById("hp-container");
    if (!container)
        return;
    const hearts = container.getElementsByTagName("img");
    for (let i = 0; i < hearts.length; i++) {
        if (i < currentHP) {
            hearts[i].src = imgHeart1.src;
        }
        else {
            hearts[i].src = imgHeart2.src;
        }
    }
}
// 道具ボタンの表示更新
function updateToolButtons(activeTool) {
    const buttons = document.querySelectorAll(".tool-btn");
    buttons.forEach(function (btn) {
        btn.classList.remove("active");
    });
    const activeBtn = document.getElementById(`tool-${activeTool}`);
    if (activeBtn) {
        activeBtn.classList.add("active");
    }
}
function createButtons() {
    const toolButtons = [
        { id: "toolShovel", src: imgShovel1.src, tool: 1 },
        { id: "toolSankakuho", src: imgSankakuho1.src, tool: 2 },
        { id: "toolTakebera", src: imgTakebera1.src, tool: 3 }
    ];
    const actionButtons = [
        { id: "digButton", src: imgDig.src, tool: "dig" }
    ];
    const toolsContainer = document.getElementById("tools-container");
    const actionContainer = document.getElementById("action-container");
    // 道具ボタンの生成
    toolButtons.forEach(btn => {
        const img = document.createElement("img");
        img.id = btn.id;
        img.src = btn.src;
        img.className = "btn tool-btn";
        img.dataset.tool = String(btn.tool);
        img.addEventListener("touchstart", function (e) {
            e.preventDefault();
            tool = btn.tool;
            playSound(sndTool);
            updateToolButtons(tool);
        });
        toolsContainer.appendChild(img);
    });
    // 掘るボタンの生成
    actionButtons.forEach(btn => {
        const img = document.createElement("img");
        img.id = btn.id;
        img.src = btn.src;
        img.className = "btn action-btn";
        img.addEventListener("touchstart", function (e) {
            e.preventDefault();
            if (state === 1)
                doDigAction();
        });
        actionContainer.appendChild(img);
    });
    updateToolButtons(tool);
}
function excavate(field, x, y) {
    // 盤面の範囲チェック
    if (x < 0 || x >= 9 || y < 0 || y >= 9) {
        return;
    }
    if (field[x][y] == 2) {
        field[x][y] = 1;
        createParticles(x, y, imgSoil);
        isExcavated = true;
    }
    else if (field[x][y] == 1) {
        field[x][y] = 0;
        createParticles(x, y, imgSoil2);
        isExcavated = true;
    }
    else if (field[x][y] == 0) {
        isDamaged = true;
    }
}
// 複数行のテキストを描画
function fillTextLine(text, x, y, charNum) {
    let textLine = [];
    // textを指定文字ごとに分け、textLineに追加
    for (let i = 0; i < text.length; i += charNum) {
        textLine.push(text.slice(i, i + charNum));
    }
    // 配列を取り出して表示
    for (let i = 0; i < textLine.length; i++) {
        ctx.fillText(textLine[i], x, y + i * 30);
    }
}
function createParticles(x, y, img) {
    const pieces = [
        { sx: 8, sy: 4, vx: 3, vy: 0 },
        { sx: 0, sy: 4, vx: -3, vy: 0 },
        { sx: 4, sy: 0, vx: 0, vy: -3 },
        { sx: 4, sy: 8, vx: 0, vy: 3 },
        { sx: 8, sy: 0, vx: 3, vy: -3 },
        { sx: 0, sy: 0, vx: -3, vy: -3 },
        { sx: 8, sy: 8, vx: 3, vy: 3 },
        { sx: 0, sy: 8, vx: -3, vy: 3 },
    ];
    for (let p of pieces) {
        particles.push({
            x: x * 48 + 18,
            y: y * 48 + 18,
            vx: p.vx * (0.5 + Math.random() * 0.5),
            vy: p.vy * (0.5 + Math.random() * 0.5),
            life: 15,
            img: img,
            sx: p.sx, sy: p.sy,
            size: 4
        });
    }
}
function playSound(snd) {
    snd.pause();
    snd.currentTime = 0;
    snd.play();
}
function doDigAction() {
    if (digTargetX === null || digTargetY === null)
        return;
    const x = digTargetX;
    const y = digTargetY;
    switch (tool) {
        case 1:
            excavate(field, x - 1, y - 1);
            excavate(field, x, y - 1);
            excavate(field, x + 1, y - 1);
            excavate(field, x - 1, y);
            excavate(field, x, y);
            excavate(field, x + 1, y);
            excavate(field, x - 1, y + 1);
            excavate(field, x, y + 1);
            excavate(field, x + 1, y + 1);
            break;
        case 2:
            excavate(field, x, y - 1);
            excavate(field, x, y);
            excavate(field, x, y + 1);
            break;
        case 3:
            excavate(field, x, y);
            break;
    }
    // ダメージ処理
    if (isDamaged) {
        hp--;
        updateHP(hp);
        playSound(sndMiss);
        isDamaged = false;
        damageAnimation = 15;
    }
    // 音処理
    if (isExcavated) {
        playSound(sndExcavate);
        isExcavated = false;
    }
    // ゲームオーバー？
    if (hp <= 0) {
        damageAnimation = 0;
        state = 3;
    }
    // クリアしたか？
    isGameClear = true;
    for (let y = 0; y < field.length; y++) {
        for (let x = 0; x < field[y].length; x++) {
            if (field[y][x] != 0)
                isGameClear = false;
        }
    }
}
// 画面サイズが変わった（回転した）時にコンテナの高さを再設定する
window.addEventListener('resize', () => {
    const container = document.getElementById('game-container');
    // svhが効かない古い端末対策として、JSでも高さを強制指定
    if (container) {
        container.style.height = window.innerHeight + 'px';
    }
});
// 読み込み時にも一度実行
window.addEventListener('load', () => {
    window.dispatchEvent(new Event('resize'));
});
function saveLocalStorage(key, flag) {
    const value = flag.toString();
    localStorage.setItem(key, value);
}
function loadLocalStorage(key) {
    const value = localStorage.getItem(key);
    if (value === null)
        return false;
    return value === "true";
}
//# sourceMappingURL=main_sp.js.map