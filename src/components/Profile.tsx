import User from "./classes/User";
import {useEffect, useState} from "react";
import Loader from "./Loader";
import UnitTypes from "./classes/UnitTypes";
import GetAllUnitsOfUser from "./classes/utils/GetAllUnitsOfUser";
import Unit from "./classes/units/Unit";
import ParseUnitType from "./classes/utils/ParseUnitType";

export default function Profile(props: { user: User, unitTypes: UnitTypes[] }) {
    const user = props.user;
    const unitTypes = props.unitTypes;
    const [units, setUnits] = useState<Unit[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [newUnitName, setNewUnitName] = useState((unitTypes.length > 0) ? unitTypes[0].typeName : "");
    const [newUnitType, setNewUnitType] = useState<UnitTypes>((unitTypes.length > 0) ? unitTypes[0] : new UnitTypes(false, "undefined", "undefined"));
    const [newUnitLevel, setNewUnitLevel] = useState(1);

    const [messagesEnd, setMessagesEnd] = useState<HTMLDivElement | null>(null);
    const [amountUnits, setAmountUnits] = useState(user.amountUnits);

    const scrollToBottom = () => {
        messagesEnd?.scrollIntoView({behavior: "smooth"});
    }

    useEffect(() => {
        GetAllUnitsOfUser(unitTypes).then(units => {
            setUnits(units);
            console.log(units);
            setLoaded(true);
        });
    }, [unitTypes]);

    function getTimeFormatted(dateString: string) {
        const date = new Date(dateString);

        const year = date.getFullYear();

        const month = date.getMonth() + 1;
        const monthString = (month < 10) ? "0" + month : month;

        const day = date.getDate();
        const dayString = (day < 10) ? "0" + day : day;

        const hours = date.getHours();
        const hoursString = (hours < 10) ? "0" + hours : hours;

        const minutes = date.getMinutes();
        const minutesString = minutes < 10 ? '0' + minutes : minutes;

        return dayString + '.' + monthString + '.' + year + ', ' + hoursString + ':' + minutesString;
    }

    return (
        <div>
            <h1>Welcome, {user.username}</h1>
            <p>
                Your id: {user.id}
            </p>
            <p>
                You can create more units: {(amountUnits < user.maxAmountUnits) ? "Yes" : "No"}
            </p>

            <h2>Your units</h2>
            {loaded ?
                <>
                    <table>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Level</th>
                            <th>Type</th>
                            <th>Date collected</th>
                            <th>Update</th>
                        </tr>
                        </thead>
                        <tbody>
                        {units.map(unit => {
                            return (
                                <tr key={unit.id}>
                                    <td>{unit.type.customNamesAllowed ?
                                        <input type="text" defaultValue={unit.name}
                                               onChange={e => unit.name = e.target.value}/>
                                        :
                                        unit.name}
                                    </td>
                                    <td>
                                        <input min={1} type="number" defaultValue={unit.level}
                                               onChange={e => unit.level = +e.target.value}/>
                                    </td>
                                    <td>{unit.type.typeName}</td>
                                    <td>{getTimeFormatted(unit.dateCollected)}</td>
                                    <td>
                                        <button onClick={async function () {
                                            await fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/authenticated/user/updateUnit`, {
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
                                        }}>
                                            Update
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                        {(amountUnits < user.maxAmountUnits) ?
                            <tr>
                                <td>
                                    {newUnitType.customNamesAllowed ?
                                        <input type="text" value={newUnitName}
                                               onChange={e => setNewUnitName(e.target.value)}/>
                                        :
                                        newUnitType.defaultName
                                    }
                                </td>
                                <td>
                                    <input min={1} type="number" value={newUnitLevel}
                                           onChange={e => setNewUnitLevel(+e.target.value)}/>
                                </td>
                                <td>
                                    <select onChange={e => setNewUnitType(unitTypes[+e.target.value])}>
                                        {unitTypes.map(type => {
                                            return <option key={type.typeName}
                                                           value={unitTypes.indexOf(type)}>{type.typeName}</option>
                                        })}
                                    </select>
                                </td>
                                <td/>
                                <td>
                                    <button onClick={async function () {
                                        const data = {
                                            name: newUnitName,
                                            level: newUnitLevel,
                                            unitType: newUnitType.typeName,
                                        };

                                        const response = await fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/authenticated/user/addUnit`, {
                                            method: "POST",
                                            headers: {
                                                Accept: 'application/json',
                                                'Content-Type': 'application/json',
                                            },
                                            credentials: 'include',
                                            body: JSON.stringify(data)
                                        });

                                        if (response.ok) {
                                            const unit = await response.json();
                                            console.log(unit);
                                            const unitType = unitTypes.find(ut => ut.typeName === unit.unitType);
                                            if (unitType) {
                                                const newUnit = ParseUnitType(unitType, unit.name, unit.level, unit.id, undefined, undefined, unit.dateCollected);
                                                // add newUnit to units
                                                let myUnits = units;
                                                myUnits.push(newUnit);
                                                setUnits(myUnits);
                                                setNewUnitName(newUnitType.defaultName);
                                                setNewUnitLevel(1);
                                                setAmountUnits(amountUnits + 1);
                                                scrollToBottom();
                                            } else {
                                                throw new Error("Unit type not found");
                                            }
                                        }
                                    }}>
                                        Add
                                    </button>
                                </td>
                            </tr>
                            :
                            <></>
                        }
                        </tbody>
                    </table>
                    <div ref={(el) => {
                        setMessagesEnd(el);
                    }}>
                    </div>
                </>
                :
                <Loader/>
            }
        </div>
    );
}