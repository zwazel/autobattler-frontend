import User from "./classes/User";
import {useEffect, useState} from "react";

interface Units {
    units: Unit[];
}

interface Unit {
    id: number;
    name: string;
    level: number;
    unitType: string;
    customNamesAllowed: boolean;
}

export default function Profile(props: { user: User }) {
    const [user] = useState(props.user);
    const [units, setUnits] = useState<Units>({units: []});

    useEffect(() => {
        fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/authenticated/user/getAllUnits`, {
            method: "GET",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        }).then(r => {
            return r.json()
        }).then(r => {
            console.log("response", r);
            let units: Unit[] = [];
            for (let unit of r) {
                units.push({
                    id: unit.id,
                    name: unit.name,
                    level: unit.level,
                    unitType: unit.unitType,
                    customNamesAllowed: unit.customNamesAllowed,
                });
            }
            setUnits({units: units});
        });
    }, []);

    console.log("units", units);

    return (
        <div>
            <h1>Welcome, {user.username}</h1>
            <p>
                Your id: {user.id}
            </p>
            {/*display the units*/}
            <h2>Your units</h2>
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Level</th>
                </tr>
                </thead>
                <tbody>
                {units.units.map(unit => {
                    return (
                        <tr key={unit.id}>
                            <td>{unit.name}</td>
                            <td>{unit.unitType}</td>
                            <td>{unit.level}</td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </div>
    );
}