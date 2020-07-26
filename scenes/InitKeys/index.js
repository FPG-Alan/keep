import React, { Component } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react/native'
import RSAKey from 'react-native-rsa'
import Aes from 'react-native-aes-crypto'
import * as Keychain from 'react-native-keychain';

import { View, Text, TextInput, TouchableOpacity, Alert, Image, StyleSheet, KeyboardAvoidingView, StatusBar, Keyboard } from 'react-native';
import { InputItem, List, Button, WhiteSpace, WingBlank, Toast, Steps } from 'antd-mobile';


import { client, checkPassword, checkName, storage, generateKey, encrypt } from '../../utils'
import stores from '../../stores'

const Step = Steps.Step

declare var jest: any;

@observer
export default class InitKeys extends Component<any, any> {
    entity = {
        masterpwd: '',
        public: '',
        private: '',
        aes_private: '',
        aes_iv: ''
    }

    static navigationOptions = {
        header: null,
    }
    componentDidMount = () => {
        storage.save({ key: 'entityIndex', data: 0 })
    }
    handleMasterPassword = () => {
        // TO-DO: 自动生成, 强度检测, 强度检测

        if (this.entity.masterpwd) {
            // this.step++
            Keyboard.dismiss()
            Toast.loading('RSA generating')
            setTimeout(() => { this.generateRsaKey() }, 1000)
        } else {
            Toast.loading('No input')
        }
    }
    generateRsaKey = () => {
        const bits = 1024;
        const exponent = '10001'; // must be a string. This is hex string. decimal = 65537
        var rsa = new RSAKey();
        rsa.generate(bits, exponent);
        var publicKey = rsa.getPublicString(); // return json encoded string
        var privateKey = rsa.getPrivateString(); // return json encoded string

        this.entity.public = publicKey
        this.entity.private = privateKey
        Toast.hide()

        Toast.loading('AES generating')
        setTimeout(() => { this.generateAesKey() }, 1000)
    }

    generateAesKey = () => {
        generateKey(this.entity.masterpwd, stores.user.name || 'yy').then(key => {
            encrypt(this.entity.private, key).then(({ cipher, iv }) => {
                // this.entity.aes_private = cipher
                // this.entity.aes_iv = iv
                Keychain.setGenericPassword(stores.user.name||'yy', JSON.stringify({
                    loginState: true,
                    token: stores.user.token||'',
                    name: stores.user.name||'yy',
                    encryptKeys: {
                        masterpwd: this.entity.masterpwd, 
                        rsa_public: this.entity.public,
                        aes_key: key,
                        aes_private: cipher,
                        aes_iv: iv
                    }
                }))

                stores.encrypt.public = this.entity.public
                stores.encrypt.private = this.entity.private
                this.props.navigation.navigate('Main')
                Toast.hide()
            })
        }, error => { })
    }
    render() {
        return (<View style={styles.container}>
            <List style={styles.input}>
                <InputItem placeholder='master password' onChange={(val) => { this.entity.masterpwd = val }}></InputItem>
            </List>
            <Button onClick={this.handleMasterPassword}>Next</Button>
        </View>
        )

    }
}


// define your styles
const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        // backgroundColor: '#2c3e50',
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