import {Navigate, NavLink, Route, Routes} from "react-router-dom";
import Home from "./Home";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Profile from "./Profile";
import CheckIfLoggedIn from "./misc/CheckIfLoggedIn";
import {Button} from "react-bootstrap";


export default function Navigation() {
    const loggedIn = CheckIfLoggedIn();

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
                        <NavLink to={"/autobattler-frontend/"}
                                 style={({isActive}) => isActive ? activeStyle : notActiveStyle}
                                 className={({isActive}) => isActive ? 'active' : 'inactive'}
                        >
                            Home
                        </NavLink>
                    </li>
                    {loggedIn ? (
                        <>
                            <li>
                                <NavLink to={"/autobattler-frontend/profile/"}
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
                                <NavLink to={"/autobattler-frontend/sign-in/"}
                                         style={({isActive}) => isActive ? activeStyle : notActiveStyle}
                                         className={isActive => isActive ? 'active' : 'inactive'}
                                >
                                    Login
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={"/autobattler-frontend/sign-up/"}
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
                <Route path={"/autobattler-frontend/*"}>
                    <Route path={""} element={<Home/>}/>
                    <Route path={"sign-in/"}
                           element={loggedIn ? <Navigate to={"../profile/"} replace={true}/> : <Login/>}/>
                    <Route path={"sign-up/"}
                           element={loggedIn ? <Navigate to={"../profile/"} replace={true}/> : <Signup/>}/>
                    <Route path={"profile/"}
                           element={!loggedIn ? <Navigate to={"../sign-in/"} replace={true}/> : <Profile/>}/>
                </Route>
            </Routes>
        </>
    )
}