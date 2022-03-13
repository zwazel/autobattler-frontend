import React, {useCallback, useEffect, useState} from "react";
import {Container, Stage} from '@inlet/react-pixi'
import UnitTypes from "./classes/UnitTypes";
import Position from "./classes/utils/Position";
import Unit from "./classes/units/Unit";
import Loader from "./Loader";
import Viewport from "./pixi/Viewport";
import Rectangle from "./pixi/graphics/Rectangle";
import Draggable from "./pixi/Draggable";
import Grid from "./pixi/Grid";
import IsPositionFree from "./utils/IsPositionFree";
import ParseUnitType from "./classes/utils/ParseUnitType";
import {confirmAlert} from 'react-confirm-alert';
import '../assets/css/confirm-alert.css'
import User from "./classes/User";
import {Col, Container as BootstrapContainer, Row} from "react-bootstrap";
import {FormationInterface} from "./utils/FormationInterface";
import UnitPriorityDraggableList from "./classes/utils/UnitPriorityDraggableList";

export enum Mode {
    ADD = 'ADD',
    EDIT = 'EDIT',
    IDLE = 'IDLE'
}

export default function Formations(props: { user: User, unitTypes: UnitTypes[], units: Unit[], formations: FormationInterface[] }) {
    const unitTypes = props.unitTypes;
    const user = props.user;
    const units = props.units;

    const [gridSize, setGridSize] = useState<Position>(new Position(0, 0));
    const [loaded, setLoaded] = useState<boolean>(false);
    const [done, setDone] = useState<boolean>(false);
    const [formations, setFormations] = useState<FormationInterface[]>(props.formations);
    const [selectedFormation, setSelectedFormation] = useState<FormationInterface | null>(null);
    const [stageSize, setStageSize] = useState<Position>(new Position(-1, -1));
    const [gridCellSize, setGridCellSize] = useState<number>(64);
    const [mode, setMode] = useState<Mode>(Mode.IDLE);
    const [amountFormations, setAmountFormations] = useState<number>(user.amountFormations);

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
        const formationID = json.id;
        const jsonFormation = JSON.parse(json.formationJson);
        const unitsInFormation: Unit[] = [];
        for (let unitJson of jsonFormation) {
            const unitType = unitTypes.find(unitType => unitType.typeName === unitJson.type);
            if (unitType) {
                const unit = units.find(unit => unit.id === unitJson.id);
                if (unit) {
                    const newUnit = ParseUnitType(unitType, unit.name, unit.level, unit.id, unit.priority, unit.side, unit.position, unit.dateCollected);
                    newUnit.position = new Position(unitJson.position.x + 1, unitJson.position.y + 1);
                    unitsInFormation.push(newUnit);
                } else {
                    throw new Error("unit not found");
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
                setLoaded(true);
            })
    }, [getFormationFromJson, unitTypes]);

    const removeUnitFromFormation = (unit: Unit) => {
        if (selectedFormation) {
            let tempFormation = selectedFormation;
            tempFormation.units = tempFormation.units.filter(u => u.id !== unit.id);
            setSelectedFormation(tempFormation);

            setFormations(formations.map(f => f.id === selectedFormation.id ? tempFormation : f));
        }
    };

    const getUnitSprite = (props: { unit: Unit }) => {
        if (selectedFormation) {
            const unit = props.unit;

            const removeUnitFromFormationCallback = () => {
                removeUnitFromFormation(unit);
            };

            return (
                <Draggable key={unit.type.typeName + "-" + unit.id} unit={unit}
                           gridCellSize={gridCellSize} stageSize={stageSize} alignToGrid={true}
                           allOtherUnits={selectedFormation.units}
                           onRightClick={removeUnitFromFormationCallback}
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

                    // update formation in formations
                    let tempFormations = [...formations];
                    tempFormations.forEach(f => {
                        if (f.id === selectedFormation.id) {
                            f.units = tempState;
                        }
                    });
                    setFormations(tempFormations);
                } else {
                    alert("No free space left!");
                }
            }
        } else {
            throw new Error("selectedFormation is undefined");
        }
    }

    function FormationUnitManagement(props: { selectedFormation: FormationInterface | null, mode: Mode, units: Unit[] }) {
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

    function saveFormation(formation: FormationInterface) {
        if (formation.units.length > 0) {
            if ((user.maxAmountFormations < 0) || (user.amountFormations < user.maxAmountFormations)) {
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
                        return {response: response.json(), success: true};
                    } else {
                        if (response.status === 400) {
                            return {response: response.text(), success: false};
                        } else {
                            alert("Something went wrong!");
                            throw new Error("Failed to save formation");
                        }
                    }
                }).then(data => {
                    if (data.success) {
                        data.response.then(data => {
                            const formation = getFormationFromJson(data, units);
                            setFormations([...formations, formation]);
                            user.amountFormations++;
                            setAmountFormations(amountFormations + 1);
                        });
                    } else {
                        data.response.then(data => {
                            alert(data);
                        });
                    }
                })
            } else {
                alert("You can't have more than " + user.maxAmountFormations + " formations!");
            }
        } else {
            alert("No units in formation!");
        }
    }

    function updateFormation(formation: FormationInterface) {
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
                id: formation.id,
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
                    if (response.status === 400) {
                        alert("Formation already exists!");
                    } else {
                        alert("Something went wrong!");
                        throw new Error("Failed to update formation");
                    }
                }
            }).then(data => {
                const formation = getFormationFromJson(data, units);
                // replace old formation with new formation
                const newFormations = [...formations];
                newFormations[newFormations.indexOf(formation)] = formation;
                setFormations(newFormations);
                setSelectedFormation(formation);
            })
        } else {
            alert("No units in formation!");
        }
    }

    function deleteFormation() {
        if (selectedFormation) {
            if (selectedFormation.id !== -1) {
                confirmAlert({
                    title: 'Confirm to delete',
                    message: 'Are you sure you want to delete this formation?',
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

                                        user.amountFormations--;
                                        setAmountFormations(amountFormations - 1);
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

                    <div>
                        <h2>You can create new
                            formations: {((user.maxAmountFormations < 0) || (amountFormations < user.maxAmountFormations)) ? 'Yes' : 'No'}</h2>
                    </div>

                    <div className="formations">
                        {formations
                            .filter(formation => formation.id !== -1)
                            .map(formation => (
                                <button key={formation.id}
                                        className={selectedFormation && selectedFormation.id === formation.id ? "active" : ""}
                                        onClick={() => {
                                            setMode(Mode.EDIT);
                                            if (!selectedFormation || selectedFormation.id !== formation.id) {
                                                setSelectedFormation(formation);
                                            }
                                        }}>
                                    <p>{formation.id}</p>
                                </button>
                            ))}
                        {((user.maxAmountFormations < 0) || (amountFormations < user.maxAmountFormations)) ? (
                            <button
                                className={selectedFormation && selectedFormation.id === -1 ? "active" : ""}
                                onClick={() => {
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
                        ) : (
                            <></>
                        )}
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
                        <BootstrapContainer>
                            <Row>
                                <Col>
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
                                            {selectedFormation && mode !== Mode.IDLE ? (
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
                                </Col>
                                <Col>
                                    {selectedFormation ? (
                                        <UnitPriorityDraggableList units={selectedFormation.units}/>
                                    ) : (
                                        <></>
                                    )}
                                </Col>
                            </Row>
                        </BootstrapContainer>
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