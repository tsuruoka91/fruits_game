const WIDTH = 480;
const HEIGHT = 580;
OFFSET_Y = 250
const BORDER = 16;
const FRUITS = [
    {
        size: 32,
        src: "cherry.png"
    },
    {
        size: 44,
        src: "ichigo.png"
    },
    {
        size: 64,
        src: "budou.png"
    },
    {
        size: 70,
        src: "mikan.png"
    },
    {
        size: 88,
        src: "kaki.png"
    },
    {
        size: 120,
        src: "apple.png"
    },
    {
        size: 128,
        src: "nasi.png"
    },
    {
        size: 168,
        src: "momo.png"
    },
    {
        size: 178,
        src: "pine.png"
    },
    {
        size: 220,
        src: "meron.png"
    },
    {
        size: 260,
        src: "suika.png"
    }
];

var nowNo = 0;
var nextNo = 0;
var cloudX = 0;

// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Events = Matter.Events,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
    element: document.getElementById("main"),
    engine: engine,
    options: {
        width: WIDTH,
        height: HEIGHT + OFFSET_Y,
        background: "rgba(244, 244, 190, 255)", //背景色
        wireframes: false
      }
});

const canvas = document.getElementsByTagName("canvas")[0];

// 箱作成
options = {
    isStatic: true,
    render: {
        fillStyle: "rgba(243, 214, 130, 255)",
    }
};
Composite.add(engine.world, [
    Bodies.rectangle(WIDTH/2, HEIGHT-BORDER/2 + OFFSET_Y, WIDTH, BORDER, options),
    Bodies.rectangle(BORDER/2, HEIGHT/2 + OFFSET_Y, BORDER, HEIGHT, options),
    Bodies.rectangle(WIDTH - BORDER/2, HEIGHT/2 + OFFSET_Y, BORDER, HEIGHT, options),
]);

var images;
var kumoImage;
(async () => {
    const promises = FRUITS.map(f => {
        return new Promise((resolve) => {
            const image = new Image();
            image.onload = () => { resolve(image); };
            image.src = f.src;
            return image;
        });
    });

    promises.push(new Promise((resolve) => {
        kumoImage = new Image();
        kumoImage.onload = () => { resolve(kumoImage); };
        kumoImage.src = "kumo.png";
    }));

    // すべての画像を読み込むまで待機する
    images = await Promise.all(promises);

    // run the renderer
    Render.run(render);

    // create runner
    var runner = Runner.create();

    // run the engine
    Runner.run(runner, engine);
})();


// マウス、タッチ移動
function move(e) {
    var rect = e.target.getBoundingClientRect();
    // マウスとタッチを分岐
    if(e.clientX){
        x = e.clientX - rect.left;
    }else{
        x = e.touches[0].clientX - rect.left;
    }
    cloudX = x;
    if(cloudX < BORDER + 35) cloudX = BORDER + 35;
    if(cloudX > WIDTH - 55) cloudX = WIDTH - 55;
}
canvas.addEventListener("mousemove", move, false);
canvas.addEventListener("touchmove", move, false);

// クリックされたら
function click(e) {
    addFruits(cloudX, OFFSET_Y - 50, nowNo);
    nowNo = nextNo;
    nextNo = Math.floor(Math.random() * 4);
}
canvas.addEventListener("click", click, false);

// フルーツを追加する
function addFruits(x, y, no){
    const fruits = FRUITS[no];
    const body = Bodies.circle(x, y, fruits.size / 2, {
        render: {
            sprite: {
                texture: fruits.src
            },
            no: no // フルーツの番号を付加しておく
        }
    });
    Composite.add(engine.world, body);
}

// 衝突
Matter.Events.on(engine, 'collisionStart', function(event) {
    event.pairs.forEach(function(pair) {
        // 同じフルーツだったら
        if (pair.bodyA.render.no == pair.bodyB.render.no) {
            // 削除
            Composite.remove(engine.world, pair.bodyA);
            Composite.remove(engine.world, pair.bodyB);

            // 進化したフルーツ追加
            const no = pair.bodyA.render.no + 1;
            if(no < FRUITS.length) {
                addFruits(pair.bodyA.position.x, pair.bodyA.position.y, no);
            }
        }
    });
});

Events.on(render, 'afterRender', function() {
    const ctx = canvas.getContext("2d");
    ctx.drawImage(kumoImage, cloudX - 20, OFFSET_Y - 150);
    const image = images[nowNo];
    ctx.drawImage(image, cloudX - image.width / 2, OFFSET_Y - 50 - image.height / 2);
    ctx.drawImage(images[nextNo], 400, 30);
});
