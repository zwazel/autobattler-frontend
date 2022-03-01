import React from 'react';
import './App.css';
import GetServerInfos from "./components/misc/GetServerInfos";
import {HashRouter} from "react-router-dom";
import Navigation from "./components/Navigation";

export default function App() {
    return (
        <HashRouter>
            <div className="App">
                <Navigation/>
                <GetServerInfos/>
            </div>
        </HashRouter>
    );
}
