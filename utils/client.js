import Storage from 'react-native-storage'
import { AsyncStorage } from 'react-native'

import { setCredential } from './index'

import stores from '../stores'

// const apiUrl = 'http://111.230.152.107:9798/'
const apiUrl = 'http://192.168.1.253:9798/'
const processing = {}
const persistMode = 'local' //remote/local
let token = ''
let user = {}
let publicKey = null
let privateKey = null


const storage = new Storage({
    // 最大容量，默认值1000条数据循环存储
    size: 1000,

    // 存储引擎：对于RN使用AsyncStorage，对于web使用window.localStorage
    // 如果不指定则数据只会保存在内存中，重启后即丢失
    storageBackend: AsyncStorage,

    // 数据过期时间，默认一整天（1000 * 3600 * 24 毫秒），设为null则永不过期
    defaultExpires: null,

    // 读写时在内存中缓存数据。默认启用。
    enableCache: true,

    // 如果storage中没有相应数据，或数据已过期，
    // 则会调用相应的sync方法，无缝返回最新数据。
    // sync方法的具体说明会在后文提到
    // 你可以在构造函数这里就写好sync的方法
    // 或是在任何时候，直接对storage.sync进行赋值修改
    // 或是写到另一个文件里，这里require引入

})
function localStorageLoad() {
    storage.load({
        key: 'loginState',

        // autoSync(默认为true)意味着在没有找到数据或数据过期时自动调用相应的sync方法
        autoSync: true,

        // syncInBackground(默认为true)意味着如果数据过期，
        // 在调用sync方法的同时先返回已经过期的数据。
        // 设置为false的话，则等待sync方法提供的最新数据(当然会需要更多时间)。
        syncInBackground: true,

        // 你还可以给sync方法传递额外的参数
        syncParams: {
            extraFetchOptions: {
                // 各种参数
            },
            someFlag: true,
        },
    }).then(ret => {
        // 如果找到数据，则在then方法中返回
        // 注意：这是异步返回的结果（不了解异步请自行搜索学习）
        // 你只能在then这个方法内继续处理ret数据
        // 而不能在then以外处理
        // 也没有办法“变成”同步返回
        // 你也可以使用“看似”同步的async/await语法

        console.log(ret.userid);
        this.setState({ user: ret });
    }).catch(err => {
        //如果没有找到数据且没有sync方法，
        //或者有其他异常，则在catch中返回
        console.warn(err.message);
        switch (err.name) {
            case 'NotFoundError':
                // TODO;
                break;
            case 'ExpiredError':
                // TODO
                break;
        }
    })
}

function toQueryString(obj) {
    var parts = [];
    for (var i in obj) {
        if (obj.hasOwnProperty(i) && obj[i] !== "" && obj[i] != null) {
            const value = obj[i]
            if (typeof value === 'object') {
                parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(JSON.stringify(value)));
            } else {
                parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(value));
            }
        }
    }
    return parts.join("&");
}
const clientFetch = (url, method, data, force) => {
    console.log('client fetch')
    if (persistMode === 'local') {
        // choose route
        switch (url) {
            case "auth/login":
                break;
            case "user/create":
                return setCredential(data.name, { loginState: true, name: data.name })
                break;
            case "pwd":
                return storage.getAllDataForKey(`${stores.user.name}-pwd`).then(pwds => {
                    console.log(pwds)
                    return pwds.filter(pwd => (pwd.name === data.name))
                })
                break;
            case "pwd/list":
                return storage.getAllDataForKey(`${stores.user.name}-pwd`).then(pwds => pwds)
                break;
            case "pwd/create":
                console.log(stores.user.pwdNum.toString())
                const index = stores.user.pwdNum.toString()
                return storage.save({
                    key: `${stores.user.name}-pwd`,  // 注意:请不要在key中使用_下划线符号!
                    id: index,   // 注意:请不要在id中使用_下划线符号!
                    data: Object.assign(data, {id: index, created: Date.now()})
                })
                break;
            case "pwd/num/update":
                console.log('pwd/num/update')
                storage.save({ key: 'entityIndex', data: stores.user.pwdNum })
                break;
            case "pwd/clearall":
                console.log('pwd/clearall')
                // storage.save({key: 'entityIndex', data: stores.user.pwdNum})
                storage.clearMapForKey(`${stores.user.name}-pwd`);
                storage.remove({ key: `${stores.user.name}-pwd` });
                break;
        }
    } else {
        const headers = new Headers()
        headers.append('Accept', 'application/json')
        if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
            headers.append('Content-Type', 'application/json')
        }
        if (stores.user.entity.token) {
            headers.append('Authorization', `Bearer ${stores.user.entity.token}`)
        }

        url = apiUrl + url
        let options = { method, headers };
        if (data) {
            if (method === 'HEAD' || method === "GET") {
                const last = url[url.length - 1], params = toQueryString(data)
                if (url.indexOf('?') < 0) {
                    url += '?' + params
                } else {
                    url += last === '&' ? params : '&' + params
                }
            } else {
                console.log(data)
                options.body = JSON.stringify(data)
            }
        }
        const key = `${url}|${method}|${JSON.stringify(headers)}|${options.body}`
        if (force !== true && processing[key]) {
            console.log("request already exist: ", url)
            return processing[key]
        }
        return processing[key] = fetch(url, options).then((response) => {
            setTimeout(() => {
                processing[key] = undefined
            }, 5000)
            if ([401, 403, 404, 500, 400, 422].indexOf(response.status) >= 0) {
                return response.json().then((res) => {
                    // handleError(response.status, res)
                    return { error: res }
                })
            } else {
                return response.json()
            }
        }).catch((e) => {
            setTimeout(() => {
                processing[key] = undefined
            }, 5000)
            return { error: 'fetch_error', name: 'fetch_error', summary: e.toString() }
        })
    }
}

const clientPost = (url, data, force) => {
    return clientFetch(url, 'POST', data, force)
}
const clientGet = (url, data, force) => {
    return clientFetch(url, 'GET', data, force)
}
const clientPatch = (url, data, force) => {
    return clientFetch(url, 'PATCH', data, force)
}
const clientDelete = (url, data, force) => {
    return clientFetch(url, 'DELETE', data, force)
}

export default {
    post: clientPost,
    get: clientGet,
    fetch: clientFetch,
    patch: clientPatch,
    delete: clientDelete,
    setToken: function (newToken) {
        token = newToken
    },
    setRsaKey: function (_publicKey, _privateKey) {
        publicKey = _publicKey
        privateKey = _privateKey
    },
    getRsaKey: function () {
        return {
            publicKey: publicKey,
            privateKey: privateKey
        }
    },
    setUser: function (newUser) {
        user = newUser
    },
    getUser: function () {
        return user
    }
}