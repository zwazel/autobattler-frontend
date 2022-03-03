import React from "react";
import {Sprite} from "@inlet/react-pixi";
import PIXI from "pixi.js";
import Position from "../classes/utils/Position";

interface PixiDraggable extends PIXI.DisplayObject {
    data: PIXI.InteractionData | null;
    dragging: boolean;
}

interface Props {
    image: string;
    x: number;
    y: number;
    stageSize: Position;
    gridCellSize: number;
    alignToGrid: boolean;
}

const Draggable = ({image, x, y, stageSize, gridCellSize, alignToGrid}: Props) => {
    const onDragStart = (event: PIXI.InteractionEvent) => {
        const sprite = event.currentTarget as PixiDraggable;
        sprite.alpha = 0.5;
        sprite.data = event.data;
        sprite.dragging = true;
    };

    const onDragEnd = (event: PIXI.InteractionEvent) => {
        const sprite = event.currentTarget as PixiDraggable;
        sprite.alpha = 1;
        sprite.dragging = false;
        sprite.data = null;
    };

    const onDragMove = (event: PIXI.InteractionEvent) => {
        const sprite = event.currentTarget as PixiDraggable;
        if (sprite.dragging) {
            const newPosition = sprite.data!.getLocalPosition(sprite.parent);

            if (alignToGrid) {
                if (newPosition.x <= 0) {
                    newPosition.x = gridCellSize / 2;
                }
                if (newPosition.y <= 0) {
                    newPosition.y = gridCellSize / 2;
                }
                if (newPosition.x >= (stageSize.x)) {
                    newPosition.x = (stageSize.x - gridCellSize / 2);
                }
                if (newPosition.y >= (stageSize.y)) {
                    newPosition.y = (stageSize.y - gridCellSize / 2);
                }
                sprite.x = Math.floor(newPosition.x / gridCellSize) * gridCellSize + (gridCellSize / 2);
                sprite.y = Math.floor(newPosition.y / gridCellSize) * gridCellSize + (gridCellSize / 2);
            } else {
                sprite.x = newPosition.x;
                sprite.y = newPosition.y;
            }
        }
    };

    return (
        <Sprite
            image={image}
            x={x}
            y={y}
            anchor={0.5}
            interactive
            buttonMode
            pointerdown={onDragStart}
            pointerup={onDragEnd}
            pointerupoutside={onDragEnd}
            pointermove={onDragMove}
        />
    );
};

export default Draggable;