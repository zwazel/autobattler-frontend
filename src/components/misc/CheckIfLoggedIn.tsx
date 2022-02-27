import {useEffect, useState} from "react";

export default function CheckIfLoggedIn() {
    const [loggedIn, setLoggedIn] = useState(false);

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
                if (r.status === 200) {
                    setLoggedIn(true);
                } else if (r.status === 201) {
                    setLoggedIn(false);
                }
            })
    }, []);

    return loggedIn as boolean;
}