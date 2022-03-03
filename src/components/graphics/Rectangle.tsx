import React, {useCallback} from "react";
import {Graphics} from "@inlet/react-pixi";

export default function Rectangle(props: { x: number, y: number, width: number, height: number, filled?: boolean, fillColor?: number }) {
    const x = props.x;
    const y = props.y;
    const width = props.width;
    const height = props.height;
    const filled = props.filled || false;
    const fillColor = props.fillColor || 0x000000;

    const draw = useCallback((g) => {
        g.clear();
        if (filled) {
            g.beginFill(fillColor);
        } else {
            g.lineStyle(1, fillColor);
        }
        g.drawRect(x, y, width, height);
        if (filled) {
            g.endFill();
        } else {
            g.lineStyle(1, fillColor);
        }
    }, [fillColor, filled, height, width, x, y]);

    return <Graphics draw={draw}/>;
}