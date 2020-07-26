import React, { Component } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react/native'

import { View, Text, TextInput, TouchableOpacity, Alert, Image, StyleSheet, KeyboardAvoidingView, StatusBar } from 'react-native';
import { InputItem, List, Button, WhiteSpace, WingBlank, Toast } from 'antd-mobile';


import { client, checkPassword, checkName } from '../../utils'

declare var jest: any;

@observer
export default class Regist extends Component<any, any> {
    @observable step = 0;

    userName = ''
    userPwd = ''
    userMasterPwd = ''

    static navigationOptions = ({ navigation }) => {
        const { params } = navigation.state;

        return {
            title: 'Regist'
        }
    }

    handleBasicInfo = () => {
        if (checkName(this.userName) && checkPassword(this.userPwd)) {
            //regist new user to server
            Toast.loading('Loading...');
            client.post('user/create', { name: this.userName, password: this.userPwd }, true).then(data => {
                /* if(!data.error){
                    Toast.hide()
                    this.props.navigation.navigate('Intro')
                }else{
                    Toast.hide()
                    Toast.fail(data.error.summary, 1);
                } */
                console.log(data)
                Toast.hide()
                this.props.navigation.navigate('Intro')
            }, error=>{
                Toast.hide()
                Toast.fail('Input error', 1);
            })
            
        } else {
            Toast.fail('Input error', 1);
        }
    }
    render() {
        return (<View style={styles.container}>
            <View>
                <List style={styles.input}>
                    <InputItem placeholder='user name' onChange={(val) => { this.userName = val }}></InputItem>
                    <InputItem placeholder='user password' type="password" onChange={(val) => { this.userPwd = val }}></InputItem>

                    <Button onClick={this.handleBasicInfo}>Next</Button>
                </List>
            </View>
        </View>)

    }
}


// define your styles
const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        backgroundColor: '#ffffff',
    },
    loginContainer: {
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'center'
    },
    logo: {
        position: 'absolute',
        width: 300,
        height: 100
    },
    formContainer: {
        padding: 20
    },
    input: {
        marginBottom: 10,
    },
    buttonContainer: {
        backgroundColor: '#2980b6',
        paddingVertical: 15,
        marginBottom: 10
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '700'
    }
})