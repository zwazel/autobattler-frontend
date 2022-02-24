import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Sprite, Stage} from '@inlet/react-pixi'
import myFirstUnitImage from './assets/img/units/my_first_unit/goodSoupMobil.png'

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
            <Stage>
                <Sprite image={myFirstUnitImage} x={100} y={100}/>
            </Stage>
        </div>
    );
}

export default App;
