import {NavLink, Route, Routes, Navigate} from "react-router-dom";
import Home from "./Home";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Profile from "./Profile";
import CheckIfLoggedIn from "./misc/CheckIfLoggedIn";


export default function Navigation() {
    const loggedIn = CheckIfLoggedIn();

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
                <Route path={"/sign-in"} element={loggedIn ? <Navigate to={"/profile"} replace={true}/> : <Login/>}/>
                <Route path={"/sign-up"} element={loggedIn ? <Navigate to={"/profile"} replace={true}/> : <Signup/>}/>
                <Route path={"/profile"} element={!loggedIn ? <Navigate to={"/sign-in"} replace={true}/> : <Profile/>}/>
            </Routes>
        </>
    )
}