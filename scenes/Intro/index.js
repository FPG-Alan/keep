import React, { Component } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react/native'

import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { InputItem, List, Toast } from 'antd-mobile';
import { client, checkPassword, checkName, retreiveCredential, setCredential, generateKey, decrypt } from '../../utils'
import stores from '../../stores'

declare var jest: any;

@observer
export default class Intro extends Component<any, any> {
    userName = ''
    userPwd = ''

    static navigationOptions = {
        header: null,
    }

    componentWillMount() {
        // check login state
        // this.props.navigation.navigate('InitKeys')
        stores.auth.retreiveCredential().then(credential => {
            
            if (credential) {
                credential = JSON.parse(credential.password)
                console.log(credential)
                if (credential.loginState) {
                    this.stuffStore(credential)
                }else{
                    this.props.navigation.navigate('Login')
                }
            }else{
                this.props.navigation.navigate('Login')
            }
        })
    }
    stuffStore = (credential) => {
        // storage
        storage.load({key: 'entityIndex',autoSync: false, syncInBackground: true}).then(data => {
            stores.user.pwdNum = data
        }).catch(err => {
        })
         // encrypt 
        const { name, id, token, encryptKeys } = credential
        // for increment credential modify
        stores.encrypt.credentialIncrement = credential

        stores.user.name = name
        id && (stores.user.id = id)
        token && (stores.user.token = token)

        // already inited
        // this.props.navigation.navigate('Init')
        if (encryptKeys) {
            const { rsa_public, aes_private, aes_iv, aes_key } = encryptKeys
            // stores.encrypt.masterpwd = masterpwd
            stores.encrypt.public = rsa_public
            // retreive AES key ( generated with master password and user name as salt)
            decrypt({ cipher: aes_private, iv: aes_iv }, aes_key).then(rsa_private => {
                // fullfill store.encrypt with {masterpwd, public, private}

                stores.encrypt.private = rsa_private
                this.props.navigation.navigate('Main')
            }, error => { console.log(error) });
        } else {
            this.props.navigation.navigate('InitKeys')
        } 
    }
    render() {
        return (<View style={styles.container}>
            <Image resizeMode="contain" style={styles.logo} source={require('./logo-dark-bg.png')} />
        </View>)
    }
}


// define your styles
const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        backgroundColor: '#2c3e50',
        alignItems: 'center',
        justifyContent: 'center'
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