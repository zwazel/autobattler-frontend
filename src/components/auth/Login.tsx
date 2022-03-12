import React, {useEffect, useState} from "react";
import Form from "react-bootstrap/Form";
import {Button} from "react-bootstrap";
import GetAuthInfos, {rememberMeTime, userLoginInfos} from "../classes/utils/GetAuthInfos";
import Loader from "../Loader";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [selectedRememberMeTime, setSelectedRememberMeTime] = useState<rememberMeTime>();
    const [userLoginInfo, setUserLoginInfo] = useState<userLoginInfos>({
        usernameMinLength: -1,
        usernameMaxLength: -1,
        passwordMinLength: -1,
        passwordMaxLength: -1,
        rememberMeTimes: [],
    });
    const [doneLoading, setDoneLoading] = useState(false);

    function validateForm() {
        return username.length > 0 && password.length > 0;
    }

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

    const handleChangeRememberMeTime = (event: { target: { value: any; }; }) => {
        setSelectedRememberMeTime(userLoginInfo.rememberMeTimes.find(r => r.ordinal === parseInt(event.target.value)));
    };

    async function handleSubmit(event: { preventDefault: () => void; }) {
        event.preventDefault();

        const name = selectedRememberMeTime ? selectedRememberMeTime.name : "FUUUUCK";

        const response = await fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/auth/signin`, {
            method: "POST",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            mode: 'cors',
            body: JSON.stringify({
                'username': username,
                'password': password,
                'rememberMeTime': name,
            })
        });

        if (response.ok) {
            window.location.reload();
        } else {
            alert("Sign in failed : " + response.status + " " + response.statusText + " " + JSON.stringify(response.body));
        }
    }

    return (
        <>
            {doneLoading ? (
                <>
                    <h2>Sign In</h2>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="formUsernameSignIn">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" placeholder="Enter username" value={username}
                                          onChange={e => setUsername(e.target.value)}/>
                        </Form.Group>

                        <Form.Group controlId="formPasswordSignIn">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" placeholder="Enter password" value={password}
                                          onChange={e => setPassword(e.target.value)}/>
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
                            Sign in
                        </Button>
                    </Form>
                </>
            ) : (
                <Loader/>
            )}
        </>
    );
}