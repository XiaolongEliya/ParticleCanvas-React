import React, {Component} from "react";
import Canvas from './js/ParticleCanvas'

class ParticleCanvas extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.particleCanvas = null;
  }

  componentDidMount() {
    this.init_Canvas()
    this.particleCanvas.initImage(this.props.image)
    this.particleCanvas.changeImgByLabel(this.props.label)
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.image !== this.props.image) {
      this.componentDidMount()
    }
    if (prevProps.label !== this.props.label) {
      this.clickLogo(this.props.label)
    }
  }

  componentWillUnmount() {
    this.particleCanvas.destroy()
  }

  clickLogo(label) {
    this.particleCanvas.changeImgByLabel(label)
  }

  // 初始化画布
  init_Canvas = () => {
    if (this.canvasRef.current) {
      this.context = this.canvasRef.current.getContext("2d");
      this.particleCanvas = new Canvas(this.canvasRef.current);
      this.particleCanvas.drawCanvas();
    }
  }


  render() {
    return (
      <canvas ref={this.canvasRef} width={this.props.width} height={this.props.height}></canvas>
    );
  }
}

export default ParticleCanvas;

