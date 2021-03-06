class Socket {
    constructor (domain) {
        this.socketDomain = domain
        this.messageArr = [] // 单个监听事件数据
        this.messageAll = {}
        this.sessid = ''
        this.SocketTask = null
        this.isConnectedSocket = false // socket是否已连接
        this.reConnectTimer = null // 断线重连计时器
        this.loopConnectTimer = null // 获取离线消息保持连接计时器
        this.loopConnectBackTimer = null // 心跳返回消息计时器（超过10秒没有收到心跳返回就意味服务端断开）
    }
  
    // 初始化socket
    initSocket () {
        this.SocketTask = this.connectSocket() // 连接
        this.listenConnectError() // 连接异常
        this.listenConnectSuccess() // 连接成功
        this.listenMessageBack() // 监听消息
        this.listenSocketClose() // 监听断开
    }
  
    // 连接socket
    connectSocket () {
        return new WebSocket(this.socketDomain)
    }
  
    // 监听连接成功
    listenConnectSuccess () {
        this.SocketTask.onopen = res => {
            this.isConnectedSocket = true
            this.clearAllTimer()
        }
    }
  
    // 监听连接断开
    listenSocketClose () {
        this.SocketTask.onclose = res => {
            this.clearAllTimer()
  
            if (this.isConnectedSocket) {
                this.SocketTask.close()
                this.sessid = ''
                this.reConnectTimer = setInterval(() => {
                    this.initSocket()
                }, 5000)
            }
        }
    }
  
    // 监听连接异常
    listenConnectError () {
        this.SocketTask.onerror = res => {
            // console.log(JSON.stringify(res))
        }
    }
  
    // 发送socket消息
    sendSocketMessage (obj) {
        try {
            this.SocketTask.send(JSON.stringify(obj))
        } catch (error) {
        }
    }
  
    // 监听socket收到的消息，执行相应的回调函数
    listenMessageBack () {
        this.SocketTask.onmessage = ({ data }) => {
            // console.log('==========', JSON.parse(data))
            data = JSON.parse(data)
            let cmd = data.cmd
            this.messageAll.cb && this.messageAll.cb(data)
            for (const item of this.messageArr) {
                if (item.cmd === cmd) {
                    return item.cb(data.msg)
                }
            }
        }
    }
  
    // 订阅要监听的消息的事件和回调函数
    addListener (cmd, cb) {
        this.messageArr.push({
            cmd,
            cb
        })
        // console.log('this.messageArr---', this.messageArr)
    }
  
    // 监听所有事件
    listenAll (cb) {
        this.messageAll = { cb }
    }
  
    // 取消订阅，移出监听数组
    removeListener (cmd) {
        this.messageArr = this.messageArr.filter(item => item.cmd !== cmd)
    }
  
    // 所有移出监听数组
    removeAllListener () {
        this.messageArr = []
    }
  
    // 手动关闭连接
    closeSocket () {
        if (this.isConnectedSocket) {
            this.SocketTask.close()
            this.isConnectedSocket = false
        }
    }
  
    // 清理所有计时器
    clearAllTimer () {
        if (this.reConnectTimer) {
            clearInterval(this.reConnectTimer)
            this.reConnectTimer = null
        }
        if (this.loopConnectTimer) {
            clearInterval(this.loopConnectTimer)
            this.loopConnectTimer = null
        }
        if (this.loopConnectBackTimer) {
            clearInterval(this.loopConnectBackTimer)
            this.loopConnectBackTimer = null
        }
    }
}
  
module.exports = Socket
  