
const net = require('net');
const sysConfig = require('./config/sys-config.json');
const packet = require('../protocol/packet');
const cmdDefine = require('../protocol/cmd-define');
const constDefine = require('../lib/const-define');
const shortID = require('./short-ID');
const logger = require('./logger');



let conn = null;

function getNewConnection() {

    let port = sysConfig.centerSvrPort;
    let host = sysConfig.centerSvrHost;

    console.log("connec to host:%s,port:%d", host, port);
    conn = net.createConnection({port:port,host:host}, function () {
        const psudoID = shortID.getNextID();
        conn.psudoID = psudoID;
        conn.ip = host;

        logger.info("connect to server,ip:%s,port:%d", host, port);
    });

    conn.on('end', function () {

        logger.info("server connection closed,fd:%d,ip:%s", conn.psudoID, conn.ip);
    });

    conn.on('error', function (err) {

        logger.info("server connection error,fd:%d,ip:%s", conn.psudoID, conn.ip);
        logger.error(err);
    });

    conn.on('data', function (data) {
        console.log("server fd:%d get data:%s", conn.psudoID, data);
    });

}

getNewConnection();

function registerSelf() {

    console.log("....");
    if (conn.destroyed) {
        getNewConnection();
        return;
    }
    const port = sysConfig.centerPort;
    const host = sysConfig.centerHost;

    let jObj = packet.getPacket(cmdDefine.CENTER, cmdDefine.SUB_CENTER_UPDATE);

    let serverInfo = {};
    serverInfo.type = constDefine.SERVER_TYPE_GATE;
    serverInfo.port = sysConfig.svrPort;

    jObj.body = serverInfo;

    let json = JSON.stringify(jObj);
    console.log(json);
    conn.write(json);

    conn.destroy();
}



exports.registerSelf = registerSelf;