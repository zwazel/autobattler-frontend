import User from "./classes/User";
import {useEffect, useState} from "react";
import Loader from "./Loader";

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
    const [loaded, setLoaded] = useState(false);

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
            setLoaded(true);
        });
    }, []);

    return (
        <div>
            <h1>Welcome, {user.username}</h1>
            <p>
                Your id: {user.id}
            </p>

            <h2>Your units</h2>
            {loaded ?
                <table>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Level</th>
                        <th>Type</th>
                        <th>Update</th>
                    </tr>
                    </thead>
                    <tbody>
                    {units.units.map(unit => {
                        return (
                            <tr key={unit.id}>
                                <td>{unit.customNamesAllowed ?
                                    <input type="text" defaultValue={unit.name}
                                           onChange={e => unit.name = e.target.value}/>
                                    :
                                    unit.name}
                                </td>
                                <td>
                                    <input type="number" defaultValue={unit.level}
                                           onChange={e => unit.level = +e.target.value}/>
                                </td>
                                <td>{unit.unitType}</td>
                                <td>
                                    <button onClick={async function () {
                                        const response = await fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/authenticated/user/updateUnit`, {
                                            method: "POST",
                                            headers: {
                                                Accept: 'application/json',
                                                'Content-Type': 'application/json',
                                            },
                                            credentials: 'include',
                                            body: JSON.stringify({
                                                id: unit.id,
                                                name: unit.name,
                                                level: unit.level,
                                            })
                                        });
                                        console.log("response", response);
                                    }}>
                                        Update
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>
                :
                <Loader/>
            }
        </div>
    );
}