define(['jquery'], function ($) {
  return {
    sendLog: function (logInfoPairs) {
      var logs = [];
      for (i=0; i<logInfoPairs.length; i++) {
        var log = {
          "logType_id": logInfoPairs[i][0],
          "details":    logInfoPairs[i][1]
        };
        if (sessionStorage.userId) {
          log["person_id"] = sessionStorage.userId;
        }
        else {
          log["unknown_user_details"] = 'someUser';
        }
        logs.push(log);
      }
      console.log("posting...");
      $.ajax("http://test.astronomicalproportions.org/interaction_logs/service",
        {
          data: {"logs":logs, "application":"Astronomical Proportions"},
          type: "POST",
          dataType: "jsonp",
          success: function(data, textStatus, jqXHR){
            console.log("in my callback");
            console.log(data);
            console.log(textStatus);
            console.log(jqXHR);
          }
        }
      );
    }
  };
});