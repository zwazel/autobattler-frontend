import React, {useEffect, useState} from "react";
import PIXI from "pixi.js";
import {Sprite, Stage} from '@inlet/react-pixi'
// import myFirstUnitImage from '../assets/img/units/my_first_unit/goodSoupMobil.png'
import UnitTypes from "./classes/UnitTypes";
import Position from "./classes/utils/Position";
import ParseUnitType from "./classes/utils/ParseUnitType";
import Unit from "./classes/units/Unit";

interface Formation {
    id: number;
    units: UnitFormation[];
}

interface UnitFormation {
    unit: Unit;
}

interface Draggable extends PIXI.DisplayObject {
    data: PIXI.InteractionData | null;
    dragging: boolean;
}

export default function Formations(props: { unitTypes: UnitTypes[] }) {
    const unitTypes = props.unitTypes;
    console.log("unitTypes", unitTypes);
    const [formations, setFormations] = useState<Formation[]>([]);

    const stageSize = {
        width: window.innerWidth / 1.5,
        height: window.innerHeight / 1.5
    };

    const gridSize = 64;

    const onDragStart = (event: PIXI.InteractionEvent) => {
        const sprite = event.currentTarget as Draggable;
        sprite.alpha = 0.5;
        sprite.data = event.data;
        sprite.dragging = true;
    };

    const onDragEnd = (event: PIXI.InteractionEvent) => {
        const sprite = event.currentTarget as Draggable;
        sprite.alpha = 1;
        sprite.dragging = false;
        sprite.data = null;
    };

    const onDragMove = (event: PIXI.InteractionEvent) => {
        const sprite = event.currentTarget as Draggable;
        if (sprite.dragging) {
            const newPosition = sprite.data!.getLocalPosition(sprite.parent);
            const spriteWidth = sprite.parent.width / 2;
            const spriteHeight = sprite.parent.height / 2;

            if (newPosition.x < spriteWidth) {
                newPosition.x = spriteWidth;
            }
            if (newPosition.y < spriteHeight) {
                newPosition.y = spriteHeight;
            }
            if (newPosition.x > (stageSize.width - spriteWidth)) {
                newPosition.x = (stageSize.width - spriteWidth);
            }
            if (newPosition.y > (stageSize.height - spriteHeight)) {
                newPosition.y = (stageSize.height - spriteHeight);
            }
            sprite.x = Math.round(newPosition.x / gridSize) * gridSize;
            sprite.y = Math.round(newPosition.y / gridSize) * gridSize;
        }
    };

    useEffect(() => {
        fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/authenticated/user/getAllFormations`, {
            method: "GET",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
            .then(res => res.json())
            .then(data => {
                const formations: Formation[] = [];
                for (let json of data) {
                    const formationID = json.id;
                    const jsonFormation = JSON.parse(json.formationJson);
                    const unitsInFormation: Unit[] = [];
                    for (let unitJson of jsonFormation) {
                        const unitType = unitTypes.find(unitType => unitType.typeName === unitJson.name);
                        if (unitType) {
                            const unit = ParseUnitType(unitType, unitJson.name, unitJson.level, unitJson.id, undefined, new Position(unitJson.position.x, unitJson.position.y));
                            unitsInFormation.push(unit);
                        } else {
                            throw new Error("UnitType not found");
                        }
                    }
                    const formation: Formation = {
                        id: formationID,
                        units: unitsInFormation.map(unit => ({unit}))
                    };
                    formations.push(formation);
                }
                setFormations(formations);
                console.log("formations", formations);
            })
    }, [unitTypes]);

    const getUnitSprite = (props: { unit: Unit }) => {
        const unit = props.unit;

        return (
            <Sprite
                image={unit.image}
                x={unit.position.x} y={unit.position.y}
                anchor={0.5}
                interactive
                buttonMode
                pointerdown={onDragStart}
                pointerup={onDragEnd}
                pointerupoutside={onDragEnd}
                pointermove={onDragMove}
            />
        )
    }

    // display all the formations
    return (
        <>
            <h1>Formations</h1>
            <Stage width={stageSize.width} height={stageSize.height} options={{
                backgroundColor: 0x4287f5,
            }}>

            </Stage>
        </>
    )
}