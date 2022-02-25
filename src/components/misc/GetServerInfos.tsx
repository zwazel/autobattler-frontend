import {useEffect, useState} from "react";

interface ServerInfo {
    name: string;
    value: string;
}

export default function GetServerInfos() {
    const [serverInfos, setServerInfos] = useState<ServerInfo[]>([]);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_FETCH_CALL_DOMAIN}/public/server/info`)
            .then(r => r.json())
            .then(r => {
                setServerInfos(r);
            })
    }, []);

    return (
        <div>
            <h1>GetServerInfos</h1>

            <ul>
                {serverInfos.map(serverInfo => (
                    <li key={serverInfo.name}>
                        {serverInfo.name}: {serverInfo.value}
                    </li>
                ))}
            </ul>
        </div>
    );
}