import {useEffect} from "react";
import {Sprite, Stage} from '@inlet/react-pixi'
import myFirstUnitImage from '../assets/img/units/my_first_unit/goodSoupMobil.png'
import {UnitType} from "./Navigation";

// interface Formation {
//     id: number;
//     units: UnitFormation[];
// }
//
// interface UnitFormation {
//     unit: Unit;
// }

export default function Formations(props: { unitTypes: UnitType[] }) {
    // const unitTypes = props.unitTypes;
    // const [formations, setFormations] = useState<Formation[]>([]);

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
                for (let json of data) {
                    const jsonFormation = JSON.parse(json.formationJson);
                    console.log(jsonFormation);
                }
            })
    }, []);

    // display all the formations
    return (
        <>
            <h1>Formations</h1>
            <Stage>
                <Sprite image={myFirstUnitImage} x={100} y={100}/>
            </Stage>
        </>
    )
}