import React from 'react';
import './App.css';
import {Sprite, Stage} from '@inlet/react-pixi'
import myFirstUnitImage from './assets/img/units/my_first_unit/goodSoupMobil.png'
import GetServerInfos from "./components/misc/GetServerInfos";
import {HashRouter} from "react-router-dom";
import Navigation from "./components/Navigation";

export default function App() {
    return (
        <HashRouter>
            <div className="App">
                <header className="App-header">
                    <Navigation/>
                </header>
                <GetServerInfos/>
                <Stage>
                    <Sprite image={myFirstUnitImage} x={100} y={100}/>
                </Stage>
            </div>
        </HashRouter>
    );
}
