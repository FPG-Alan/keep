import React, { Component, Fragment } from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react/native'
import RSAKey from 'react-native-rsa'
import Aes from 'react-native-aes-crypto'
// import * as Keychain from 'react-native-keychain';

import { View, Text, TextInput, TouchableOpacity, Alert, Image, StyleSheet, KeyboardAvoidingView, StatusBar, Keyboard } from 'react-native';
import { InputItem, List, Button, WhiteSpace, WingBlank, Toast, Icon } from 'antd-mobile';


import { client, checkPassword, checkName, setCredential, clearCredential } from '../../utils'
import stores from '../../stores'

const Item = List.Item;

declare var jest: any;

@observer
export default class Intro extends Component<any, any> {
    static navigationOptions = {
        title: '所有密码',
        headerRight: (
            <Button
                onClick={() => alert('open search!')}
                title="Info"
                color="#fff"
            ><Icon type="search" size='xs' /></Button>
        ),
        headerLeft: (
            <Button
                onClick={() => alert('open drawer!')}
                title="Info"
                color="#fff"
            />
        )
    }
    @observable setPwdName
    @observable setPwdValue
    @observable pwds

    @observable pwdName
    @observable showPassword = false

    componentWillMount() {
        client.post('pwd/list').then(data => {
            if (data.length > 0) {
                // console.log(data)
                this.pwds = data
            }
        })
    }
    handlePwdNameGive = (value) => {
        this.setPwdName = value
    }
    handlePwdValueGive = (value) => {
        this.setPwdValue = value
    }

    handleSendPwd = () => {
        this.props.navigation.navigate('AddPwd', {mainInstance: this})
        /* Keyboard.dismiss()
        var rsa = new RSAKey();
        rsa.setPublicString(stores.encrypt.public)

        client.post('pwd/create', { name: this.setPwdName, value: rsa.encrypt(this.setPwdValue), user_name: stores.user.name }, true).then(() => {
            stores.user.pwdNum++
            client.post('pwd/num/update')
            Toast.success('create pwd success!')
        }) */
    }


    handlePwdNameChange = (value) => {
        this.showPassword = false
        this.pwdName = value
    }
    handleSendPwdName = () => {
        Keyboard.dismiss()
        console.log(stores.encrypt.private)
        client.post('pwd', { name: this.pwdName, user_name: stores.user.name }, true).then(data => {
            if (data.length > 0) {
                let rsa = new RSAKey()
                rsa.setPrivateString(stores.encrypt.private);
                this.pwds = data.map(singlePwdData => {
                    return rsa.decrypt(singlePwdData.value)
                })
                this.showPassword = true
            } else {
                Toast.fail('Not found')
            }

            /* let rsa = new RSAKey();
            console.log(stores.encrypt.private)
  
            rsa.setPrivateString(stores.encrypt.private);
              
          
            
            this.pwd = rsa.decrypt(data.value)
            this.showPassword = true
          
            console.log(this.pwd)
            this.forceUpdate() */
        })
    }
    handleGetAll = () => {
        client.post('pwd/list', true).then(data => {
            if (data.length > 0) {
                let rsa = new RSAKey()
                rsa.setPrivateString(stores.encrypt.private);
                this.pwds = data.map(singlePwdData => {
                    return rsa.decrypt(singlePwdData.value)
                })
                this.showPassword = true
            } else {
                Toast.fail('Not found')
            }
        })
    }

    handleLogout = () => {
        setCredential(stores.user.name, Object.assign(stores.encrypt.credentialIncrement, { loginState: false }))
        this.props.navigation.navigate('Login')
    }
    handleClearAll = () => {
        // clear credential, pwds, then logout
        clearCredential()
        client.post('pwd/clearall', true)

        client.post('pwd/list', true).then(data => {
            console.log(data)
        })
        stores.auth.clear()

        this.props.navigation.navigate('Intro')
    }
    refresh = ()=>{
        client.post('pwd/list').then(data => {
            if (data.length > 0) {
                // console.log(data)
                this.pwds = data
            }
        })
    }

    render() {
        console.log('============== main render ==============')
        return (<View style={styles.container}>
            {this.pwds && this.pwds.length > 0 && <List renderHeader={() => 'Basic Style'} className="my-list">
                {this.pwds.map((pwd, index) => (<Item extra={'extra content'} key={index}>{pwd.name}</Item>))}
            </List>}

            <Button
                onClick={this.handleSendPwd}
                // title="Set"
                // color="#841584"
                // accessibilityLabel="Set pwd"
                style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,

                    width: 70,
                    height: 50,
                }}
            >添加</Button>

            {/* <Fragment>
                <Text style={styles.welcome}>
                    Get u pwd
                </Text>
                <TextInput onChangeText={this.handlePwdNameChange} />
                <Button
                    onClick={this.handleSendPwdName}
                    title="GET"
                    color="#841584"
                    accessibilityLabel="Get pwd"
                />

                {this.showPassword && <View>
                    {this.pwds.map((pwd, index) => (<Text key={index}>{pwd}</Text>))}
                </View>}

                <Text style={styles.welcome}>
                    Or give me pwd
                </Text>
                <TextInput onChangeText={this.handlePwdNameGive} />
                <TextInput onChangeText={this.handlePwdValueGive} />
                <Button
                    onClick={this.handleSendPwd}
                    title="Set"
                    color="#841584"
                    accessibilityLabel="Set pwd"
                />
                <WhiteSpace size="xl" />
                <Button type="primary" onClick={this.handleLogout}>log out</Button>
                <Button type="primary" onClick={this.handleClearAll}>clear all</Button>

                <WhiteSpace size="xl" />
                <Button type="primary" onClick={this.handleGetAll}>show me all</Button>



            </Fragment> */}


        </View>
        )

    }
}


// define your styles
const styles = StyleSheet.create({
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
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