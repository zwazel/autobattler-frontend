import React, {useEffect, useState} from "react";
import {Container, Stage} from '@inlet/react-pixi'
// import myFirstUnitImage from '../assets/img/units/my_first_unit/goodSoupMobil.png'
import UnitTypes from "./classes/UnitTypes";
import Position from "./classes/utils/Position";
import Unit from "./classes/units/Unit";
import Loader from "./Loader";
import Viewport from "./pixi/Viewport";
import Rectangle from "./graphics/Rectangle";
import Draggable from "./pixi/Draggable";
import Grid from "./pixi/Grid";
import GetAllUnitsOfUser from "./classes/utils/GetAllUnitsOfUser";

interface Formation {
    id: number;
    units: Unit[];
}

enum Mode {
    ADD = 'ADD',
    EDIT = 'EDIT',
    IDLE = 'IDLE'
}

export default function Formations(props: { unitTypes: UnitTypes[] }) {
    const unitTypes = props.unitTypes;
    const [gridSize, setGridSize] = useState<Position>(new Position(0, 0));
    const [loaded, setLoaded] = useState<boolean>(false);
    const [done, setDone] = useState<boolean>(false);
    const [units, setUnits] = useState<Unit[]>([]);
    const [formations, setFormations] = useState<Formation[]>([]);
    const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
    const [stageSize, setStageSize] = useState<Position>(new Position(window.innerWidth * 0.75, window.innerHeight * 0.5));
    const [gridCellSize, setGridCellSize] = useState<number>(64);
    const [mode, setMode] = useState<Mode>(Mode.IDLE);

    const scalePlayField = (gridSize: Position) => {
        const defaultGridSize = 64;
        const scalar = Math.floor(window.innerWidth / defaultGridSize);

        const gridCellSize = defaultGridSize + scalar;
        let stageWidth = gridSize.x * gridCellSize;
        let stageHeight = gridSize.y * gridCellSize;

        const newStageSize = new Position(stageWidth, stageHeight);

        setStageSize(newStageSize);
        setGridCellSize(gridCellSize);
        setGridSize(gridSize);
        setDone(true);
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
                scalePlayField(gridSize);
            })
            .then(() => {
                GetAllUnitsOfUser(unitTypes).then(units => {
                    setUnits(units);
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
                                    const formationID = json.id;
                                    const jsonFormation = JSON.parse(json.formationJson);
                                    const unitsInFormation: Unit[] = [];
                                    for (let unitJson of jsonFormation) {
                                        const unitType = unitTypes.find(unitType => unitType.typeName === unitJson.type);
                                        if (unitType) {
                                            const unit = units.find(unit => unit.id === unitJson.id);
                                            if (unit) {
                                                unit.position = new Position(unitJson.position.x, unitJson.position.y);
                                                unitsInFormation.push(unit);
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
                                    formations.push(formation);
                                }
                                setFormations(formations);
                                console.log(formations);
                                setLoaded(true);
                            })
                    });
            })
    }, [unitTypes]);

    const getUnitSprite = (props: { unit: Unit }) => {
        const unit = props.unit;

        return (
            <Draggable key={unit.type.typeName + "-" + unit.id} image={unit.image}
                       x={(unit.position.x * gridCellSize) - gridCellSize / 2}
                       y={(unit.position.y * gridCellSize) - gridCellSize / 2}
                       gridCellSize={gridCellSize} stageSize={stageSize} alignToGrid={true}/>
        )
    }

    const findFreeSpace = (): Position => {
        const posToCheck = new Position(1, 1);
        if (isPositionFree(posToCheck)) {
            return posToCheck;
        }

        for (let x = 1; x < gridSize.x; x++) {
            for (let y = 1; y < gridSize.y; y++) {
                posToCheck.x = x;
                posToCheck.y = y;
                if (isPositionFree(posToCheck)) {
                    return posToCheck;
                }
            }
        }
        return new Position(-1, -1);
    }

    const isPositionFree = (position: Position): boolean => {
        return true;
    }

    return (
        <>
            <h1>Formations</h1>
            {loaded ? (
                <>
                    {formations.length > 0 ? (
                        <></>
                    ) : (
                        <p>You don't seem to have any formations, go ahead and create your first!</p>
                    )}
                    <div className="formations">
                        {formations.map(formation => (
                            <button key={formation.id} onClick={() => {
                                setSelectedFormation(formation);
                                setMode(Mode.EDIT);
                            }}>
                                <p>{formation.id}</p>
                            </button>
                        ))}
                        <button onClick={() => {
                            setSelectedFormation(null);
                            setMode(Mode.ADD);
                        }}>
                            <p>New</p>
                        </button>
                    </div>
                    {mode !== Mode.IDLE ? (
                        <>
                            {(mode === Mode.ADD) ? (
                                <div>
                                    <p>{mode}</p>
                                    {units.map(unit => (
                                        <button key={unit.type.typeName + "-" + unit.id} onClick={() => {
                                            if (selectedFormation) {
                                                selectedFormation.units.push(unit);
                                                setSelectedFormation(selectedFormation);
                                            }
                                        }}>
                                            <p>{unit.name}</p>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <p>{mode}</p>
                                    {units.map(unit => (
                                        <>
                                            {selectedFormation && !selectedFormation.units.find(u => u.id === unit.id) ? (
                                                <button key={unit.type.typeName + "-" + unit.id}
                                                        onClick={() => {
                                                            unit.position = findFreeSpace();
                                                            selectedFormation.units.push(unit);
                                                            setSelectedFormation(selectedFormation);
                                                            console.log("addedUnitToFormation", unit);
                                                        }}>
                                                    <p>{unit.name}</p>
                                                </button>
                                            ) : (
                                                <></>
                                            )}
                                        </>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <p>Please select one of your formations or create a new one</p>
                    )}
                    {done ? (
                        <Stage
                            width={stageSize.x}
                            height={stageSize.y}
                            options={{
                                backgroundColor: 0x4287f5,
                            }}
                        >
                            <Grid width={stageSize.x} height={stageSize.y} pitch={{x: gridCellSize, y: gridCellSize}}/>
                            <Viewport width={stageSize.x} height={stageSize.y}>
                                <Rectangle
                                    x={0}
                                    y={0}
                                    width={stageSize.x}
                                    height={stageSize.y}
                                />
                                {selectedFormation ? (
                                    <Container>
                                        <Container key={selectedFormation.id}>
                                            {selectedFormation.units.map(unit => (
                                                getUnitSprite({unit: unit})
                                            ))}
                                        </Container>
                                    </Container>
                                ) : (
                                    <></>
                                )}
                            </Viewport>
                        </Stage>
                    ) : (
                        <p>
                            We're still working on it... Please wait :)
                        </p>
                    )}
                </>
            ) : (
                <Loader/>
            )}
        </>
    )
}