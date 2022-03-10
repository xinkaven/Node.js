var log4js = require("log4js");
var path = require("path");
 

//    log4js.configure({
//        appenders:[
//            {type: 'file', filename: 'log/uuid.log', 'maxLogSize':2048, "backups":3}
//        ]
//    });

log4js.configure({
    appenders: {
        stdout: {   type: 'console'},
        ruleConsole: {type: 'console'},
        ruleFile: {type: 'dateFile',filename: 'logs/server',pattern: 'yyyy-MM-dd.log', maxLogSize:1 * 1000 * 1000, numBackups:10,alwaysIncludePattern: true }
    },
    categories: { default: {appenders: ['ruleConsole', 'ruleFile'], level: 'info'}}
});
  

   var logger = log4js.getLogger(path.basename(__filename));
   module.exports = logger;
