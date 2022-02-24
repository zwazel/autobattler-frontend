import {useEffect, useState} from "react";

interface ServerInfo {
    name: string;
    value: string;
}

function GetServerInfos() {
    const [serverInfos, setServerInfos] = useState<ServerInfo[]>([]);

    useEffect(() => {
        fetch("http://localhost:8080/api/public/server/info")
            .then(r => r.json())
            .then(r => {
                console.log(r);
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

export default GetServerInfos;