import {Navigate, NavLink, Route, Routes} from "react-router-dom";
import Home from "./Home";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Profile from "./Profile";
import {Button} from "react-bootstrap";
import User from "./classes/User";
import React, {useCallback, useEffect, useState} from "react";
import Formations, {Formation} from "./Formations";
import ProfileHeader from "./ProfileHeader";
import Loader from "./Loader";
import NotFound from "./NotFound";
import GetServerInfos from "./misc/GetServerInfos";
import UnitTypes from "./classes/UnitTypes";
import Battle from "./Battle";
import GetAllUnitsOfUser from "./classes/utils/GetAllUnitsOfUser";
import Unit from "./classes/units/Unit";
import ParseUnitType from "./classes/utils/ParseUnitType";
import Position from "./classes/utils/Position";

interface userInfos {
    username: string,
    id: number,
    amountUnits: number,
    maxAmountUnits: number,
    amountFormations: number,
    maxAmountFormations: number,
}

export default function Navigation() {
    const [user, setUser] = React.useState<User>(new User(-1, "undefined", false, -1, -1, -1, -1));
    const [unitTypes, setUnitTypes] = useState<UnitTypes[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [formations, setFormations] = useState<Formation[]>([]);

    const [loading, setLoading] = useState(true);

    const getFormationFromJson = useCallback((json: any, units: Unit[], myUnitTypes: UnitTypes[]) => {
        const formationID = json.id;
        const jsonFormation = JSON.parse(json.formationJson);
        const unitsInFormation: Unit[] = [];
        for (let unitJson of jsonFormation) {
            const unitType = myUnitTypes.find(unitType => unitType.typeName === unitJson.type);
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
    }, []);

    // checks if the user is logged in
    useEffect(() => {
        fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/auth/checkIfLoggedIn`, {
            method: "GET",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
            .then(r => {
                if (r.status === 200) {
                    return r.json();
                } else if (r.status === 201) {
                    return {
                        username: "undefined",
                        id: -1,
                        amountUnits: -1,
                        maxAmountUnits: -1,
                        amountFormations: -1,
                        maxAmountFormations: -1,
                        loggedIn: false,
                    } as userInfos;
                }
            })
            .then(r => {
                if (r.username === "undefined" && r.id === -1) {
                    setLoading(false);
                } else {
                    const message = JSON.parse(r.message) as userInfos;
                    const newUser = new User(message.id, message.username, true, message.amountUnits, message.maxAmountUnits, message.amountFormations, message.maxAmountFormations);
                    setUser(newUser);

                    fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/authenticated/battle/getUnitTypes`, {
                        method: "GET",
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    })
                        .then(r => {
                            if (r.ok) {
                                return r.json();
                            } else {
                                throw new Error("Error while fetching unit types");
                            }
                        })
                        .then(r => {
                            if (r.length === 0) {
                                throw new Error("No unit types found");
                            } else {
                                let newUnitTypes: UnitTypes[] = [];
                                for (let type of r) {
                                    newUnitTypes.push(new UnitTypes(type.customNamesAllowed, type.name, type.defaultName));
                                }
                                setUnitTypes(newUnitTypes);
                                return newUnitTypes;
                            }
                        })
                        .then((unitTypes: UnitTypes[]) => {
                            GetAllUnitsOfUser(unitTypes).then(units => {
                                setUnits(units);
                                return {
                                    units: units,
                                    unitTypes: unitTypes,
                                };
                            })
                                // fetch all formations of the user, and add them to the array with their units
                                .then((props) => {
                                    const units = props.units;
                                    const unitTypes = props.unitTypes;
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
                                                const formation = getFormationFromJson(json, units, unitTypes);
                                                formations.push(formation);
                                            }
                                            setFormations(formations);
                                            setLoading(false);
                                        })
                                });
                        })
                }
            })
    }, [getFormationFromJson]);

    return (
        <div>
            {loading ?
                <Loader/>
                :
                <NavigationCaller user={user} formations={formations} units={units} unitTypes={unitTypes}/>
            }
        </div>
    );
}

function NavigationCaller(props: { user: User, units: Unit[], formations: Formation[], unitTypes: UnitTypes[] }) {
    const user = props.user;
    const unitTypes = props.unitTypes;
    const units = props.units;
    const formations = props.formations;

    async function logout(): Promise<boolean> {
        let success: boolean = false;
        await fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/auth/signout`, {
            method: "POST",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        }).then(r => {
            success = r.ok;
        });

        return success;
    }

    const activeStyle = {
        color: '#fa923f',
        textDecoration: 'underline',
    }

    const notActiveStyle = {
        color: '#ffffff',
        textDecoration: 'none',
    }

    return (
        <>
            <nav className={"App-header"}>
                <ul>
                    <li>
                        <NavLink to={"/"}
                                 style={({isActive}) => isActive ? activeStyle : notActiveStyle}
                                 className={({isActive}) => isActive ? 'active' : 'inactive'}
                        >
                            Home
                        </NavLink>
                    </li>
                    {user.loggedIn ? (
                        <>
                            <li>
                                <NavLink to={"/profile/"}
                                         style={({isActive}) => isActive ? activeStyle : notActiveStyle}
                                         className={isActive => isActive ? 'active' : 'inactive'}
                                >
                                    Profile
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={"/profile/formations/"}
                                         style={({isActive}) => isActive ? activeStyle : notActiveStyle}
                                         className={isActive => isActive ? 'active' : 'inactive'}
                                >
                                    Formations
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={"/profile/battle/"}
                                         style={({isActive}) => isActive ? activeStyle : notActiveStyle}
                                         className={isActive => isActive ? 'active' : 'inactive'}
                                >
                                    Battle
                                </NavLink>
                            </li>
                            <li>
                                <Button onClick={
                                    async () => {
                                        if (await logout()) {
                                            window.location.reload();
                                        } else {
                                            alert("Logout failed");
                                        }
                                    }
                                }>Logout</Button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <NavLink to={"/sign-in"}
                                         style={({isActive}) => isActive ? activeStyle : notActiveStyle}
                                         className={isActive => isActive ? 'active' : 'inactive'}
                                >
                                    Login
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={"/sign-up"}
                                         style={({isActive}) => isActive ? activeStyle : notActiveStyle}
                                         className={isActive => isActive ? 'active' : 'inactive'}
                                >
                                    Sign Up
                                </NavLink>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
            <Routes>
                <Route path={"/"} element={<Home/>}/>
                <Route path={"/sign-in"}
                       element={user.loggedIn ? <Navigate to={"/profile/"} replace={true}/> : <Login/>}/>
                <Route path={"/sign-up"}
                       element={user.loggedIn ? <Navigate to={"/profile/"} replace={true}/> : <Signup/>}/>
                <Route path={"/profile/*"} element={!user.loggedIn ? <Navigate to={"/sign-in"} replace={true}/> :
                    <ProfileHeader user={user}/>}>
                    <Route path={""} element={<Profile units={units} user={user} unitTypes={unitTypes}/>}/>
                    <Route path={"formations/"} element={<Formations formations={formations} units={units} user={user}
                                                                     unitTypes={unitTypes}/>}/>
                    <Route path={"battle/"} element={<Battle formations={formations} unitTypes={unitTypes}/>}/>
                </Route>
                <Route path={"/loader"} element={<Loader/>}/>
                <Route path={"/serverInfos"} element={<GetServerInfos/>}/>
                <Route path={"*"} element={<NotFound/>}/>
            </Routes>
        </>
    )
}