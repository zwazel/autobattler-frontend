import {useEffect, useState} from "react";
import User from "../classes/User";

interface userInfos {
    username: string,
    id: number,
}

export default function CheckIfLoggedIn() {
    const [loggedInUser, setLoggedInUser] = useState<User>();

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
                if (r.ok) {
                    return r.json();
                } else if (r.status === 201) {

                }
            })
            .then(r => {
                const message = r.message as userInfos;
                if (message) {
                    console.log(message);
                    setLoggedInUser(new User(message.id, message.username));
                }
            })
    }, []);

    console.log("loggedInUser", loggedInUser);

    return true;
}