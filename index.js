// 引用http模块
const http = require('http')
// 引用fs模块
const fs = require('fs')
// 引用querystring模块
const querystring = require('querystring')
//建立服务器
http.createServer((req,res)=>{
    console.log('嘿！');
    
    console.log(req.url);
    
    fs.readFile(`.${req.url}`,(err,data)=>{
        if(err){
            console.log(err)
            res.writeHead(404)
            res.end("404 not found")
        }else{
            res.end(data)
        }

    })

    let result=[]
    req.on('data',buffer=>{
        result.push(buffer)
    })

    req.on('end',()=>{
        let data=Buffer.concat(result).toString()
        console.log(querystring.parse(data));
        
    })

}).listen(8090,'127.0.0.1')





