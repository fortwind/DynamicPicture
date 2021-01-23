// https://blog.csdn.net/winter2121/article/details/107870041
/* 雪运动对象 */
class FlakeMove {
    constructor(canvasWidth, canvasHeight, flakeSize, fallSpeed) {
        this.x = Math.floor(Math.random() * canvasWidth);   /* x坐标 */
        this.y = Math.floor(Math.random() * canvasHeight);  /* y坐标 */
        this.size = Math.random() * flakeSize + 2;          /* 形状 */
        this.maxSize = flakeSize;                           /* 最大形状 */
        this.speed = Math.random() * 1 + fallSpeed;         /* 坠落速度 */
        this.fallSpeed = fallSpeed;                         /* 坠落速度 */
        this.velY = this.speed;                             /* Y方向速度 */
        this.velX = 0;                                      /* X方向速度 */
        this.stepSize = Math.random() / 30;                 /* 步长 */
        this.step = 0;                                      /* 步数 */
    }

    /**
     * 
     * @param {number} boundaryWidth 画布宽度
     * @param {number} boundaryHeight 画布高度
     * @param {number} faultBoundaryWidth 容错边界 拓展画布边界范围
     * @param {number} offsetX 雪花位置偏移量
     */
    update(boundaryWidth, boundaryHeight, faultBoundaryWidth = 0, offsetX = 0) {
        /* 左右摆动(余弦) */
        this.velX *= 0.98;
        if (this.velY <= this.speed) {
            this.velY = this.speed;
        }
        this.velX += Math.cos(this.step += 0.05) * this.stepSize;

        this.y += this.velY;
        this.x += this.velX;
        this.x += offsetX;
        /* 飞出边界的处理 */
        if (this.x >= (boundaryWidth + faultBoundaryWidth) || this.x <= (0 - faultBoundaryWidth) || this.y >= boundaryHeight || this.y <= 0) {
            this.reset(boundaryWidth, boundaryHeight)
        }
    }

    reset(width, height) {
        this.x = Math.floor(Math.random() * width);
        this.y = 0;
        this.size = Math.random() * this.maxSize + 2;
        this.speed = Math.random() * 1 + this.fallSpeed;
        this.velY = this.speed;
        this.velX = 0;
    }

    render(ctx) {
        const x = toFixed(this.x, 2),
            y = toFixed(this.y, 2),
            size = toFixed(this.size, 2);

        const snowFlake = ctx.createRadialGradient(x, y, 0, x, y, size);
        snowFlake.addColorStop(0, "rgba(255, 255, 255, 0.9)");  /* 此处是雪花颜色，默认是白色 */
        snowFlake.addColorStop(0.5, "rgba(255, 255, 255, 0.5)"); /* 若要改为其他颜色，请自行查 */
        snowFlake.addColorStop(1, "rgba(255, 255, 255, 0)");    /* 找16进制的RGB 颜色代码。 */
        ctx.save();
        ctx.fillStyle = snowFlake;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/* 控制下雪 */
class SnowFall {
    constructor(snow = {}) {
        /* 可配置属性 */
        this.maxFlake = snow.maxFlake || 200;   /* 最多片数 */
        this.flakeSize = snow.flakeSize || 10;  /* 雪花形状 */
        this.fallSpeed = snow.fallSpeed || 1;   /* 坠落速度 */
        this.flakes = new Array(this.maxFlake);

        let canvas = snow.canvas;
        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.width = document.body.offsetWidth;
            canvas.height = window.innerHeight;
            document.querySelector("body").appendChild(canvas);
        }
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        /* 窗口大小改变的处理 */
        // window.onresize = function () {
            // snowcanvas.width = document.body.offsetWidth;
        /* snowcanvas.height = window.innerHeight */
        // }
        this.offsetX = 0;                       /* 控制X轴偏移量 */
    }

    setOffsetX(x) {
        this.offsetX = x;
    }

    init() {
        /* 创建雪花形状 */
        this.createFlakes();
        /* 画雪 */
        this.drawSnow();

        return this;
    }

    createFlakes() {
        const { canvas, maxFlake, flakeSize, fallSpeed, flakes } = this;
        for(let i = 0; i < maxFlake; i++) {
            flakes[i] = new FlakeMove(canvas.width, canvas.height, flakeSize, fallSpeed);
        }
    }

    drawSnow() {
        const { flakes, ctx, canvas } = this;
        /* 清空雪花 */
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        flakes.forEach(flake => {
            flake.update(canvas.width, canvas.height, 100, this.offsetX);
            flake.render(ctx, this.offsetX);
        });
        this.setOffsetX(0);
        /*  一帧一帧的画 || 此处交由外部控制 */
        requestAnimationFrame(this.drawSnow.bind(this));
        // setTimeout(() => {
        //     this.drawSnow();
        // }, 1000);
    }
}

// /* 调用及控制方法 */
function main() {
    const snow = new SnowFall({ maxFlake: 200 }).init();
    const animate = () => {
        snow.drawSnow();
        requestAnimationFrame(animate);
    }
    // animate();
}
// main();
