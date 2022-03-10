

var net = require('net');
var HOST = '127.0.0.1';
var PORT = 5555;
var fs = require("fs")
var waitUntil = require('wait-until');
var path = require('path')
var FilefolderPath = "F:/test"
var FileList= [];
var log_dir = '/test';
var dest_uuid_bak = "bak";
var log4js = require("./logger");
var gSplit = '\\';


//const async = require("async");

let sleep = function (delay) {
    return new Promise((resolve, reject) => { 
     setTimeout(() => { 
       try {
        resolve(1)
       } catch (e) {
        reject(0)
       }
     }, delay);
    })
   }

function sendFile(path, name,client) { 
   
    var filePath = path  + name;

    let fileInfo = fs.statSync(filePath);
    let fileSize = fileInfo.size;
    log4js.info("sendfile", filePath, "filesize = ", fileSize);
    var josn = JSON.stringify({'id': "client2", 'fileInfo': {'fileSize': fileSize, fileName: name}});
    //var josn = ({'id': "client2", 'fileInfo': {'fileSize': fileSize, fileName: name}});
    var josnArray = josn.toString();
    client.write(josnArray);  
    let sendSize = 0;
    let packSize = 1024;
    let fd = fs.openSync(filePath, 'r');
    let buf = new Buffer.alloc(fileSize);
  //  while (sendSize < fileSize) {
        //readSync参数:文件ID,buffer对象,写入buffer的起始位置,写入buffer的结束位置,读取文件的起始位置
        fs.readSync(fd, buf, 0, buf.length, sendSize);
        let data = buf.toString('hex');//以十六进制传输        
        client.write(data);
        log4js.info("pack",data)
        sendSize += packSize;
        fs.closeSync(fd);
    
 //   }
}

function ConncectServer(tempFilePath, FileName){

    let filedir = tempFilePath + FileName ;
    fs.stat(filedir,function(eror,stats){
        if(eror){
            log4js.err("file is open err ", tempFilePath + filename , error);
            return ;
          }
    });

    var client = new net.Socket();
   client.connect(PORT, HOST, function() {  

   log4js.info('CONNECTED TO: ' + HOST + ':' + PORT);
  // 建立连接后立即向服务器发送数据，服务器将收到这些数据
  //client.write('I am Chuck Norris!');
         sendFile(tempFilePath,FileName,client);  
    });

    client.on('data', function(data) {        
        // 完全关闭连接
        {
            if(data == "over"){
                let delFilePath = tempFilePath + FileName;
                //move file
                {
                    var sourceFile  = delFilePath;
                    var DetFile = dest_uuid_bak + "/" + FileName;
                    var readStream=fs.createReadStream(sourceFile);
                    var writeStream=fs.createWriteStream(DetFile);
                    readStream.pipe(writeStream);
                    readStream.on('end',function(){
                        log4js.info( "copy src File = ", sourceFile, "destfile", DetFile);
                       // fs.unlinkSync(sourceFile);
                     });
                }          
                
                client.destroy();
            }
        }
      
       
      });
      // 为客户端添加“close”事件处理函数
      client.on('close', function() {
        console.log('Connection closed');

      });

        // 为客户端添加“close”事件处理函数
        client.on('error', function(data) {
            console.log('error closed', data);
            client.destroy();
          });

          client.on('drain', function() {
            console.log('drain event');            
          });


}

//检查文件夹是否有数据
function fileDisplay(filePath){
    //根据文件路径读取文件，返回文件列表
    fs.readdir(filePath,function(err,files){
      if(err){
        console.warn(err)
      }else{
        //遍历读取到的文件列表
        files.forEach(function(filename){
          //获取当前文件的绝对路径
          var filedir = path.join(filePath,filename);
          //根据文件路径获取文件信息，返回一个fs.Stats对象
          fs.stat(filedir,function(eror,stats){
            if(eror){      
              log4js.error('获取文件stats失败');
            }else{
              var isFile = stats.isFile();//是文件
              var isDir = stats.isDirectory();//是文件夹
              if(isFile){
              //  console.log(filedir);
                FileList.push(filedir)
                return;//取一个文件
              }
              if(isDir){
                fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
              }
            }
          })
        });
      }
    });
  }

function TransFile(){

    var FileNum  =  FileList.length;
    for(var i = 0 ; i < FileNum; ++i){
        let FilePath = FileList.pop();

        if(FilePath){
            var strFilePath = FilePath.slice(0, FilePath.length);          
            let nIndex = strFilePath.lastIndexOf(gSplit);            
            let FileName = strFilePath.slice(nIndex + 1, strFilePath.length);
            let tempFilePath = strFilePath.slice(0, nIndex + 1);

            ConncectServer(tempFilePath,FileName);
        }
        else {

            log4js.error("file path err!")
        }  

      
    return ;
    }

}

function wait_forver()
{
    waitUntil()
        .interval(1000) //间隔
        .times(1) //循环次数
        .condition(function() {
            return (false );
        })
        .done(function(result) {
            //console.log("send sync data req");    
            if(FileList.length <= 0 )
            {
                fileDisplay(FilefolderPath);     
            }           
                   
            TransFile();         
            wait_forver();
        });
}

wait_forver();

