/** 粒子点阵绘制
 * 2023.8.7
 */

const animateTime = 50;
const opacityStep = 1 / animateTime;
const Radius = 40;
const Intend = 0.95;

/* 粒子类 */
class Particle {
  constructor(totalX, totalY, time, color, canvasEle) {
    // 设置粒子的初始位置x、y，目标位置totalX、totalY，总耗时time，半径，颜色
    this.x = Math.random() * canvasEle.width >> 0;
    this.y = Math.random() * canvasEle.height >> 0;
    this.totalX = totalX;
    this.totalY = totalY;
    this.time = time;
    this.r = 1.0;
    this.color = [...color];
    this.opacity = 0.5;
    this.context = canvasEle.getContext('2d')
  }

  // 在画布中绘制粒子
  draw() {
    this.context.fillStyle = `rgba(${this.color.toString()})`;
    this.context.fillRect(this.x, this.y, this.r * 2, this.r * 2);
    this.context.fill();
  }

  // 粒子驱赶操作
  update(mouseX, mouseY) {
    // 设置粒子需要移动的距离和速度
    this.mx = this.totalX - this.x;
    this.my = this.totalY - this.y;
    this.vx = this.mx / this.time;
    this.vy = this.my / this.time;
    // 计算粒子与鼠标的距离
    if (mouseX && mouseY) {
      let dx = mouseX - this.x;
      let dy = mouseY - this.y;
      let distance = Math.sqrt(dx ** 2 + dy ** 2);
      // 粒子相对鼠标距离的比例，判断受到的力度比例，并设置阈值
      let disPercent = Radius / distance;
      disPercent = disPercent > 7 ? 7 : disPercent;
      // 获得夹角值，正弦值，余弦值
      let angle = Math.atan2(dy, dx);
      let cos = Math.cos(angle);
      let sin = Math.sin(angle);
      // 将力度转换为速度 并重新计算vx vy
      let repX = cos * disPercent * -Intend;
      let repY = sin * disPercent * -Intend;
      this.vx += repX;
      this.vy += repY;
    }
    this.x += this.vx;
    this.y += this.vy;
    if (this.opacity < 1) this.opacity += opacityStep;
  }

  // 切换粒子
  change(x, y, color) {
    this.totalX = x;
    this.totalY = y;
    this.color = [...color];
  }
}

/* 图片类 */
export class LogoImg {
  constructor(url, label, canvasEle) {
    this.url = url;
    this.label = label;
    this.particleData = [];
    // canvas 解析数据源获取粒子数据
    let img = new Image();
    img.crossOrigin = "";
    img.src = url;
    img.onload = () => {
      // 创建一个空的canvas获取图片像素数据
      const tmp_canvas = document.createElement("canvas");
      const tmp_ctx = tmp_canvas.getContext("2d");
      const imgW = canvasEle.width;
      const imgH = Math.floor(canvasEle.width * (img.height / img.width));
      tmp_canvas.width = imgW;
      tmp_canvas.height = imgH;
      // 将图片绘制到canvas中
      tmp_ctx?.drawImage(img, 0, 0, imgW, imgH);
      // 获取像素点数据
      const imgData = tmp_ctx?.getImageData(0, 0, imgW, imgH).data;
      tmp_ctx?.clearRect(0, 0, canvasEle.width, canvasEle.height);
      // 筛选像素点
      for (let y = 0; y < imgH; y += 5) {
        for (let x = 0; x < imgW; x += 5) {
          // 像素点的序号
          const index = (x + y * imgW) * 4;
          // 在数组中对应的值
          const r = imgData[index];
          const g = imgData[index + 1];
          const b = imgData[index + 2];
          const a = imgData[index + 3];
          const sum = r + g + b + a;
          // 筛选条件
          if (sum >= 100) {
            const particle = new Particle(x, y, animateTime, [r, g, b, a], canvasEle);
            this.particleData.push(particle);
          }
        }
      }
    }
  }
}


// 画布类
export default class Canvas {
  constructor(target) {
    this.img_list = []
    this.first_load = true
    // 设置画布，获取画布上下文
    this.canvasEle = target;
    this.context = target.getContext("2d");
    this.width = target.width;
    this.height = target.height;
    this.ParticleArr = [];
    // 监听鼠标移动
    this.handleMouseMove = (e) => {
      const { left, top } = this.canvasEle.getBoundingClientRect();
      const { clientX, clientY } = e;
      this.mouseX = clientX - left;
      this.mouseY = clientY - top;
    };
    this.canvasEle.addEventListener("mousemove", this.handleMouseMove);
    this.canvasEle.onmouseleave = () => {
      this.mouseX = 0;
      this.mouseY = 0;
    };
  }

  // 通过LogoImg类初始化图片，生成点阵粒子
  initImage = (url_list) => {
    try {
      let img_data = []
      for (let item of url_list) {
        img_data.push(new LogoImg(item.url, item.label, this.canvasEle));
      }
      this.img_list = img_data;
    } catch (e) {
      return null
    }
  }
  // 根据label更换显示图片
  changeImgByLabel = (label) => {
    if (this.first_load === true) {
      setTimeout(() => {
        this.changeImg(this.img_list.find(obj => obj.label === label))
      },1000)
      this.first_load = false;
    } else {
      this.changeImg(this.img_list.find(obj => obj.label === label))
    }
  }
  // 改变图片 如果已存在图片则根据情况额外操作
  changeImg(img) {
    if (this.ParticleArr.length) {
      // 获取新旧两个粒子数组与它们的长度
      let newPrtArr = img.particleData;
      let newLen = newPrtArr.length;
      let arr = this.ParticleArr;
      let oldLen = arr.length;
      // 调用change修改已存在粒子
      for (let idx = 0; idx < newLen; idx++) {
        const { totalX, totalY, color } = newPrtArr[idx];
        if (arr[idx]) {
          // 找到已存在的粒子，调用change接收新粒子的属性
          arr[idx].change(totalX, totalY, color);
        } else {
          // 新粒子数组较大，生成缺少的粒子
          arr[idx] = new Particle(totalX, totalY, animateTime, color, this.canvasEle);
        }
      }
      // 新粒子数组较小，删除多余的粒子
      if (newLen < oldLen) {
        this.ParticleArr = arr.splice(0, newLen)
      }
      arr = this.ParticleArr;
      let tmp_len = arr.length;
      // 随机打乱粒子最终对应的位置 使切换效果更自然
      while (tmp_len) {
        // 随机的一个粒子与倒序的一个粒子
        let randomIdx = ~~(Math.random() * tmp_len--);
        let randomPrt = arr[randomIdx];
        let { totalX: tx, totalY: ty, color } = randomPrt;
        // 交换目标位置与颜色
        randomPrt.totalX = arr[tmp_len].totalX;
        randomPrt.totalY = arr[tmp_len].totalY;
        randomPrt.color = arr[tmp_len].color;
        arr[tmp_len].totalX = tx;
        arr[tmp_len].totalY = ty;
        arr[tmp_len].color = color;
      }
    } else {
      this.ParticleArr = img.particleData.map(
        (item) =>
          new Particle(item.totalX, item.totalY, animateTime, item.color, this.canvasEle)
      );
    }
  }
  // 绘制画布
  drawCanvas() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.ParticleArr.forEach((particle) => {
      particle.update(this.mouseX, this.mouseY);
      particle.draw();
    });
    this.animationFrameId = window.requestAnimationFrame(() => this.drawCanvas());
  }

  destroy() {
    // 执行销毁清理工作
    this.canvasEle.removeEventListener("mousemove", this.handleMouseMove);
    window.cancelAnimationFrame(this.animationFrameId);
  }
}

