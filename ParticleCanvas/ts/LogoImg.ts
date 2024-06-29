import Particle from "./Particle"

/** Logo图片类 */
class LogoImg {
  src: string;
  name: string;
  animateTime: number;
  width: number;
  height: number;
  particleData: Particle[]; // 用于保存筛选后的粒子

  constructor(src: string, name: string, animateTime: number, width: number, height: number) {
    this.src = src;
    this.name = name;
    this.animateTime = animateTime
    this.width = width;
    this.height = height
    this.particleData = [];
    let img = new Image();
    img.crossOrigin = '';
    img.src = src;
    // canvas 获取粒子位置数据
    img.onload = () => {
      // 获取图片像素数据
      const tmp_canvas = document.createElement("canvas"); // 创建一个空的canvas
      const tmp_ctx = tmp_canvas.getContext("2d");
      const imgW = width;
      const imgH = ~~(width * (img.height / img.width));
      tmp_canvas.width = imgW;
      tmp_canvas.height = imgH;
      tmp_ctx?.drawImage(img, 0, 0, imgW, imgH); // 将图片绘制到canvas中
      const imgData = tmp_ctx?.getImageData(0, 0, imgW, imgH).data; // 获取像素点数据
      tmp_ctx?.clearRect(0, 0, width, height);

      // 筛选像素点
      for (let y = 0; y < imgH; y += 5) {
        for (let x = 0; x < imgW; x += 5) {
          // 像素点的序号
          const index = (x + y * imgW) * 4;
          // 帅选条件为透明度
          const r = imgData![index];
          const g = imgData![index + 1];
          const b = imgData![index + 2];
          const a = imgData![index + 3];
          const sum = r + g + b + a;
          if (sum >= 100) {
            const particle = new Particle(x, y, this.animateTime, [r, g, b, a], width, height);
            this.particleData.push(particle);
          }
        }
      }
    };
  }
}

export default LogoImg;