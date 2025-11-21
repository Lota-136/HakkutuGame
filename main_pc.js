"use strict";

// 文字数制限：25字
const itemName = [
    ["馬型埴輪", "うまがたはにわ"],
    ["家型埴輪", "いえがたはにわ"],
    ["琴を弾く人物埴輪", "ことをひくじんぶつはにわ"],
    ["小馬型埴輪", "こうまがたはにわ"],
    ["翡翠製獣型勾玉", "ひすいせいじゅうけいまがたま"],
    ["青磁袴腰香炉", "せいじはかまごしこうろ"]
];

// 文字数制限：130字程度
// 25文字区切り、文脈をスペースで調整
const explain = [
    "馬を表したはにわです。現代の馬と比べて足が短く、　体には乗馬する時に必要なさまざまな道具がつけられています。",
    "高床式（たかゆかしき）の建物を表現したはにわです。屋根には鰹木（かつおぎ）という、その家に住んでいた人の地位の高さを表すものがついています。",
    "イスにすわり、５本の弦がある琴（こと）をヒザに　　のせた人物のはにわです。はにわのカケラが発掘されたあと、それをもとに復元されました。",
    "小馬のはにわです。他の馬のはにわにある鞍（くら）やたてがみがなく、発見されたときは「子犬型埴輪」　　として紹介されていました。",
    "横から見た動物のように見えることから獣型勾玉と　　呼ばれており、弥生（やよい）時代前期のものと　　　考えられています。",
    "田原城主の菩提寺（ぼだいじ／先祖のお墓がある寺）　である千光寺（せんこうじ）跡の墓地から発見された　香炉です。"
];

let canvas;
let ctx;
let scaleRate;

const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 560;

let mouse = {};
document.onmousemove = function (e) {
    mouse.x = e.clientX / scaleRate;
    mouse.y = e.clientY / scaleRate;
}

let state = 0;

let posX;
let posY;
let tool;
let hp;
let item;
let isGameClear;
let isDamaged = false;  // この番ダメージを受けたか
let isExcavated = false;    // この番土を掘ったか
let particles = [];
let toolAnimation = 0;
let damageAnimation = 0;
let tutorialPage = 0;
let tutorialAnimation = 0;

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
const imgDig = new Image();
const imgCursor = new Image();
const imgArrow = new Image();
const imgButtonFrame1 = new Image();
const imgButtonFrame2 = new Image();
const imgTitle = new Image();
const imgBack = new Image();

const sndExcavate = new Audio();
const sndMiss = new Audio();
const sndJingle = new Audio();
const sndTool = new Audio();

// 出土品
const imgExPaths = ["img/ex_horsehaniwa.png", 
                    "img/ex_househaniwa.png",
                    "img/ex_kotohaniwa.png",
                    "img/ex_ponyhaniwa.png",
                    "img/ex_magatama.png",
                    "img/ex_seijikouro.png"
];
let imgEx;

window.onload = setup;

function setup()
{
    canvas = document.createElement(`canvas`);
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;

    scaleRate = Math.min((window.innerWidth - 15) / SCREEN_WIDTH, (window.innerHeight - 15) / SCREEN_HEIGHT);
    canvas.style.backgroundColor = `white`;
    canvas.style.border = `2px solid`;
    canvas.style.width = SCREEN_WIDTH * scaleRate + `px`;
    canvas.style.height = SCREEN_HEIGHT * scaleRate + `px`;

    ctx = canvas.getContext(`2d`);
    document.body.appendChild(canvas);

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
    imgDig.src = "img/dig.png";
    imgCursor.src = "img/cursor.png";
    imgArrow.src = "img/arrow.png";
    imgButtonFrame1.src = "img/buttonframe1.png";
    imgButtonFrame2.src = "img/buttonframe2.png";
    imgTitle.src = "img/title.png";
    imgBack.src = "img/back.png";

    imgEx = imgExPaths.map(path => {
        const img = new Image();
        img.src = path;
        return img;
    });

    sndExcavate.src = "sound/excavate.mp3";
    sndMiss.src = "sound/miss.mp3";
    sndJingle.src = "sound/jingle.mp3";
    sndTool.src = "sound/tool.mp3";

    canvas.addEventListener("click", () => {
        if (state === 0) {
            // ゲームスタート
            if (mouse.x >= 145 && mouse.x <= 355 && mouse.y >= 350 && mouse.y <= 440) {
                playSound(sndJingle);
                state = 1;
                gameInit();
            }
            // 説明
            if (mouse.x >= 445 && mouse.x <= 655 && mouse.y >= 350 && mouse.y <= 440) {
                playSound(sndJingle);
                state = 4;
            }
        } else if (state === 1) {
            if (posX == 10 && posY == 0) {
                tool = 1;
                toolAnimation = 15;
                playSound(sndTool);
                return;
            }
            if (posX == 10 && posY == 2) {
                tool = 2;
                toolAnimation = 15;
                playSound(sndTool);
                return;
            }
            if (posX == 10 && posY == 4) {
                tool = 3;
                toolAnimation = 15;
                playSound(sndTool);
                return;
            }
            if (posX >= 0 && posX <= 8 && posY >= 0 && posY <= 8) {
                doDigAction();
                return;
            }
        } else if (state === 2 || state === 3) {
            // もう一度遊ぶ
            if (mouse.x >= 145 && mouse.x <= 355 && mouse.y >= 350 && mouse.y <= 440) {
                playSound(sndJingle);
                state = 1;
                gameInit();
            }
            // タイトルに戻る
            if (mouse.x >= 445 && mouse.x <= 655 && mouse.y >= 350 && mouse.y <= 440) {
                state = 0;
            }
        } else if (state === 4) {
            tutorialPage++;
            particles = [];
            tutorialAnimation = 0;
            if (tutorialPage >= 5) {
                tutorialPage = 0;
                state = 0;
            }
        }
    });
    update();
}

function update()
{
    if (state === 0) {

    } else if (state === 1) {
        // カーソルの位置更新
        posX = Math.floor((mouse.x - 184) / 48);
        posY = Math.floor((mouse.y - 53) / 48);
        // パーティクルの動き
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.life--;

            if (p.life <= 0) particles.splice(i, 1);
        }

        // animationを規定値に → 0までの間アニメーションする
        if (toolAnimation > 0) toolAnimation--;
        if (damageAnimation > 0) damageAnimation--;

        if (isGameClear) {
            playSound(sndJingle);
            state = 2;
        }
    } else if (state === 4) {
        tutorialAnimation++;
        // パーティクルの動き
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.life--;

            if (p.life <= 0) particles.splice(i, 1);
        }

    }
    draw();
    setTimeout(update, 1000 / 30);
}

function draw()
{
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    ctx.imageSmoothingEnabled = false;      // ドット絵のボケ防止処理

    ctx.drawImage(imgBack, 0, 0, 100, 70, 0, 0, 800, 560);
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, 800, 560);

    ctx.font = "bold 15px sans-serif";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    if (state === 0) {
        // タイトル
        ctx.drawImage(imgTitle, 0, 0, 180, 100, 130, 50, 540, 300);
        ctx.fillStyle = "#000";
        
        // スタートボタン
        ctx.fillStyle = "#000";
        ctx.font = "bold 23px sans-serif";
        ctx.textAlign = "center";
        if (mouse.x >= 145 && mouse.x <= 355 && mouse.y >= 350 && mouse.y <= 440) {
            ctx.drawImage(imgButtonFrame2, 0, 0, 70, 30, 145, 350, 210, 90);
            ctx.fillText("ゲームスタート", 250, 401);
        } else {
            ctx.drawImage(imgButtonFrame1, 0, 0, 70, 30, 145, 350, 210, 90);
            ctx.fillText("ゲームスタート", 250, 395);
        }
        
        // 説明ボタン
        ctx.fillStyle = "#000";
        ctx.font = "bold 23px sans-serif";
        ctx.textAlign = "center";
        if (mouse.x >= 445 && mouse.x <= 655 && mouse.y >= 350 && mouse.y <= 440) {
            ctx.drawImage(imgButtonFrame2, 0, 0, 70, 30, 445, 350, 210, 90);
            ctx.fillText("あそびかた", 550, 401);
        } else {
            ctx.drawImage(imgButtonFrame1, 0, 0, 70, 30, 445, 350, 210, 90);
            ctx.fillText("あそびかた", 550, 395);
        }
    }

    if (state === 1) {
        // 出土品画像
        if (imgEx[item].complete) {
            ctx.drawImage(imgEx[item], 0, 0, 48, 48, 180, 50, 432, 432);
        }
        // ゲーム画面
        for (let y = 0; y < field.length; y++) {
            for (let x = 0; x < field[y].length; x++){
                if (field[y][x] == 1) {
                    ctx.drawImage(imgSoil2, 0, 0, 16, 16, x * 48 + 180, y * 48 + 50, 48, 48);
                } else if (field[y][x] == 2) {
                    ctx.drawImage(imgSoil, 0, 0, 16, 16, x * 48 + 180, y * 48 + 50, 48, 48);
                }
            }
        }

        // 盤面の枠
        ctx.lineWidth = 5;
        if (damageAnimation > 0) {
            const alpha = damageAnimation / 15;
            ctx.strokeStyle =`rgba(255, 50, 50, ${alpha})`;
        } else {
            ctx.strokeStyle = "#cc9933";
        }
        ctx.strokeRect(180, 50, 432, 432);

        // 道具アイコン
        if (tool == 1) {
            ctx.drawImage(imgShovel2, 0, 0, 16, 16, 660, 50, 48, 48);
        } else {
            ctx.drawImage(imgShovel1, 0, 0, 16, 16, 660, 50, 48, 48);
        }
        if (tool == 2) {
            ctx.drawImage(imgSankakuho2, 0, 0, 16, 16, 660, 146, 48, 48);
        } else {
            ctx.drawImage(imgSankakuho1, 0, 0, 16, 16, 660, 146, 48, 48);
        }
        if (tool == 3) {
            ctx.drawImage(imgTakebera2, 0, 0, 16, 16, 660, 242, 48, 48);
        } else {
            ctx.drawImage(imgTakebera1, 0, 0, 16, 16, 660, 242, 48, 48);
        }
        
        // 採掘範囲の線
        if (posX >= 0 && posX <= 8 && posY >= 0 && posY <= 8) {
            ctx.strokeStyle = "#cc9933";

            switch (tool) {
                case 1:
                    ctx.strokeRect((posX - 1) * 48 + 180, (posY - 1) * 48 + 50, 144, 144);
                    break;
                case 2:
                    ctx.strokeRect(posX * 48 + 180, (posY - 1) * 48 + 50, 48, 144);
                    break;
                case 3:
                    ctx.strokeRect(posX * 48 + 180, posY * 48 + 50, 48, 48);
                    break;
            }
        }

        // 採掘範囲のアニメーション表示
        if (toolAnimation > 0) {
            const alpha = toolAnimation / 15;
            ctx.strokeStyle = `rgba(255, 187, 51, ${alpha})`;
            ctx.lineWidth = 4;

            switch (tool) {
                case 1:
                    ctx.strokeRect((posX - 1) * 48 + 180, (posY - 1) * 48 + 50, 144, 144);
                    break;
                case 2:
                    ctx.strokeRect(posX * 48 + 180, (posY - 1) * 48 + 50, 48, 144);
                    break;
                case 3:
                    ctx.strokeRect(posX * 48 + 180, posY * 48 + 50, 48, 48);
                    break;
            }
        }

        // hp
        if (hp >= 5) {
            ctx.drawImage(imgHeart1, 0, 0, 10, 10, 330, 500, 30, 30);
        } else {
            ctx.drawImage(imgHeart2, 0, 0, 10, 10, 330, 500, 30, 30);
        }
        if (hp >= 4) {
            ctx.drawImage(imgHeart1, 0, 0, 10, 10, 290, 500, 30, 30);
        } else {
            ctx.drawImage(imgHeart2, 0, 0, 10, 10, 290, 500, 30, 30);
        }
        if (hp >= 3) {
            ctx.drawImage(imgHeart1, 0, 0, 10, 10, 250, 500, 30, 30);
        } else {
            ctx.drawImage(imgHeart2, 0, 0, 10, 10, 250, 500, 30, 30);
        }
        if (hp >= 2) {
            ctx.drawImage(imgHeart1, 0, 0, 10, 10, 210, 500, 30, 30);
        } else {
            ctx.drawImage(imgHeart2, 0, 0, 10, 10, 210, 500, 30, 30);
        }
        if (hp >= 1) {
            ctx.drawImage(imgHeart1, 0, 0, 10, 10, 170, 500, 30, 30);
        } else {
            ctx.drawImage(imgHeart2, 0, 0, 10, 10, 170, 500, 30, 30);
        }

        // パーティクルの描画
        for (let p of particles) {
            ctx.drawImage(
                p.img,
                p.sx, p.sy,
                p.size, p.size,
                p.x, p.y, 
                p.size * 3, p.size * 3
            );
        }
    }
    
    if (state === 2 || state === 3) {
        // 背景
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.fillRect(100, 100, 600, 360);
        ctx.strokeStyle = "#cc9933";
        ctx.strokeRect(100, 100, 600, 360);

        // スタートボタン
        ctx.fillStyle = "#000";
        ctx.font = "bold 23px sans-serif";
        ctx.textAlign = "center";
        if (mouse.x >= 145 && mouse.x <= 355 && mouse.y >= 350 && mouse.y <= 440) {
            ctx.drawImage(imgButtonFrame2, 0, 0, 70, 30, 145, 350, 210, 90);
            ctx.fillText("もう１回あそぶ", 250, 401);
        } else {
            ctx.drawImage(imgButtonFrame1, 0, 0, 70, 30, 145, 350, 210, 90);
            ctx.fillText("もう１回あそぶ", 250, 395);
        }

        // 説明ボタン
        ctx.fillStyle = "#000";
        ctx.font = "bold 23px sans-serif";
        ctx.textAlign = "center";
        if (mouse.x >= 445 && mouse.x <= 655 && mouse.y >= 350 && mouse.y <= 440) {
            ctx.drawImage(imgButtonFrame2, 0, 0, 70, 30, 445, 350, 210, 90);
            ctx.fillText("タイトルにもどる", 550, 401);
        } else {
            ctx.drawImage(imgButtonFrame1, 0, 0, 70, 30, 445, 350, 210, 90);
            ctx.fillText("タイトルにもどる", 550, 395);
        }
    }
    
    if (state === 2) {
        // 出土品の名前
        ctx.fillStyle = "#000";
        ctx.font = "bold 23px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(itemName[item][0], SCREEN_WIDTH / 2, 150);

        // ふりがな
        ctx.font = "15px sans-serif";
        ctx.fillText(itemName[item][1], SCREEN_WIDTH / 2, 125);

        // 出土品の説明
        ctx.font = "16px sans-serif";
        ctx.textAlign = "left";
        fillTextLine(explain[item], 280, 200, 25);

        // 出土品の画像
        ctx.drawImage(imgEx[item], 0, 0, 48, 48, 120, 170, 144, 144);
    }
    
    if (state === 3) {
        // ゲームオーバー
        ctx.fillStyle = "#000";
        ctx.font = "bold 23px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ゲームオーバー", 400, 150);
    }

    if (state === 4) {
        // ルール説明
        // 背景
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.fillRect(100, 100, 600, 360);
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#cc9933";
        ctx.strokeRect(100, 100, 600, 360);

        ctx.fillStyle = "#000";
        ctx.font = "bold 23px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("あそびかた", SCREEN_WIDTH / 2, 150);

        ctx.fillStyle = "#666666";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("クリックでつぎのページへ", 610, 440);

        if (tutorialPage === 0) {
            const animationFrame = tutorialAnimation % 120;
            // 本文
            ctx.fillStyle = "#000000";
            ctx.font = "16px sans-serif";
            ctx.textAlign = "left";
            fillTextLine("クリックで土をほります", 120, 400, 35);

            // 土
            if (animationFrame < 20) {
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 2 * 48 + 180, 3 * 48 + 50, 48, 48);
            }
            
            if (animationFrame < 80) {
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 6 * 48 + 180, 3 * 48 + 50, 48, 48);
            }

            // カーソル
            if (animationFrame < 20) {
                // 初めは静止
                ctx.drawImage(imgCursor, 0, 0, 16, 16, 296, 230, 48, 48);
            } else if (animationFrame < 23) {
                // クリック
                ctx.drawImage(imgCursor, 0, 0, 16, 16, 296, 225, 48, 48);
            } else if (animationFrame < 30) {
                // 少し静止
                ctx.drawImage(imgCursor, 0, 0, 16, 16, 296, 230, 48, 48);
            } else if (animationFrame < 60) {
                // 移動
                ctx.drawImage(imgCursor, 0, 0, 16, 16, 296 + (animationFrame - 30) * 6, 230, 48, 48);
            } else if (animationFrame < 80) {
                // 少し静止
                ctx.drawImage(imgCursor, 0, 0, 16, 16, 468, 230, 48, 48);
            } else if (animationFrame < 83) {
                // クリック
                ctx.drawImage(imgCursor, 0, 0, 16, 16, 468, 225, 48, 48);
            } else {
                // 静止
                ctx.drawImage(imgCursor, 0, 0, 16, 16, 468, 230, 48, 48);
            }

            // パーティクルの生成
            if (animationFrame === 20) {
                createParticles(2, 3, imgSoil2);
            } else if (animationFrame === 80) {
                createParticles(6, 3, imgSoil2);
            }
            
            // パーティクルの表示
            for (let p of particles) {
                ctx.drawImage(
                    p.img,
                    p.sx, p.sy,
                    p.size, p.size,
                    p.x, p.y,
                    p.size * 3, p.size * 3
                );
            }
        } else if (tutorialPage === 1) {
            const animationFrame = tutorialAnimation % 60;
            // 本文
            ctx.fillStyle = "#000000";
            ctx.font = "16px sans-serif";
            ctx.textAlign = "left";
            fillTextLine("土ではないところをたたくとライフがへります。ライフは全部で５つあり、　０になるとゲームオーバー。", 120, 400, 35);

            // 土
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 2 * 48 + 180, 3 * 48 + 50, 48, 48);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 3 * 48 + 180, 3 * 48 + 50, 48, 48);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 2 * 48 + 180, 4 * 48 + 50, 48, 48);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 3 * 48 + 180, 4 * 48 + 50, 48, 48);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 5 * 48 + 180, 3 * 48 + 50, 48, 48);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 6 * 48 + 180, 3 * 48 + 50, 48, 48);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 6 * 48 + 180, 4 * 48 + 50, 48, 48);            

            // カーソル
            if (animationFrame < 30) {
                // 静止
                ctx.drawImage(imgCursor, 0, 0, 16, 16, 385, 235, 48, 48);
            } else if (animationFrame < 33) {
                // クリック
                ctx.drawImage(imgCursor, 0, 0, 16, 16, 385, 230, 48, 48);
            } else {
                // 静止
                ctx.drawImage(imgCursor, 0, 0, 16, 16, 385, 235, 48, 48);
            }

            // ライフ
            ctx.drawImage(imgHeart1, 0, 0, 10, 10, 150, 330, 30, 30);
            ctx.drawImage(imgHeart1, 0, 0, 10, 10, 190, 330, 30, 30);
            ctx.drawImage(imgHeart1, 0, 0, 10, 10, 230, 330, 30, 30);
            ctx.drawImage(imgHeart1, 0, 0, 10, 10, 270, 330, 30, 30);
            if (animationFrame < 30) {
                ctx.drawImage(imgHeart1, 0, 0, 10, 10, 310, 330, 30, 30)
            } else {
                ctx.drawImage(imgHeart2, 0, 0, 10, 10, 310, 330, 30, 30)
            }

        } else if (tutorialPage === 2) {
            // 本文
            ctx.fillStyle = "#000000";
            ctx.font = "16px sans-serif";
            ctx.textAlign = "left";
            fillTextLine("道具は３つあって、それぞれはんいがきまっています。", 120, 400, 35);

            // 道具アイコン
            ctx.drawImage(imgShovel1, 0, 0, 16, 16, 180, 280, 48, 48);
            ctx.drawImage(imgSankakuho1, 0, 0, 16, 16, 380, 280, 48, 48);
            ctx.drawImage(imgTakebera1, 0, 0, 16, 16, 580, 280, 48, 48);

            // 土
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 155, 160, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 155 + 32, 160, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 155 + 64, 160, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 155, 160 + 32, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 155 + 32, 160 + 32, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 155 + 64, 160 + 32, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 155, 160 + 64, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 155 + 32, 160 + 64, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 155 + 64, 160 + 64, 32, 32);

            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 387, 160, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 387, 160 + 32, 32, 32);
            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 387, 160 + 64, 32, 32);

            ctx.drawImage(imgSoil2, 0, 0, 16, 16, 587, 160 + 32, 32, 32);

            ctx.font = "15px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("シャベル", 200, 350);
            ctx.fillText("三角ホー", 405, 350);
            ctx.fillText("竹べら", 603, 350);
        } else if (tutorialPage === 3) {
            const animationFrame = tutorialAnimation % 120;
            // 本文
            ctx.fillStyle = "#000000";
            ctx.font = "16px sans-serif";
            ctx.textAlign = "left";
            fillTextLine("色がこい土は２回ほりましょう。", 120, 400, 35);

            // 土
            if (animationFrame < 30) {
                ctx.drawImage(imgSoil, 0, 0, 16, 16, 4 * 48 + 180, 3 * 48 + 50, 48, 48);
            } else if (animationFrame < 80) {
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 4 * 48 + 180, 3 * 48 + 50, 48, 48);
            }

            // カーソル
            if (animationFrame < 30) {
                ctx.drawImage(imgCursor, 0, 0, 16, 16, 392, 230, 48, 48);
            } else if (animationFrame < 33) {
                ctx.drawImage(imgCursor, 0, 0, 16, 16, 392, 225, 48, 48);
            } else if (animationFrame < 80) {
                ctx.drawImage(imgCursor, 0, 0, 16, 16, 392, 230, 48, 48);
            } else if (animationFrame < 83) {
                ctx.drawImage(imgCursor, 0, 0, 16, 16, 392, 225, 48, 48);
            } else {
                ctx.drawImage(imgCursor, 0, 0, 16, 16, 392, 230, 48, 48);
            }

            // パーティクルの生成
            if (animationFrame === 30) {
                createParticles(4, 3, imgSoil);
            } else if (animationFrame === 80) {
                createParticles(4, 3, imgSoil2);
            }

            // パーティクルの表示
            for (let p of particles) {
                ctx.drawImage(
                    p.img,
                    p.sx, p.sy,
                    p.size, p.size,
                    p.x, p.y,
                    p.size * 3, p.size * 3
                );
            }
        } else if (tutorialPage === 4) {
            const animationFrame = tutorialAnimation % 210;
            // 本文
            ctx.fillStyle = "#000000";
            ctx.font = "16px sans-serif";
            ctx.textAlign = "left";
            fillTextLine("すべての土をほって、四條畷（しじょうなわて）の文化財（ぶんかざい）を　はっくつしよう！", 120, 400, 35);
            
            // 出土品
            ctx.drawImage(imgEx[3], 0, 0, 48, 48, 180 + 48 * 3, 50 + 48 * 3, 144, 144);

            // 土
            if (animationFrame < 30) {
                ctx.drawImage(imgSoil, 0, 0, 16, 16, 3 * 48 + 180, 3 * 48 + 50, 48, 48);
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 4 * 48 + 180, 3 * 48 + 50, 48, 48);
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 5 * 48 + 180, 3 * 48 + 50, 48, 48);
                ctx.drawImage(imgSoil, 0, 0, 16, 16, 3 * 48 + 180, 4 * 48 + 50, 48, 48);
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 4 * 48 + 180, 4 * 48 + 50, 48, 48);
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 5 * 48 + 180, 4 * 48 + 50, 48, 48);
                ctx.drawImage(imgSoil, 0, 0, 16, 16, 3 * 48 + 180, 5 * 48 + 50, 48, 48);
                ctx.drawImage(imgSoil, 0, 0, 16, 16, 4 * 48 + 180, 5 * 48 + 50, 48, 48);
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 5 * 48 + 180, 5 * 48 + 50, 48, 48);
            } else if (animationFrame < 90) {
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 3 * 48 + 180, 3 * 48 + 50, 48, 48);
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 3 * 48 + 180, 4 * 48 + 50, 48, 48);
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 3 * 48 + 180, 5 * 48 + 50, 48, 48);
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 4 * 48 + 180, 5 * 48 + 50, 48, 48);
            } else if (animationFrame < 150) {
                ctx.drawImage(imgSoil2, 0, 0, 16, 16, 4 * 48 + 180, 5 * 48 + 50, 48, 48);
            }

            // 採掘範囲
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#cc9933";
            if (animationFrame < 50) {
                ctx.strokeRect(3 * 48 + 180, 3 * 48 + 50, 48 * 3, 48 * 3);
            } else if (animationFrame < 60) {
                ctx.strokeRect(4 * 48 + 180, 3 * 48 + 50, 48, 48 * 3);
            } else if (animationFrame < 110) {
                ctx.strokeRect(3 * 48 + 180, 3 * 48 + 50, 48, 48 * 3);
            } else if (animationFrame < 120) {
                ctx.strokeRect(3 * 48 + 180, 4 * 48 + 50, 48, 48);
            } else if (animationFrame < 130) {
                ctx.strokeRect(3 * 48 + 180, 5 * 48 + 50, 48, 48);
            } else if (animationFrame < 160) {
                ctx.strokeRect(4 * 48 + 180, 5 * 48 + 50, 48, 48);
            }

            // パーティクルの生成
            if (animationFrame === 30) {
                createParticles(3, 3, imgSoil);
                createParticles(4, 3, imgSoil2);
                createParticles(5, 3, imgSoil2);
                createParticles(3, 4, imgSoil);
                createParticles(4, 4, imgSoil2);
                createParticles(5, 4, imgSoil2);
                createParticles(3, 5, imgSoil);
                createParticles(4, 5, imgSoil);
                createParticles(5, 5, imgSoil2);
            } else if (animationFrame === 90) {
                createParticles(3, 3, imgSoil2);
                createParticles(3, 4, imgSoil2);
                createParticles(3, 5, imgSoil2);
            } else if (animationFrame === 150) {
                createParticles(4, 5, imgSoil2);
            }

            // パーティクルの描画
            for (let p of particles) {
                ctx.drawImage(
                    p.img,
                    p.sx, p.sy,
                    p.size, p.size,
                    p.x, p.y,
                    p.size * 3, p.size * 3
                );
            }
        }
    }
}

function gameInit()
{
    hp = 5;
    tool = 1;
    particles = [];
    toolAnimation = 0;
    damageAnimation = 0;

    // 盤面リセット
    for (let y = 0; y < field.length; y++) {
        for (let x = 0; x < field[y].length; x++) {
            field[y][x] = 0;
        }
    }

    // 土を被せる
    for (let i = 0; i < 2; i++) {
        for (let y = 0; y < field.length; y++) {
            for (let x = 0; x < field[y].length; x++) {
                if (Math.floor(Math.random() * 5) > 1) field[y][x]++;
            }
        }
    }

    // 出土品を決める
    item = Math.floor(Math.random() * itemName.length);

    isGameClear = false;
}

function excavate(field, x, y) {
    if (field[y][x] == 2) {
        field[y][x] = 1;
        createParticles(x, y, imgSoil);
        isExcavated = true;
    } else if (field[y][x] == 1) {
        field[y][x] = 0;
        createParticles(x, y, imgSoil2);
        isExcavated = true;
    } else if (field[y][x] == 0) {
        isDamaged = true;
    }
}

// 現在不使用　DrawLine関数
// function drawLine(x1, y1, x2, y2)
// {
//     ctx.beginPath();
//     ctx.moveTo(x1, y1);
//     ctx.lineTo(x2, y2);
//     ctx.stroke();
// }

function fillTextLine(text, x, y, charNum)
{
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
        { sx: 8, sy: 4, vx:  3, vy:  0 },
        { sx: 0, sy: 4, vx: -3, vy:  0 },
        { sx: 4, sy: 0, vx:  0, vy: -3 },
        { sx: 4, sy: 8, vx:  0, vy:  3 },
        { sx: 8, sy: 0, vx:  3, vy: -3 },
        { sx: 0, sy: 0, vx: -3, vy: -3 },
        { sx: 8, sy: 8, vx:  3, vy:  3 },
        { sx: 0, sy: 8, vx: -3, vy:  3 },
    ]
    for (let p of pieces) {
        particles.push({
            x: x * 48 + 180 + 16,
            y: y * 48 + 50 + 16,
            vx: p.vx * (0.5 + Math.random() * 0.5),
            vy: p.vy * (0.5 + Math.random() * 0.5),
            life: 20,
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
    if (posX >= 0 && posX <= 8 && posY >= 0 && posY <= 8) {
        switch (tool) {
            case 1:
                if (posX != 8) {
                    if (posY != 8) excavate(field, posX + 1, posY + 1);
                    if (posY != 0) excavate(field, posX + 1, posY - 1);
                    excavate(field, posX + 1, posY);
                }
                if (posX != 0) {
                    if (posY != 8) excavate(field, posX - 1, posY + 1);
                    if (posY != 0) excavate(field, posX - 1, posY - 1);
                    excavate(field, posX - 1, posY);
                }
                if (posY != 8) excavate(field, posX, posY + 1);
                if (posY != 0) excavate(field, posX, posY - 1);
                excavate(field, posX, posY);
                break;
            case 2:
                if (posY != 8) excavate(field, posX, posY + 1);
                if (posY != 0) excavate(field, posX, posY - 1);
                excavate(field, posX, posY);
                break;
            case 3:
                excavate(field, posX, posY);
                break;
        }
    }

    // ダメージ処理
    if (isDamaged) {
        hp--;
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
    if (hp <= 0) state = 3;

    // クリアしたか？
    isGameClear = true;
    for (let y = 0; y < field.length; y++) {
        for (let x = 0; x < field[y].length; x++) {
            if (field[x][y] != 0) isGameClear = false;
        }
    }
}