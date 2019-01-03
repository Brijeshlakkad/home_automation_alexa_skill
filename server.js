var http = require('http');
var mysql = require('mysql');
var url = require('url');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "homeauto_automation",
  port: 8889
});
function getUserID(email,gotResult,callback){
  sql="SELECT * FROM registration where email="+mysql.escape(email);
  con.query(sql,function (err, result) {
    try{
        if (err || result.length!=1){
          gotResult.error=1;
          gotResult.errorMessage="You do not have account in OUR app. Please registor yourself at OUR app";
          callback('-99',gotResult);
        }
        console.log("userID= "+JSON.stringify(result));
        var uid=result[0].id;
        gotResult.error=0;
        gotResult.errorMessage="null";
        callback(uid,gotResult);
    }catch(err){
        gotResult.error=1;
        gotResult.errorMessage="You do not have account in OUR app. Please registor yourself at OUR app";
        callback('-99',gotResult);
    }
  });
}
function getRoomID(userID,roomName,gotResult,callback)
{
      sql="SELECT * FROM room where uid=? and roomname=?";
      try{
      con.query(sql, [userID,roomName],function (err, result) {
      if (err || result.length==0 || result.affectedRows==0){
          gotResult.error=1;
          gotResult.errorMessage="You do not have room named "+roomName;
          callback('-99',gotResult);
      }else{
        console.log("roomID= "+JSON.stringify(result));
        var roomID=result[0].id;
        gotResult.error=0;
        gotResult.errorMessage="null";
        callback(roomID,gotResult);
      }
    });
  }catch(err){
    gotResult.error=1;
    gotResult.errorMessage="You do not have room named "+roomName;
    callback('-99',gotResult);
  }
}
function performAction(userID,deviceName,roomID,status,gotResult,callback){
  if(deviceName=="all" || deviceName=="all devices" || deviceName=="all the device"){
    sql="UPDATE room_device SET status=? WHERE uid=? and room_id=?";
  }else{
    sql="UPDATE room_device SET status=? WHERE uid=? and room_id=? and device_name=?";
  }
  con.query(sql, [status,userID,roomID,deviceName],function (err, result) {
    try{
      if (err || result.affectedRows==0){
          gotResult.error=1;
          gotResult.errorMessage="You do not have device named "+deviceName;
          callback(gotResult);
      }
      gotResult.error=0;
      gotResult.errorMessage="null";
      callback(gotResult);
    }catch(e){
      gotResult.error=1;
      gotResult.errorMessage="You do not have device named "+deviceName;
      callback(gotResult);
    }
  });
}
function changeStatus(email,deviceName,roomName,status,gotResult,callback)
{
  try{
    if(gotResult.error==1) callback(gotResult);
    getUserID(email,gotResult,function(userID,gotResult){
      if(gotResult.error==1) callback(gotResult);
        getRoomID(userID,roomName,gotResult,function(roomID,gotResult){
          if(gotResult.error==1)  callback(gotResult);
          performAction(userID,deviceName,roomID,status,gotResult,function(gotResult){
            callback(gotResult);
          });
        });
      });
  }catch(err)
  {
      callback(gotResult);
  }
}
function verifyData(email,deviceName,roomName,status,callback){
  var emailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  var gotResult={'error':1,'errorMessage':'Validation error!'};
  if(!emailformat.test(email))
  {
    gotResult={'error':1,'errorMessage':'email address is not verified with our application.'};
    callback(gotResult);
  }else if(deviceName=="null"){
    gotResult={'error':1,'errorMessage':'Device name is not specified'};
    callback(gotResult);
  }else if(roomName=='null'){
    gotResult={'error':1,'errorMessage':'Room name is not specified'};
    callback(gotResult);
  }else if(status!=1 && status!=0){
    gotResult={'error':1,'errorMessage':'status is not correct'};
    callback(gotResult);
  }
  gotResult.error=0;
  gotResult.errorMessage="null";
  callback(gotResult);
}
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var q = url.parse(req.url, true).query;
  var email = q.email;
  var deviceName = q.deviceName;
  var status = q.status;
  var roomName = q.roomName;
  verifyData(email,deviceName,roomName,status,function(gotResult){
      changeStatus(email,deviceName,roomName,status,gotResult,function(gotResult){
          gotResult = JSON.stringify(gotResult);
          res.end(gotResult);
      });
  });
}).listen(5003);
