import User from "./classes/User";
import UnitTypes from "./classes/UnitTypes";
import React, {useCallback, useEffect, useState} from "react";
import Position from "./classes/utils/Position";
import GetAllUnitsOfUser from "./classes/utils/GetAllUnitsOfUser";
import Unit from "./classes/units/Unit";
import {Formation} from "./Formations";
import ParseUnitType from "./classes/utils/ParseUnitType";
import {Container, Sprite, Stage, Text} from "@inlet/react-pixi";
import Grid from "./pixi/Grid";
import Viewport from "./pixi/Viewport";
import Rectangle from "./pixi/graphics/Rectangle";
import Loader from "./Loader";

export default function Battle(props: { user: User, unitTypes: UnitTypes[] }) {
    const unitTypes = props.unitTypes;
    const user = props.user;

    const [selectedFormation, setSelectedFormation] = useState<Formation>();
    const [stageSize, setStageSize] = useState<Position>(new Position(0, 0));
    const [gridCellSize, setGridCellSize] = useState<number>(0);
    const [done, setDone] = useState<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [formations, setFormations] = useState<Formation[]>([]);
    const [winner, setWinner] = useState<string>();

    const scalePlayField = (gridSize: Position) => {
        const defaultGridSize = 64;
        const scalar = Math.floor(window.innerWidth / defaultGridSize);

        const gridCellSize = defaultGridSize + scalar;

        let stageWidth = gridSize.x * gridCellSize;
        let stageHeight = gridSize.y * gridCellSize;

        const newStageSize = new Position(stageWidth, stageHeight);

        setStageSize(newStageSize);
        setGridCellSize(gridCellSize);
        setDone(true);
    };

    const getFormationFromJson = useCallback((json: any, units: Unit[]) => {
        const formationID = json.id;
        const jsonFormation = JSON.parse(json.formationJson);
        const unitsInFormation: Unit[] = [];
        for (let unitJson of jsonFormation) {
            const unitType = unitTypes.find(unitType => unitType.typeName === unitJson.type);
            if (unitType) {
                const unit = units.find(unit => unit.id === unitJson.id);
                if (unit) {
                    const newUnit = ParseUnitType(unitType, unit.name, unit.level, unit.id, unit.side, unit.position, unit.dateCollected);
                    newUnit.position = new Position(unitJson.position.x + 1, unitJson.position.y + 1);
                    unitsInFormation.push(newUnit);
                } else {
                    throw new Error("unit not found");
                }
            } else {
                throw new Error("UnitType not found");
            }
        }
        const formation: Formation = {
            id: formationID,
            units: unitsInFormation,
        };
        return formation;
    }, [unitTypes]);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/authenticated/battle/getGridSize/battle`, {
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
                scalePlayField(gridSize);
            })
            .then(() => {
                GetAllUnitsOfUser(unitTypes).then(units => {
                    return units;
                })
                    // fetch all formations of the user, and add them to the array with their units
                    .then((units: Unit[]) => {
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
                                    const formation = getFormationFromJson(json, units);
                                    formations.push(formation);
                                }
                                setFormations(formations);
                                setLoaded(true);
                            })
                    });
            })
    }, [getFormationFromJson, unitTypes]);

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

    const getUnitSprite = (props: { unit: Unit }) => {
        if (selectedFormation) {
            const unit = props.unit;
            const scaledPosition = scalePosition(unit.position, false);

            return (
                <Sprite
                    key={unit.id}
                    image={unit.image}
                    x={scaledPosition.x}
                    y={scaledPosition.y}
                    anchor={0.5}
                    buttonMode
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
        } else {
            return (<></>);
        }
    }

    const startBattle = () => {
        if (selectedFormation) {
            fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/authenticated/battle/getFightHistory/${selectedFormation.id}`, {
                method: "GET",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            }).then(
                res => res.json()
            ).then((data) => {
                console.log(data);
                setWinner(data.winner);
            })
        }
    }

    return (
        <div>
            <h1>Battle</h1>

            {loaded ? (
                <>
                    {formations.length > 0 ? (
                        <></>
                    ) : (
                        <p>You don't seem to have any formations, go ahead and create your first!</p>
                    )}

                    <div className="formations">
                        {formations
                            .filter(formation => formation.id !== -1)
                            .map(formation => (
                                <button key={formation.id}
                                        className={selectedFormation && selectedFormation.id === formation.id ? "active" : ""}
                                        onClick={() => {
                                            if (!selectedFormation || selectedFormation.id !== formation.id) {
                                                setSelectedFormation(formation);
                                            }
                                        }}>
                                    <p>{formation.id}</p>
                                </button>
                            ))}
                    </div>
                    {done ? (
                        <>
                            <div>
                                {selectedFormation ?
                                    <button onClick={startBattle}>
                                        Start battle
                                    </button>
                                    :
                                    <></>
                                }
                            </div>
                            <div>
                                {winner ?
                                    <p>{winner} won!</p>
                                    :
                                    <></>
                                }
                            </div>
                            <div>
                                <Stage
                                    width={stageSize.x}
                                    height={stageSize.y}
                                    options={{
                                        backgroundColor: 0x4287f5,
                                        resolution: 2,
                                    }}
                                    onContextMenu={(e) => {
                                        if (e.button === 2) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }
                                    }}
                                >
                                    <Grid width={stageSize.x} height={stageSize.y}
                                          pitch={{x: gridCellSize, y: gridCellSize}}/>
                                    <Viewport width={stageSize.x} height={stageSize.y}>
                                        <Rectangle
                                            x={0}
                                            y={0}
                                            width={stageSize.x}
                                            height={stageSize.y}
                                        />
                                        {selectedFormation ? (
                                            <Container key={selectedFormation.id}>
                                                {selectedFormation.units.map(unit => (
                                                    getUnitSprite({unit: unit})
                                                ))}
                                            </Container>
                                        ) : (
                                            <></>
                                        )}
                                    </Viewport>
                                </Stage>
                            </div>
                        </>
                    ) : (
                        <p>
                            We're still working on it... Please wait :)
                        </p>
                    )}
                </>
            ) : (
                <Loader/>
            )}
        </div>
    );
}