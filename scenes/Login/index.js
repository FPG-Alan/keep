import React, { Component } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react/native'

import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { InputItem, List, Toast } from 'antd-mobile';
import { client, checkPassword, checkName, retreiveCredential, setCredential, generateKey, decrypt } from '../../utils'
import stores from '../../stores'

declare var jest: any;

@observer
export default class Login extends Component<any, any> {
    userName = ''
    userPwd = ''

    static navigationOptions = {
        header: null,
    }
    stuffStore = (credential) => {
        // storage
        storage.load({key: 'entityIndex',autoSync: false, syncInBackground: true}).then(data => {
            stores.user.pwdNum = data
        }).catch(err => {
            // console.log(err)
            // storage.save({})
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
    handleLogin = () => {
        if (checkName(this.userName) && checkPassword(this.userPwd)) {
            stores.auth.retreiveCredential().then(credential => {
                if (credential) {
                    credential = JSON.parse(credential.password)
                    const { name, encryptKeys } = credential

                    if (this.userName === name && this.userPwd === encryptKeys.masterpwd) {
                        this.stuffStore(credential)
                        setCredential(name, Object.assign(credential, {loginState: true}))
                    } else {
                        Toast.fail('name or pwd error', 1);
                    }
                } else {
                    Toast.fail('UN or PWD error', 1);
                }
            }, error => { })
        } else {
            Toast.fail('Input error', 1);
        }
    }
    render() {
        return (<View style={styles.container}>
                <List style={styles.input}>
                    <InputItem placeholder='user name' onChange={(val) => { this.userName = val }}></InputItem>
                    <InputItem placeholder='user password' type="password" onChange={(val) => { this.userPwd = val }}></InputItem>
                </List>

                <TouchableOpacity style={styles.buttonContainer}
                    onPress={this.handleLogin}>
                    <Text style={styles.buttonText}>LOGIN</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonContainer}
                    onPress={() => this.props.navigation.navigate('Regist')}>
                    <Text style={styles.buttonText}>REGIST</Text>
                </TouchableOpacity>
            
        </View>)
    }
}


// define your styles
const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        backgroundColor: '#2c3e50',
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