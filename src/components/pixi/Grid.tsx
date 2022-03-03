import React, {useCallback} from "react";
import {Graphics} from "@inlet/react-pixi";
import * as PIXI from "pixi.js";

interface GridProps {
    width: number;
    height: number;
    color?: [number, number, number];
    lineThickness?: number;
    pitch?: { x: number; y: number };
}

const shaderCode = `
  precision mediump float;

  uniform float vpw;
  uniform float vph;
  uniform float thickness;
  
  uniform vec2 offset;
  uniform vec2 pitch;
  uniform vec4 color;
  
  void main() {
    float offX = ( offset[0]) + gl_FragCoord.x;
    float offY = ( offset[1]) + (vph-  gl_FragCoord.y);
    float rX = min(abs(pitch[0] - mod(offX, pitch[0])), 
                   abs(mod(offX, pitch[0])));
    float rY = min(abs(pitch[1] - mod(offY, pitch[1])), 
                   abs(mod(offY, pitch[1])));
    if ( int(rX) <= int(thickness/2.0) ||
         int(rY) <= int(thickness/2.0)  ) {
      gl_FragColor = color;
    } else {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
  }
`;

const Grid = ({width, height, color, lineThickness, pitch}: GridProps) => {
    const draw = useCallback((g) => {
        const uniforms = {
            thickness: lineThickness,
            color: [...color!, 1.0],
            vpw: width,
            vph: height,
            offset: [0, 0],
            pitch: [pitch!.x, pitch!.y]
        };

        const gridShader = new PIXI.Filter(undefined, shaderCode, uniforms);
        g.clear();
        g.drawRect(0, 0, width, height);
        g.filters = [gridShader];
    }, [color, height, lineThickness, pitch, width]);

    return <Graphics draw={draw}/>;
};

export default Grid;

Grid.defaultProps = {
    color: [1.0, 1.0, 1.0],
    lineThickness: 1,
    pitch: {x: 50, y: 50}
};