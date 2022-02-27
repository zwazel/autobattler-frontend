import {Navigate, NavLink, Route, Routes} from "react-router-dom";
import Home from "./Home";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Profile from "./Profile";
import {Button} from "react-bootstrap";
import User from "./classes/User";
import React, {useEffect} from "react";

interface userInfos {
    username: string,
    id: number,
}

export default function Navigation() {
    const [user, setUser] = React.useState<User>(new User(-1, "undefined", false));

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
                    } as userInfos;
                }
            })
            .then(r => {
                if (r.username === "undefined" && r.id === -1) {

                } else {
                    const message = JSON.parse(r.message) as userInfos;
                    const newUser = new User(message.id, message.username, true);
                    setUser(newUser);
                }
            })
    }, []);

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
            <nav>
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
                                <NavLink to={"/profile"}
                                         style={({isActive}) => isActive ? activeStyle : notActiveStyle}
                                         className={isActive => isActive ? 'active' : 'inactive'}
                                >
                                    Profile
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
                       element={user.loggedIn ? <Navigate to={"/profile"} replace={true}/> : <Login/>}/>
                <Route path={"/sign-up"}
                       element={user.loggedIn ? <Navigate to={"/profile"} replace={true}/> : <Signup/>}/>
                <Route path={"/profile"}
                       element={!user.loggedIn ? <Navigate to={"/sign-in"} replace={true}/> : <Profile user={user} />}/>
            </Routes>
        </>
    )
}