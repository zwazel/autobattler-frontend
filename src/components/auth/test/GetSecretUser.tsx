import {useEffect, useState} from "react";
import {Button} from "react-bootstrap";

export default function GetSecretUser() {

    const [message, setMessage] = useState("");

    function getMessage() {
        fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/test/user`, {
            method: "GET",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                cookie: document.cookie,
            },
            credentials: 'include',
            mode: 'cors',
        })
            .then(r => {
                console.log(r);
                return r.json();
            })
            .then(r => {
                console.log(r);
                setMessage(r.message);
            })
    }

    return (
        <div>
            <h1>{message}</h1>
            <Button onClick={getMessage}>GET SECRET USER STUFF!</Button>
        </div>
    )
}