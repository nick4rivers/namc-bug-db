import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
// If we're gonna have charts we need this
import * as serviceWorker from './serviceWorker'
import { HashRouter, Route } from 'react-router-dom'
import { devSetup } from '@northarrowresearch/react-common'
import 'react-vis/dist/style.css'
import './index.css'

require('typeface-roboto')
// This does its own process.env.NODE_ENV check
// In production it only presents a minimal set of tools
devSetup()

// WE need the redux store first because our App needs its state
ReactDOM.render(
    <HashRouter basename="/">
        <Route path="*" component={App} />
    </HashRouter>,
    document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register()
