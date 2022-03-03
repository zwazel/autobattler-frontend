import React, {useEffect, useState} from "react";
import PIXI from "pixi.js";
import {Container, Graphics, Sprite, Stage} from '@inlet/react-pixi'
// import myFirstUnitImage from '../assets/img/units/my_first_unit/goodSoupMobil.png'
import UnitTypes from "./classes/UnitTypes";
import Position from "./classes/utils/Position";
import ParseUnitType from "./classes/utils/ParseUnitType";
import Unit from "./classes/units/Unit";
import Loader from "./Loader";
import Viewport from "./Viewport";
import Rectangle from "./graphics/Rectangle";

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
    const [loaded, setLoaded] = useState(false);
    const [gridSize, setGridSize] = useState(new Position(0, 0));
    const [formations, setFormations] = useState<Formation[]>([]);
    const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
    const [stageSize, setStageSize] = useState(new Position(window.innerWidth * 0.75, window.innerHeight * 0.5));
    const [gridCellSize, setGridCellSize] = useState(5);

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
            if (newPosition.x > (stageSize.x - spriteWidth)) {
                newPosition.x = (stageSize.x - spriteWidth);
            }
            if (newPosition.y > (stageSize.y - spriteHeight)) {
                newPosition.y = (stageSize.y - spriteHeight);
            }
            sprite.x = Math.round(newPosition.x / gridCellSize) * gridCellSize;
            sprite.y = Math.round(newPosition.y / gridCellSize) * gridCellSize;
        }
    };

    useEffect(() => {
        fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/authenticated/battle/getGridSize/user`, {
            method: "GET",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => {
                const gridSize = new Position(data.width, data.height);
                setGridSize(gridSize);
            }).then(() => {

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
                    setLoaded(true);
                })
        });
    }, [unitTypes]);

    const getUnitSprite = (props: { unit: Unit }) => {
        const unit = props.unit;

        return (
            <Sprite
                key={unit.id}
                image={unit.image}
                x={unit.position.x * gridCellSize} y={unit.position.y * gridCellSize}
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

    const loadFormation = (formation: Formation) => {
        setSelectedFormation(formation);
    }

    // display all the formations
    return (
        <>
            <h1>Formations</h1>
            {loaded ? (
                <>
                    <div className="formations">
                        {formations.map(formation => (
                            <button key={formation.id} onClick={() => {
                                loadFormation(formation)
                            }}>
                                <p>{formation.id}</p>
                            </button>
                        ))}
                    </div>

                    <Stage
                        width={stageSize.x}
                        height={stageSize.y}
                        options={{
                            backgroundColor: 0x4287f5,
                        }}
                    >
                        <Viewport width={stageSize.x} height={stageSize.y}>
                            <Graphics>
                                <Rectangle
                                    x={0}
                                    y={0}
                                    width={stageSize.x}
                                    height={stageSize.y}
                                />
                            </Graphics>
                            {selectedFormation ? (
                                <Container>
                                    <Container key={selectedFormation.id}>
                                        {selectedFormation.units.map(unit => (
                                            getUnitSprite({unit: unit.unit})
                                        ))}
                                    </Container>
                                </Container>
                            ) : (
                                <></>
                            )}
                        </Viewport>
                    </Stage>
                </>
            ) : (
                <Loader/>
            )}
        </>
    )
}