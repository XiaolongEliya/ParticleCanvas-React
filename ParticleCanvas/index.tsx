"use client"
import React, {useEffect, useRef, useState} from "react";
import classNames from "classnames";

import PCanvas from "./ts/PCanvas"

interface ParticleCanvasProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  images: Array<{name: string, src: string}>;
  name: string;
  width: number;
  height: number;
}

const ParticleCanvas = React.forwardRef<HTMLDivElement, ParticleCanvasProps>((props, ref) => {
  const {
    children,
    className,
    style = {},
    images = [],
    name,
    width,
    height,
    ...restProps
  } = props;

  const mergedStyle: React.CSSProperties = {
    width: width,
    height: height,
    ...style,
  };

  const mergedCls = classNames(
    className,
  );

  let [particleCanvas, setParticleCanvas] = useState<PCanvas>();

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = width
      canvasRef.current.height = height
      const pCanvas = new PCanvas(canvasRef.current, {animateTime: 30})
      pCanvas.drawCanvas();
      pCanvas.initImage(images)
      setParticleCanvas(pCanvas)
      return () => {
        pCanvas.destroy()
      }
    }
  }, [height, images, width]);

  useEffect(() => {
    if (particleCanvas) {
      particleCanvas.changeImgByName(name)
    }
  }, [name, particleCanvas]);

  return (
    <div ref={ref} className={mergedCls} style={mergedStyle} {...restProps}>
      <canvas ref={canvasRef} style={{width, height}}>
        {children}
      </canvas>
    </div>
  );
});

ParticleCanvas.displayName = 'ParticleCanvas';

export default ParticleCanvas;

