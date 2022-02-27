import {useEffect, useState} from "react";

export default function CheckIfLoggedIn() {
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/test/user`, {
            method: "GET",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
            .then(r => {
                if (r.ok) {
                    setLoggedIn(true);
                } else {
                    setLoggedIn(false);
                }
            })
    }, []);

    return loggedIn as boolean;
}