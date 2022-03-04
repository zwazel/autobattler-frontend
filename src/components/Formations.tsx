import React, {useCallback, useEffect, useRef, useState} from "react";
import {Container, Stage} from '@inlet/react-pixi'
import UnitTypes from "./classes/UnitTypes";
import Position from "./classes/utils/Position";
import Unit from "./classes/units/Unit";
import Loader from "./Loader";
import Viewport from "./pixi/Viewport";
import Rectangle from "./graphics/Rectangle";
import Draggable from "./pixi/Draggable";
import Grid from "./pixi/Grid";
import GetAllUnitsOfUser from "./classes/utils/GetAllUnitsOfUser";
import IsPositionFree from "./utils/IsPositionFree";
import ParseUnitType from "./classes/utils/ParseUnitType";
import {confirmAlert} from 'react-confirm-alert';
import '../assets/css/confirm-alert.css'

export interface Formation {
    id: number;
    units: Unit[];
}

export enum Mode {
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
    const formationIDCounter = useRef<number>(0);

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

    const getFormationFromJson = useCallback((json: any, units: Unit[]) => {
        const formationID = (json.id <= 0) ? formationIDCounter.current : json.id;
        formationIDCounter.current = formationID + 1;
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
                                    const formation = getFormationFromJson(json, units);
                                    formations.push(formation);
                                }
                                setFormations(formations);
                                setLoaded(true);
                            })
                    });
            })
    }, [getFormationFromJson, unitTypes]);

    const getUnitSprite = (props: { unit: Unit }) => {
        if (selectedFormation) {
            const unit = props.unit;

            return (
                <Draggable key={unit.type.typeName + "-" + unit.id} unit={unit}
                           gridCellSize={gridCellSize} stageSize={stageSize} alignToGrid={true}
                           allOtherUnits={selectedFormation.units}
                />
            )
        } else {
            return (<></>);
        }
    }

    const findFreeSpace = (): Position => {
        if (selectedFormation) {
            for (let x = 1; x < gridSize.x; x++) {
                for (let y = 1; y < gridSize.y; y++) {
                    const posToCheck = new Position(x, y);
                    if (IsPositionFree(selectedFormation.units, posToCheck)) {
                        return posToCheck;
                    }
                }
            }
        }
        return new Position(-1, -1);
    }

    const addUnitToSelectedFormation = (unit: Unit) => {
        if (selectedFormation) {
            if (!selectedFormation.units.find(u => u.id === unit.id)) {
                unit.position = findFreeSpace();

                if (unit.position.x !== -1 && unit.position.y !== -1) {
                    let tempState = [...selectedFormation.units];
                    tempState.push(unit);
                    setSelectedFormation({
                        ...selectedFormation,
                        units: tempState,
                    });
                } else {
                    alert("No free space left!");
                }
            }
        } else {
            throw new Error("selectedFormation is undefined");
        }
    }

    function FormationUnitManagement(props: { selectedFormation: Formation | null, mode: Mode, units: Unit[] }) {
        const {selectedFormation, mode, units} = props;

        return (
            <div>
                <p>{mode}</p>
                {units.filter(unit => (
                    selectedFormation && selectedFormation.units.find(u => u.id === unit.id) === undefined
                ))
                    .map(unit => (
                        <button key={unit.type.typeName + "-" + unit.id} onClick={() => {
                            addUnitToSelectedFormation(unit);
                        }}>
                            <p>{unit.name}</p>
                        </button>
                    ))}
            </div>
        )
    }

    function SaveOrUpdateFormation() {
        if (selectedFormation) {
            if (selectedFormation.id === -1) {
                saveFormation(selectedFormation);
            } else {
                updateFormation(selectedFormation);
            }
        } else {
            throw new Error("selectedFormation is undefined");
        }
    }

    function saveFormation(formation: Formation) {
        if (formation.units.length > 0) {
            const unitData = [];
            let priorityCounter = 1;
            for (let unit of formation.units) {
                unitData.push({
                    id: unit.id,
                    priority: priorityCounter++, // todo: PRIORITY
                    position: {
                        x: unit.position.x - 1,
                        y: unit.position.y - 1,
                    },
                });
            }

            const data = {
                units: unitData
            }

            fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/authenticated/user/addFormation`, {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data)
            }).then(response => {
                if (response.ok) {
                    setSelectedFormation(null);
                    return response.json();
                } else {
                    throw new Error("Failed to save formation");
                }
            }).then(data => {
                const formation = getFormationFromJson(data, units);
                setFormations([...formations, formation]);
            })
        } else {
            alert("No units in formation!");
        }
    }

    function updateFormation(formation: Formation) {
        console.log("todo update formation", formation);
    }

    function deleteFormation() {
        if (selectedFormation) {
            if (selectedFormation.id !== -1) {
                confirmAlert({
                    title: 'Confirm to delete',
                    message: 'Are you sure to delete this formation?',
                    buttons: [
                        {
                            label: 'Yes',
                            onClick: () => {
                                const data = {
                                    formationID: selectedFormation.id
                                }

                                fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/authenticated/user/deleteFormation`, {
                                    method: "POST",
                                    headers: {
                                        Accept: 'application/json',
                                        'Content-Type': 'application/json',
                                    },
                                    credentials: 'include',
                                    body: JSON.stringify(data)
                                }).then(response => {
                                    if (response.ok) {
                                        const newFormations = formations.filter(f => f.id !== selectedFormation.id);
                                        setFormations(newFormations);

                                        setSelectedFormation(null);
                                    } else {
                                        throw new Error("Failed to delete formation");
                                    }
                                })
                            }
                        },
                        {
                            label: 'No',
                            onClick: () => {
                                return;
                            }
                        }
                    ]
                })
            }
        } else {
            throw new Error("selectedFormation is undefined");
        }
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
                        {formations
                            .filter(formation => formation.id !== -1)
                            .map(formation => (
                                <button key={formation.id} onClick={() => {
                                    setMode(Mode.EDIT);
                                    if (!selectedFormation || selectedFormation.id !== formation.id) {
                                        setSelectedFormation(formation);
                                    }
                                }}>
                                    <p>{formation.id}</p>
                                </button>
                            ))}
                        <button onClick={() => {
                            setMode(Mode.ADD);
                            const newFormation = formations.find(f => f.id === -1);
                            if (newFormation) {
                                if (!selectedFormation || selectedFormation.id !== newFormation.id) {
                                    setSelectedFormation(newFormation);
                                }
                            } else {
                                const newFormation = {
                                    id: -1,
                                    units: [],
                                };
                                formations.push(newFormation);
                                setSelectedFormation(newFormation);
                            }
                        }}>
                            <p>New</p>
                        </button>
                    </div>
                    {mode !== Mode.IDLE ? (
                        <>
                            {selectedFormation ? (
                                <div>
                                    <FormationUnitManagement selectedFormation={selectedFormation} mode={mode}
                                                             units={units}/>

                                    <button onClick={() => {
                                        SaveOrUpdateFormation();
                                    }}>
                                        <p>{selectedFormation.id === -1 ? "Save" : "Update"}</p>
                                    </button>

                                    <button onClick={() => {
                                        setMode(Mode.IDLE);

                                        if (selectedFormation && selectedFormation.id === -1) {
                                            formations.splice(formations.indexOf(selectedFormation), 1);
                                        }

                                        setSelectedFormation(null);
                                    }}>
                                        <p>Cancel</p>
                                    </button>

                                    {selectedFormation.id !== -1 ? (
                                        <button onClick={() => {
                                            deleteFormation();
                                        }}>
                                            <p>Delete</p>
                                        </button>
                                    ) : (
                                        <></>
                                    )}
                                </div>
                            ) : (
                                <p>No formation selected</p>
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
                                {selectedFormation && mode !== Mode.IDLE ? (
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