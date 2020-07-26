import * as Keychain from 'react-native-keychain'
import { observable, toJS } from 'mobx'
import { observer } from 'mobx-react/native'

class AuthStore {
    value

    async retreiveCredential() {
        if(this.value){
            return toJS(this.value)
        }
        let credential = await Keychain.getGenericPassword()
        this.value = credential
        return credential
    }

    clear() {
        this.value = null
    }

}

export default new AuthStore