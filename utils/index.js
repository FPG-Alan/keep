
export client from './client'
export storage from './storage'
export { generateKey, encrypt, decrypt } from './encrypt'

import * as Keychain from 'react-native-keychain'

export function checkPassword(value) {
    if (!value || value === '') {
        return false
    } else {
        return true
    }
}

export function checkName(value) {
    if (!value || value === '') {
        return false
    } else {
        return true
    }
}

export async function retreiveCredential() {
    try {
        // Retreive the credentials
        const credentials = await Keychain.getGenericPassword()
        return credentials
    } catch (error) {
        throw error
    }
}

export function setCredential(name, value) {
    return Keychain.setGenericPassword(name, JSON.stringify(value))
}
export function clearCredential() {
    return Keychain.resetGenericPassword()
}

