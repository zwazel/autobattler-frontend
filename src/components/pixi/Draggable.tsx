import React from "react";
import {Sprite, Text} from "@inlet/react-pixi";
import PIXI from "pixi.js";
import Position from "../classes/utils/Position";
import Unit from "../classes/units/Unit";
import IsPositionFree from "../utils/IsPositionFree";

interface PixiDraggable extends PIXI.DisplayObject {
    data: PIXI.InteractionData | null;
    dragging: boolean;
}

interface Props {
    stageSize: Position;
    gridCellSize: number;
    alignToGrid: boolean;
    allOtherUnits: Unit[];
    unit: Unit;
    onRightClick: Function;
}

const Draggable = ({stageSize, gridCellSize, alignToGrid, allOtherUnits, unit, onRightClick}: Props) => {
    const scalePosition = (position: Position, downScale: boolean) => {
        if (downScale) {
            return new Position(
                (position.x + gridCellSize / 2) / gridCellSize,
                (position.y + gridCellSize / 2) / gridCellSize
            );
        } else {
            return new Position(
                (position.x * gridCellSize) - gridCellSize / 2,
                (position.y * gridCellSize) - gridCellSize / 2,
            );
        }
    };

    const image = unit.image;
    const upscaledPos = scalePosition(unit.position, false);
    let x = upscaledPos.x;
    let y = upscaledPos.y;

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

                x = Math.floor(newPosition.x / gridCellSize) * gridCellSize + (gridCellSize / 2);
                y = Math.floor(newPosition.y / gridCellSize) * gridCellSize + (gridCellSize / 2);
                const downScaledPos = scalePosition(new Position(x, y), true);
                if (IsPositionFree(allOtherUnits, downScaledPos)) {
                    unit.position = downScaledPos;
                    sprite.x = x;
                    sprite.y = y;
                }
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
            rightclick={
                (event: PIXI.InteractionEvent) => {
                    onRightClick(unit);
                }
            }
        >
            <Text
                text={unit.name}
                x={0}
                y={0}
                style={{
                    fontFamily: "Arial",
                    fontSize: 12,
                    fill: "white",
                    align: "center",
                }}
            />
        </Sprite>
    );
};

export default Draggable;
