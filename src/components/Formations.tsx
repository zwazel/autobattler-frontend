import {useEffect} from "react";
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
                    console.log(JSON.parse(json.formationJson));
                }
            })
    }, []);

    // display all the formations
    return (
        <>
            <h1>Formations</h1>
        </>
    )
}