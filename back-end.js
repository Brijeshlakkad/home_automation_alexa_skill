const Alexa = require('ask-sdk');
var https = require('https');
const skillName="Home Automation";
function changeStatus(query) {
  return new Promise(((resolve, reject) => {
    https.get('https://35b3b149.ngrok.io?'+query, (response) => {
      response.setEncoding('utf8');
      let returnData = '';

      response.on('data', (chunk) => {
        returnData += chunk;
      });

      response.on('end', () => {
        resolve(JSON.parse(returnData));
      });

    }).on("error", (error) => {
       reject(error);
    });
  }));
}
function getCustomerDetails(handlerInput,flag){
  return new Promise(((resolve, reject) => {
    var token = handlerInput.requestEnvelope.context.System.apiAccessToken;
    var host = handlerInput.requestEnvelope.context.System.apiEndpoint;
    host=host.replace("https://", "");
    var pathname='';
    if(flag==="email")
    {
      pathname='/v2/accounts/~current/settings/Profile.email';
    }
    else if(flag==="contact"){
      pathname='/v2/accounts/~current/settings/Profile.mobileNumber';
    }
    else{
      pathname="/v2/accounts/~current/settings/Profile.name";
    }
    const options = {
      hostname: host,
      path: pathname,
      method: 'GET',
      headers: {
        "Accept": "application/json",
        "Authorization": "Bearer "+token.toString()+"",
      }
    };

    var req = https.request(options, (response) => {
      response.setEncoding('utf8');
      let returnData = '';

      response.on('data', (chunk) => {
        returnData += chunk;
      });

      response.on('end', () => {
        var data='null';
        if(response.statusCode==200)
        {
          if(flag=="contact")
          {
            var res=JSON.parse(returnData);
            var contact=res.countryCode+" "+res.phoneNumber;
            resolve(contact);
          }else{
            data =returnData;
            resolve(data);
          }
        }else{
          data='';
          resolve(data);
        }
      });

    }).on("error", (error) => {
       reject(error);
    });
    req.end();
  }));
}
const HelpHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'You can turn on or off by telling me which device in which room.';
    return handlerInput.responseBuilder
    .speak(speakOutput)
    .reprompt(speakOutput)
    .getResponse();
  },
};


const ExitHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = 'Goodbye!';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};
const HelloHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'HelloIntent';
  },
  async handle(handlerInput) {
    var name = await getCustomerDetails(handlerInput,'name');
    name=name.replace(/["]/gi,"");
    const speakOutput = 'Hello,'+name+' Codecademy';
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
      var name = await getCustomerDetails(handlerInput,'name');
      name=name.replace(/["]/gi,"");
      return handlerInput.responseBuilder
      .speak('Welcome , '+name+" to "+skillName)
      .reprompt('Tell me which devices you want to turn on or off')
      .getResponse();
  },
};

const TurnOnDeviceHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'TurnOnIntent';
  },
  async handle(handlerInput) {
      var email = await getCustomerDetails(handlerInput,'email');
      email=email.replace(/["]/gi,"");
      var roomName=handlerInput.requestEnvelope.request.intent.slots.roomName.value;
      var deviceName=handlerInput.requestEnvelope.request.intent.slots.deviceName.value;
      if(roomName==undefined)
      {
        roomName="null";
      }else if(deviceName==undefined)
      {
        deviceName="null";
      }
      var status=1;
      var query="email="+email+"&deviceName="+deviceName+"&roomName="+roomName+"&status="+status;
      var res = await changeStatus(query);
      var message=res.errorMessage;
      if(res.error==0){
        message="It's done. Your light is turned on.";
      }
      return handlerInput.responseBuilder
      .speak(''+message)
      .reprompt('Tell me which devices you want to turn on or off')
      .getResponse();

  },
};
const TurnOffDeviceHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'TurnOffIntent';
  },
  async handle(handlerInput) {
      var email = await getCustomerDetails(handlerInput,'email');
      email=email.replace(/["]/gi,"");
      var roomName=handlerInput.requestEnvelope.request.intent.slots.roomName.value;
      var deviceName=handlerInput.requestEnvelope.request.intent.slots.deviceName.value;
      if(roomName==undefined)
      {
        roomName="null";
      }else if(deviceName==undefined)
      {
        deviceName="null";
      }
      var status=0;
      var query="email="+email+"&deviceName="+deviceName+"&roomName="+roomName+"&status="+status;
      var res = await changeStatus(query);
      var message=res.errorMessage;
      if(res.error==0){
        message="It's done. Your light is turned off.";
      }
      return handlerInput.responseBuilder
      .speak(''+message)
      .reprompt('Tell me which devices you want to turn on or off')
      .getResponse();

  },
};
const allIntentHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("I don't know what you are saying. Can you please elaborate more?")
      .reprompt("I don't get that. Can you please elaborate that?")
      .getResponse();
  },
};
const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'Amazon.FallbackIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak("I don't know what you are saying. Can you please elaborate more?")
      .reprompt("I don't get that. Can you please elaborate that?")
      .getResponse();
  },
};
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    return handlerInput.responseBuilder
      .speak("I don't know what you are saying. Can you please elaborate more?")
      .reprompt("I don't get that. Can you please elaborate that?")
      .getResponse();
  },
};
var languageStrings = {
    'en-IN': {
        'translation': {
            'SKILL_GREETING' : 'Namaste',
            'SKILL_NAME': 'Indian Quotes',
        }
    },
    'en-GB': {
        'translation': {
            'SKILL_GREETING' : 'Hiya',
            'SKILL_NAME': 'British Quotes',
        }
    },
    'en-US': {
        'translation': {
            'SKILL_GREETING' : 'Hello',
            'SKILL_NAME': 'American Quotes',
        }
    },
    'de-DE': {
        'translation': {
            'SKILL_GREETING' : 'Hallo',
            'SKILL_NAME': 'German Quotes',
        }
    }
};
Alexa.resources = languageStrings;
const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloHandler,
    TurnOnDeviceHandler,
    TurnOffDeviceHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler,
    allIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
