<?php
function verifyData($gotResult){
  if(!filter_var($gotResult->email, FILTER_VALIDATE_EMAIL))
  {
    $gotResult->error=1;
    $gotResult->errorMessage="email address is not verified with our application.";
    return $gotResult;
  }
  else if($gotResult->deviceName=="null")
  {
    $gotResult->error=1;
    $gotResult->errorMessage="Device name is not specified";
    return $gotResult;
  }
  else if($gotResult->roomName=="null")
  {
    $gotResult->error=1;
    $gotResult->errorMessage="Room name is not specified";
    return $gotResult;
  }
  else if($gotResult->status!=1 && $gotResult->status!=0)
  {
    $gotResult->error=1;
    $gotResult->errorMessage="Specification is not correct";
    return $gotResult;
  }
  $gotResult->error=0;
  $gotResult->errorMessage="null";
  return $gotResult;
}

function getUserID($gotResult)
{
  $sql="SELECT * FROM registration where email='$gotResult->email'";
  $check=mysqli_query($gotResult->con,$sql);
  if($check && (mysqli_num_rows($check)==1))
  {
    $row=mysqli_fetch_array($check);
    $gotResult->userID=$row['id'];
    return $gotResult;
  }
  $gotResult->error=1;
  $gotResult->errorMessage="You do not have account in OUR app. Please registor yourself at OUR app";
  return $gotResult;
}

function getRoomID($gotResult)
{
  $sql="SELECT * FROM room where uid='$gotResult->userID' and roomname='$gotResult->roomName'";
  $check=mysqli_query($gotResult->con,$sql);
  if($check && (mysqli_num_rows($check)==1))
  {
    $row=mysqli_fetch_array($check);
    $gotResult->roomID=$row['id'];
    return $gotResult;
  }
  $gotResult->error=1;
  $gotResult->errorMessage="You do not have room named ".$gotResult->roomName;
  return $gotResult;
}

function performAction($gotResult){
  if($gotResult->deviceName=="all" || $gotResult->deviceName=="all devices" || $gotResult->deviceName=="all the device"){
    $sql="UPDATE room_device SET status='$gotResult->status' WHERE uid='$gotResult->userID' and room_id='$gotResult->roomID'";
  }else{
    $sql="UPDATE room_device SET status='$gotResult->status' WHERE uid='$gotResult->userID' and room_id='$gotResult->roomID' and device_name='$gotResult->deviceName'";
  }
  $check=mysqli_query($gotResult->con,$sql);
  if($check)
  {
    return $gotResult;
  }
  $gotResult->error=1;
  $gotResult->errorMessage="You do not have device named ".$gotResult->deviceName;
  return $gotResult;
}

function changeStatus($gotResult)
{
  try{
    $gotResult=verifyData($gotResult);
    if($gotResult->error==1) return $gotResult;
    $gotResult=getUserID($gotResult);
    if($gotResult->error==1) return $gotResult;
    $gotResult=getRoomID($gotResult);
    if($gotResult->error==1) return $gotResult;
    $gotResult=performAction($gotResult);
    return $gotResult;
  }catch(Exception $e)
  {
    return $gotResult;
  }
}

if(isset($_REQUEST['email']) && isset($_REQUEST['deviceName']) && isset($_REQUEST['roomName']) && isset($_REQUEST['status']))
{
  $con = mysqli_connect("localhost","root","root","homeauto_automation",8889);
  if(!$con)
  {
  	die("Can not connect to the database");
  }
  $email=$_GET['email'];
  $deviceName=$_GET['deviceName'];
  $roomName=$_GET['roomName'];
  $status=$_GET['status'];
  $gotResult->error=0;
  $gotResult->errorMessage="null";
  $gotResult->con=$con;
  $gotResult->email=$email;
  $gotResult->deviceName=$deviceName;
  $gotResult->roomName=$roomName;
  $gotResult->status=$status;
  $gotResult=changeStatus($gotResult);
  $sendData = json_encode($gotResult);
  echo $sendData;
}
else{
  $sendData = json_encode($gotResult);
  echo $sendData;
}
?>
