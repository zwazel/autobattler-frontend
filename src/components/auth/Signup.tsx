import React, {useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import {Button} from "react-bootstrap";

interface userLoginInfos {
    usernameMinLength: number;
    usernameMaxLength: number;
    passwordMinLength: number;
    passwordMaxLength: number;
}

export default function Signup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [userLoginInfo, setUserLoginInfo] = useState<userLoginInfos>({
        usernameMinLength: -1,
        usernameMaxLength: -1,
        passwordMinLength: -1,
        passwordMaxLength: -1
    });

    useEffect(() => {
        fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/public/server/userLoginInfo`)
            .then(r => r.json())
            .then(r => {
                setUserLoginInfo(r);
            })
    }, []);

    function validateForm() {
        return username.length >= userLoginInfo.usernameMinLength && password.length >= userLoginInfo.passwordMinLength &&
            username.length <= userLoginInfo.usernameMaxLength && password.length <= userLoginInfo.passwordMaxLength;
    }

    async function handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();

        const response = await fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                'username': username,
                'password': password
            })
        });

        if (response.ok) {
            window.location.href = "../sign-in";
        } else {
            alert("Signup failed : " + response.status + " " + response.statusText + " " + JSON.stringify(response.body));
        }
    }

    return (
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

                <Button size="lg" type="submit" disabled={!validateForm()}>
                    Signup
                </Button>
            </Form>
        </>
    );
}