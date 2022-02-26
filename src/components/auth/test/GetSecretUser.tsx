import {useState} from "react";
import {Button} from "react-bootstrap";

export default function GetSecretUser() {

    const [message, setMessage] = useState("");

    function getMessage() {
        fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/test/user`, {
            method: "GET",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
            .then(r => {
                if(r.ok) {
                    return r.json();
                } else {
                    return {
                        message: "Error!!!!! you're probably not logged in!!!",
                    }
                }
            })
            .then(r => {
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