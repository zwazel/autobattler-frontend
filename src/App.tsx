import React from 'react';
import './App.css';
import {Sprite, Stage} from '@inlet/react-pixi'
import myFirstUnitImage from './assets/img/units/my_first_unit/goodSoupMobil.png'
import GetServerInfos from "./components/misc/GetServerInfos";
import GetSecretUser from "./components/auth/test/GetSecretUser";
import {BrowserRouter} from "react-router-dom";
import Navigation from "./components/Navigation";

export default function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <header className="App-header">
                    <Navigation/>
                </header>
                <GetSecretUser/>
                <GetServerInfos/>
                <Stage>
                    <Sprite image={myFirstUnitImage} x={100} y={100}/>
                </Stage>
            </div>
        </BrowserRouter>
    );
}
