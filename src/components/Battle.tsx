import UnitTypes from "./classes/UnitTypes";
import React, {useCallback, useEffect, useState} from "react";
import Position from "./classes/utils/Position";
import Unit from "./classes/units/Unit";
import ParseUnitType from "./classes/utils/ParseUnitType";
import {Container, Stage} from "@inlet/react-pixi";
import Grid from "./pixi/Grid";
import Viewport from "./pixi/Viewport";
import Rectangle from "./pixi/graphics/Rectangle";
import Loader from "./Loader";
import UnitSprite from "./pixi/graphics/UnitSprite";
import {FormationInterface} from "./utils/FormationInterface";

export default function Battle(props: { unitTypes: UnitTypes[], formations: FormationInterface[] }) {
    const unitTypes = props.unitTypes;
    const formations = props.formations;

    const [selectedFormation, setSelectedFormation] = useState<FormationInterface>();
    const [stageSize, setStageSize] = useState<Position>(new Position(0, 0));
    const [gridCellSize, setGridCellSize] = useState<number>(0);
    const [done, setDone] = useState<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [winner, setWinner] = useState<string>();
    const [enemyFormation, setEnemyFormation] = useState<FormationInterface>();
    const [doneLoadingBattle, setDoneLoadingBattle] = useState<boolean>(true);

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

    const getFormationFromJson = useCallback((json: any, units?: Unit[], alreadyParsed?: boolean) => {
        const formationID = json.id;
        const jsonFormation = (alreadyParsed) ? json : JSON.parse(json.formationJson);
        const unitsInFormation: Unit[] = [];
        for (let unitJson of jsonFormation) {
            const unitType = unitTypes.find(unitType => unitType.typeName === unitJson.type);
            if (unitType) {
                if (units) {
                    const unit = units.find(unit => unit.id === unitJson.id);
                    if (unit) {
                        const newUnit = ParseUnitType(unitType, unit.name, unit.level, unit.id, unit.priority, unit.side, unit.position, unit.dateCollected);
                        newUnit.position = new Position(unitJson.position.x + 1, unitJson.position.y + 1);
                        unitsInFormation.push(newUnit);
                    } else {
                        throw new Error("unit not found");
                    }
                } else {
                    const newUnit = ParseUnitType(unitType, unitJson.name, unitJson.level, unitJson.id, unitJson.priority, unitJson.side, unitJson.position);
                    newUnit.position = new Position(unitJson.position.x + 1, unitJson.position.y + 1);
                    unitsInFormation.push(newUnit);
                }
            } else {
                throw new Error("UnitType not found");
            }
        }
        const formation: FormationInterface = {
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
                setLoaded(true);
            })
    }, []);

    const getUnitSprite = (props: { unit: Unit }) => {
        if (selectedFormation) {
            const unit = props.unit;

            return <UnitSprite key={unit.id} unit={unit} gridCellSize={gridCellSize} side={unit.side}/>
        } else {
            return (<></>);
        }
    }

    const startBattle = () => {
        if (selectedFormation) {
            setDoneLoadingBattle(false);
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
                const enemyFormation = getFormationFromJson(data.unitsRight, undefined, true);
                setEnemyFormation(enemyFormation);
                console.log(enemyFormation);
                setDoneLoadingBattle(true);
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
                            {doneLoadingBattle ? (
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
                                                {enemyFormation ? (
                                                    <Container key={enemyFormation.id}>
                                                        {enemyFormation.units.map(unit => (
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
                                <Loader customText={"Loading battle..."}/>
                            )}
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