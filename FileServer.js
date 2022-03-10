'use strct'
var net = require('net');
var HOST = '0.0.0.0';
var PORT = 5555;
var fs = require("fs")
var gFilePath = "./test/"
var log4js = require("./FileClient/logger");



function ReciveFile(data,socket){

    if (!socket.file_info) {//将文件信息绑定到当前socket，便于后续访问
           
    
      socket.buf += data;       
      let startIndex = socket.buf.indexOf("{");
      //delete undefied ??????N????┐????? 
        socket.buf = socket.buf.slice(startIndex, data.length + startIndex)        
        let EndIndex = socket.buf.indexOf("}}") + 2;      
        let jsonData =  socket.buf.slice(0 , EndIndex) ;

        socket.file_info = JSON.parse(jsonData).fileInfo;
        socket.hasSend = data.length - EndIndex ;//已经发送进来的大小
        if(socket.hasSend < 0){
            socket.hasSend = 0;
        }
        socket.hasWrite = 0;//已经写入的大小
        socket.buf = socket.buf.slice(EndIndex, socket.buf.length);//buffer存储对象
       
        var FilePath = gFilePath + socket.file_info.fileName;
        socket.fd = fs.openSync(FilePath, 'w+');//文件标识ID
        log4js.info("FilePath = ",FilePath, "szie = ",   socket.file_info.fileSize); 
        let pack =  socket.buf.slice(0, socket.hasSend);
        if(pack){           
            socket.buf = socket.buf.slice(socket.hasSend);
            let buf = Buffer.from(pack, 'hex');           
            log4js.info("pack13",buf); 
            fs.appendFileSync(socket.fd, buf);           
        }    
       

      //  socket.write('set file info');//反馈
    } 
    else 
    {
        socket.buf += data;
        socket.hasSend = socket.hasSend + data.length;
       // while (socket.buf.length >= 2048) {//开始重新拼接分块写入，十六进制下字符的大小为之前的二倍
            let pack = socket.buf.slice(0, socket.hasSend);
            socket.buf = socket.buf.slice(socket.hasSend);
            let buffer  = Buffer.from(pack, 'hex');
          //  log4js.info("buffer2",buffer); 
            fs.appendFileSync(socket.fd, buffer);
    }
        // console.log(socket.hasSend,
        //     parseInt(socket.hasSend / 2 / socket.file_info.fileSize * 100) + '%');
        if (socket.hasSend >= socket.file_info.fileSize * 2) {//传输即将完毕，重置
            let buf = Buffer.from(socket.buf, 'hex');
          //  log4js.info("pack3",buf); 
            fs.appendFileSync(socket.fd, buf);
            fs.closeSync(socket.fd);
            console.log('file transfer completed');
            socket.write('over');
            socket.file_info= null;
        }
    

}


// 创建一个TCP服务器实例，调用listen函数开始监听指定端口
// 传入net.createServer()的回调函数将作为”connection“事件的处理函数
// 在每一个“connection”事件中，该回调函数接收到的socket对象是唯一的
net.createServer(function(sock) {
  // 我们获得一个连接 - 该连接自动关联一个socket对象
  //console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
  // 为这个socket实例添加一个"data"事件处理函数
  sock.on('data', function(data) {
   // console.log('DATA ' + sock.remoteAddress + ': ' + data);

    ReciveFile(data,sock);

    // 回发该数据，客户端将收到来自服务端的数据
   // sock.write('You said "' + data + '"');
  });
  // 为这个socket实例添加一个"close"事件处理函数
  sock.on('close', function(data) {
    console.log('CLOSED: ' +
      sock.remoteAddress + ' ' + sock.remotePort);
  });

  sock.on('disconnect', function(data) {
    console.log('disconnect: ' +
      sock.remoteAddress + ' ' + sock.remotePort);
  });
  sock.on('error', function(data) {
    console.log('err: ' +
      sock.remoteAddress + ' ' + sock.remotePort);
  });

}).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);
