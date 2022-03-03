import React, {useEffect, useState} from "react";
import {Container, Stage} from '@inlet/react-pixi'
// import myFirstUnitImage from '../assets/img/units/my_first_unit/goodSoupMobil.png'
import UnitTypes from "./classes/UnitTypes";
import Position from "./classes/utils/Position";
import ParseUnitType from "./classes/utils/ParseUnitType";
import Unit from "./classes/units/Unit";
import Loader from "./Loader";
import Viewport from "./Viewport";
import Rectangle from "./graphics/Rectangle";
import Draggable from "./pixi/Draggable";
import Grid from "./pixi/Grid";

interface Formation {
    id: number;
    units: UnitFormation[];
}

interface UnitFormation {
    unit: Unit;
}

export default function Formations(props: { unitTypes: UnitTypes[] }) {
    const unitTypes = props.unitTypes;
    const [loaded, setLoaded] = useState<boolean>(false);
    const [gridSize, setGridSize] = useState<Position>(new Position(0, 0));
    const [formations, setFormations] = useState<Formation[]>([]);
    const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
    const [stageSize, setStageSize] = useState<Position>(new Position(window.innerWidth * 0.75, window.innerHeight * 0.5));
    const [gridCellSize, setGridCellSize] = useState<number>(64);

    const scalePlayField = (gridSize: Position) => {
        const defaultGridSize = 64;
        const scalar = Math.floor(window.innerWidth / defaultGridSize);

        const gridCellSize = defaultGridSize + scalar;
        console.log(defaultGridSize, scalar, gridCellSize);
        let stageWidth = gridSize.x * gridCellSize;
        let stageHeight = gridSize.y * gridCellSize;

        if (stageHeight > window.innerHeight * 0.75) {
            stageHeight = window.innerHeight * 0.75;
            console.log('scaled down');
        }

        const newStageSize = new Position(stageWidth, stageHeight);

        setStageSize(newStageSize);
        setGridCellSize(gridCellSize);
        setGridSize(gridSize);
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
            <Draggable key={unit.type.typeName+"-"+unit.id} image={unit.image} x={unit.position.x} y={unit.position.y} gridCellSize={gridCellSize}
                       stageSize={stageSize}/>
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