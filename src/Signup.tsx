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
        usernameMinLength: 0,
        usernameMaxLength: 0,
        passwordMinLength: 0,
        passwordMaxLength: 0
    });

    useEffect(() => {
        fetch("public/server/userLoginInfo")
            .then(r => r.json())
            .then(r => {
                console.log(r);
                setUserLoginInfo(r);
            })
    }, []);

    function validateForm() {
        return username.length >= userLoginInfo.usernameMinLength && password.length >= userLoginInfo.passwordMinLength &&
            username.length <= userLoginInfo.usernameMaxLength && password.length <= userLoginInfo.passwordMaxLength;
    }

    function handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" placeholder="Enter username" value={username}
                              onChange={e => setUsername(e.target.value)}/>
            </Form.Group>

            <Form.Group controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Enter password" value={password}
                              onChange={e => setPassword(e.target.value)}/>
            </Form.Group>

            <Button size="lg" type="submit" disabled={!validateForm()}>
                Login
            </Button>
        </Form>
    );
}