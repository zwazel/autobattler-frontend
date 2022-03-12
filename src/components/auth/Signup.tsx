import React, {useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import {Button} from "react-bootstrap";
import Loader from "../Loader";
import GetAuthInfos, {rememberMeTime, userLoginInfos} from "../classes/utils/GetAuthInfos";

export default function Signup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [selectedRememberMeTime, setSelectedRememberMeTime] = useState<rememberMeTime>();
    const [userLoginInfo, setUserLoginInfo] = useState<userLoginInfos>({
        usernameMinLength: -1,
        usernameMaxLength: -1,
        passwordMinLength: -1,
        passwordMaxLength: -1,
        rememberMeTimes: [],
    });
    const [doneLoading, setDoneLoading] = useState(false);

    useEffect(() => {
        GetAuthInfos().then((response) => {
            setUserLoginInfo(response);
            if (response.rememberMeTimes.length > 0) {
                setSelectedRememberMeTime(response.rememberMeTimes[0]);
            } else {
                alert("No remember me times available?!?");
            }
            setDoneLoading(true);
        });
    }, []);

    function validateForm() {
        return username.length >= userLoginInfo.usernameMinLength && password.length >= userLoginInfo.passwordMinLength &&
            username.length <= userLoginInfo.usernameMaxLength && password.length <= userLoginInfo.passwordMaxLength
            && password === confirmPassword;
    }

    async function handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();
        const name = selectedRememberMeTime ? selectedRememberMeTime.name : "FUUUUCK";

        const data = JSON.stringify({
            'username': username,
            'password': password,
            'confirmPassword': confirmPassword,
            'rememberMeTime': name,
        });

        const response = await fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/auth/signup`, {
            method: "POST",
            headers: {
                Accept: 'application/json',
                "Content-Type": "application/json"
            },
            credentials: 'include',
            mode: 'cors',
            body: data,
        });

        if (response.ok) {
            window.location.reload();
        } else {
            if (response.status === 409) {
                alert("Username already exists");
            } else {
                alert("An unknown error occurred");
            }
        }
    }

    const handleChangeRememberMeTime = (event: { target: { value: any; }; }) => {
        setSelectedRememberMeTime(userLoginInfo.rememberMeTimes.find(r => r.ordinal === parseInt(event.target.value)));
    };

    return (
        <>
            {doneLoading ?
                (
                    <>
                        <h2>Signup</h2>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="formUsernameSignup">
                                <Form.Label>Username</Form.Label>
                                <Form.Control type="text" placeholder="Enter username" value={username}
                                              onChange={e => setUsername(e.target.value)}/>
                            </Form.Group>

                            <Form.Group controlId="formPasswordSignup">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" placeholder="Enter password" value={password}
                                              onChange={e => setPassword(e.target.value)}/>
                            </Form.Group>

                            <Form.Group controlId="formPasswordSignupConfirm">
                                <Form.Label>Confirm password</Form.Label>
                                <Form.Control type="password" placeholder="Confirm password" value={confirmPassword}
                                              onChange={e => setConfirmPassword(e.target.value)}/>
                            </Form.Group>

                            <Form.Group controlId={"rememberMeTimes"}>
                                <Form.Label>Remember Me for</Form.Label>
                                <Form.Control as="select" onChange={handleChangeRememberMeTime}>
                                    {userLoginInfo.rememberMeTimes.map(r => (
                                        <option key={r.ordinal} value={r.ordinal}>{r.text}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>

                            <Button size="lg" type="submit" disabled={!validateForm()}>
                                Signup
                            </Button>
                        </Form>
                    </>
                ) : (
                    <Loader/>
                )
            }
        </>
    );
}