import React, { Component } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react/native'
import RSAKey from 'react-native-rsa'

import { View, Text, TouchableOpacity, Image, StyleSheet, Keyboard } from 'react-native';
import { InputItem, List, Toast } from 'antd-mobile';
import { client, checkPassword, checkName, retreiveCredential, setCredential, generateKey, decrypt } from '../../utils'
import stores from '../../stores'

declare var jest: any;

export default class Add extends Component<any, any> {
    pwdName = ''
    pwdValue = ''

    static navigationOptions = {
        title: '新密码',
    }
    handleAddNewPwd = () => {
        Keyboard.dismiss()
        var rsa = new RSAKey();
        rsa.setPublicString(stores.encrypt.public)

        client.post('pwd/create', { name: this.pwdName, value: rsa.encrypt(this.pwdValue), user_name: stores.user.name }, true).then(() => {
            stores.user.pwdNum++
            client.post('pwd/num/update')
            Toast.success('create pwd success!')


            const { params } = this.props.navigation.state;
            const mainInstance = params ? params.mainInstance : null;

            if(mainInstance){
                mainInstance.refresh()
            }
            this.props.navigation.goBack()
            
        })
    }
    render() {
        return (<View style={styles.container}>
                <List style={styles.input}>
                    <InputItem placeholder='Name' onChange={(val) => { this.pwdName = val }}></InputItem>
                    <InputItem placeholder='Value' type="password" onChange={(val) => { this.pwdValue = val }}></InputItem>
                </List>

                <TouchableOpacity style={styles.buttonContainer}
                    onPress={this.handleAddNewPwd}>
                    <Text style={styles.buttonText}>添加</Text>
                </TouchableOpacity>
            
        </View>)
    }
}


// define your styles
const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
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