import React, { Component } from 'react'
import { StackNavigator } from 'react-navigation'

import Intro from './scenes/Intro'
import Login from './scenes/Login'
import Regist from './scenes/Regist'
import Main from './scenes/Main'
import InitKeys from './scenes/InitKeys'

import { Add } from './scenes/Passowrd'

type Props = {};

const RootStack = StackNavigator({
  Intro: {
    screen: Intro,
  },
  Login: {
    screen: Login,
  },
  Regist: {
    screen: Regist,
  },
  Main: {
    screen: Main,
  },
  InitKeys: {
    screen: InitKeys
  },
  AddPwd: {
    screen: Add
  }
}, {
    initialRouteName: 'Intro',
  });

export default class App extends Component<Props> {
  render() {
    return <RootStack />
  }
}
