import Particle from "./Particle"
import LogoImg from "./LogoImg"

// 画布类
class PCanvas {
  animateTime: number;
  imageArr: Array<LogoImg>;
  first_load: boolean;
  canvasEle: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  ParticleArr: Particle[];
  mouseX?: number; // 鼠标X轴位置
  mouseY?: number; // 鼠标Y轴位置

  constructor(target: HTMLCanvasElement, option: {animateTime: number}) {
    this.animateTime = option.animateTime
    this.imageArr = []
    this.first_load = true
    this.canvasEle = target;
    this.ctx = target.getContext("2d") as CanvasRenderingContext2D;
    this.width = target.width;
    this.height = target.height;
    this.ParticleArr = [];
    this.canvasEle.addEventListener("mousemove", this.handleMouseMove);
    this.canvasEle.onmouseleave = () => {
      this.mouseX = 0;
      this.mouseY = 0;
    };
  }

  handleMouseMove = (e: { clientX: number; clientY: number; }) => {
    const { left, top } = this.canvasEle.getBoundingClientRect();
    const { clientX, clientY } = e;
    this.mouseX = clientX - left;
    this.mouseY = clientY - top;
  }

  initImage = (images: Array<{name: string, src: string}>) => {
    try {
      let img_data = []
      for (let item of images) {
        img_data.push(new LogoImg(item.src, item.name, this.animateTime, this.width, this.height ));
      }
      this.imageArr = img_data;
    } catch (e) {
      return null
    }
  }

  changeImgByName = (name: string) => {
    if (this.first_load) {
      setTimeout(() => {
        this.changeImg(<LogoImg>this.imageArr.find(obj => obj.name === name))
      },1000)
      this.first_load = false;
    } else {
      this.changeImg(<LogoImg>this.imageArr.find(obj => obj.name === name))
    }
  }

  changeImg(img: LogoImg) {
    if (this.ParticleArr.length) {
      // 如果当前粒子数组大于新的粒子数组 删除多于的粒子
      let newPrtArr = img.particleData;
      let newLen = newPrtArr.length;
      let arr = this.ParticleArr;
      let oldLen = arr.length;

      // 调用change修改已存在粒子
      for (let idx = 0; idx < newLen; idx++) {
        const { totalX, totalY, color } = newPrtArr[idx];
        if (arr[idx]) {
          // 找到已存在的粒子 调用change 接收新粒子的属性
          arr[idx].change(totalX, totalY, color);
        } else {
          arr[idx] = new Particle(totalX, totalY, this.animateTime, color, this.width, this.height);
        }
      }

      if (newLen < oldLen) this.ParticleArr = arr.splice(0, newLen);
      arr = this.ParticleArr;
      let tmp_len = arr.length;
      // 随机打乱粒子最终对应的位置 使切换效果更自然
      while (tmp_len) {
        // 随机的一个粒子 与 倒序的一个粒子
        let randomIdx = ~~(Math.random() * tmp_len--);
        let randomPrt = arr[randomIdx];
        let { totalX: tx, totalY: ty, color } = randomPrt;

        // 交换位置
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
          new Particle(item.totalX, item.totalY, this.animateTime, item.color, this.width, this.height)
      );
    }
  }
  drawCanvas() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ParticleArr.forEach((particle) => {
      particle.update(this.mouseX, this.mouseY);
      particle.draw(this.ctx);
    });
    window.requestAnimationFrame(() => this.drawCanvas());
  }

  // 添加销毁方法
  destroy() {
    this.canvasEle.removeEventListener("mousemove", this.handleMouseMove);
    this.canvasEle.onmouseleave = null;
    this.ParticleArr.length = 0;
  }
}

export default PCanvas;