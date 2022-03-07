import Unit, {Side} from "../../classes/units/Unit";
import {Sprite, Text} from "@inlet/react-pixi";
import React from "react";
import Position from "../../classes/utils/Position"; // if side is enemy, then flip the sprite

export default function UnitSprite(props: { side: Side, unit: Unit, gridCellSize: number }) {
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

    const {unit, gridCellSize} = props;
    const scaledPos = scalePosition(unit.position, false);

    return (
        <Sprite
            image={unit.image}
            x={scaledPos.x}
            y={scaledPos.y}
            anchor={0.5}
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
    )
}