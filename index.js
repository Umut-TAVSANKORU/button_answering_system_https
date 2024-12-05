const http = require("http"),
    fs = require("fs"),
    path  = require("path"),
    crypto = require("crypto")

let sockets = []
let answering = false
let answered = []
let admin

let answeringInterval
let questionInterval

const sendMessage = (message,socket) => {
    const data = Buffer.from(message)
    const dataLength = data.length
    const firstByte = 0x80 | 0x01;const bytes = [firstByte]
    const dataFrameBuffer = Buffer.from(bytes.concat(dataLength))
    const totalLength = dataFrameBuffer.byteLength + dataLength
    return socket.write(Buffer.concat([dataFrameBuffer,data],totalLength))
}

const answeringTimeout = () => {
    answering = false
    serverStatus.stat = "question"
    sockets.forEach(el => {
        sendMessage("question", el[0])
    })
},
    questionTimeout = () => {
        answering = false
        answered = []
        serverStatus.stat = "empty"
    }

const serverStatus = new Proxy({serverStatus: "initiation"},{
    set (target, unused, value) {
        target.serverStatus = value
        switch (value) {
            case "question":break
            case "questionResumeImmature":
                clearTimeout(answeringInterval)
                answeringTimeout()
                break
            case "empty":
                clearTimeout(answeringInterval)
                clearTimeout(questionInterval)
                answering = false
                answered = []
                sockets.forEach(el => {
                    sendMessage("empty", el[0])
                })
                break
            case "questionStart":
                clearTimeout(answeringInterval)
                clearTimeout(questionInterval)
                answering = false
                answered = []
                target.serverStatus = "question"
                console.log("nq")
                sockets.forEach(el => {
                    sendMessage("question", el[0])
                })
                questionInterval = setTimeout(questionTimeout, 9000000)
                break
            default:
                target.serverStatus = "answer"
                answering = Number(value.split("answer").join(""))
                answered.push(answering)
                sockets.forEach(el => {
                    sendMessage("answer" + answering, el[0])
                })
                answeringInterval = setTimeout(answeringTimeout, 5000)
        }
    },
    get (target) {
        return target.serverStatus
    }
})

const Server = http.createServer((req,res) => {
    switch(req.url) {
        case "/" :
            res.writeHead(200, {"content-type": "text/html"});fs.createReadStream(path.join(__dirname,"html/main.html")).pipe(res)
            break;
        case "/BridgeOpen":
            res.writeHead(200, {"content-type": "text/plain"});res.end("Message_Read")
            break;
        case "/admin":
            res.writeHead(200,{"content-type": "text/html"});fs.createReadStream(path.join(__dirname,"html/admin.html")).pipe(res)
            break;
        case "/admin/BridgeOpen":
            res.writeHead(200,{"content-type": "text/plain"});res.end("Message_Read")
            break;
    }
})

Server.on("upgrade", (req,socket,head) => {
    const handshakeAcceptKey = crypto.createHash("sha1").update(req.headers["sec-websocket-key"] + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64")
    //if ((req.url.startsWith("/B") && serverStatus.stat != "empty") || (req.url.startsWith("/a") && serverStatus.stat != "initiation")) return
    socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nsec-webSocket-accept: ${handshakeAcceptKey}\r\n\r\n`)
    if (req.url.startsWith("/B")) {sendMessage("teamNumber" + sockets.length,socket);sockets.push([socket,sockets.length])} else serverStatus.stat = "empty"
    socket.on("readable", () => {
        //protocol prerequsities
        socket.read(1); let messageLength
        let lIinBits
        try {lIinBits = socket.read(1)[0]-128} catch (err) {lIinBits = NaN;socket.end(); return sockets.filter(item => item[0] != socket)}
        if(isNaN(lIinBits)) return
        if (lIinBits <= 125) messageLength = lIinBits;else throw new Error("")
        const maskKey = socket.read(4)
        const encoded = socket.read(messageLength)
        const data = Buffer.from(Uint8Array.from(encoded, (element, index) => element ^ maskKey[index % 4])).toString()
        //handling of data
        if(req.url.startsWith("/a")) {
            serverStatus.stat = data
            return
        }
        if (data != "answer") return
        if (serverStatus.stat != "question") return
        const teamNumber = sockets.find(el => el[0] === socket)[1]
        console.log(teamNumber)
        if(answered.includes(teamNumber)) return
        serverStatus.stat = "answer" + teamNumber
    })
    socket.on("error", () => {})
})
Server.maxConnections = 10
Server.listen(2020)
//Umut TAVŞANKORU, IAFL BvTK, 2024, 10C, 824