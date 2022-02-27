import {NavLink, Route, Routes} from "react-router-dom";
import {useEffect, useState} from "react";
import Home from "./Home";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Profile from "./Profile";


export default function Navigation() {
    const [loggedIn, setLoggedIn] = useState(false);

    const activeStyle = {
        color: '#fa923f',
        textDecoration: 'underline',
    }

    const notActiveStyle = {
        color: '#ffffff',
        textDecoration: 'none',
    }

    useEffect(() => {
        fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/test/user`, {
            method: "GET",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
            .then(r => {
                console.log(r);
                if (r.ok) {
                    setLoggedIn(true);
                } else {
                    setLoggedIn(false);
                }
            })
    }, []);

    console.log("loggedIn", loggedIn);

    return (
        <>
            <nav>
                <ul>
                    <li>
                        <NavLink to={"/autobattler-frontend"}
                                 style={({isActive}) => isActive ? activeStyle : notActiveStyle}
                                 className={({isActive}) => isActive ? 'active' : 'inactive'}
                        >
                            Home
                        </NavLink>
                    </li>
                    {loggedIn ? (
                        <li>
                            <NavLink to={"/profile"}
                                     style={({isActive}) => isActive ? activeStyle : notActiveStyle}
                                     className={isActive => isActive ? 'active' : 'inactive'}
                            >
                                Profile
                            </NavLink>
                        </li>
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
                <Route path={"/autobattler-frontend"} element={<Home/>}/>
                <Route path={"/sign-in"} element={<Login/>}/>
                <Route path={"/sign-up"} element={<Signup/>}/>
                <Route path={"/profile"} element={<Profile/>}/>
            </Routes>
        </>
    )
}