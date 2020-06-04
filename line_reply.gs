var accessToken = "LINEのアクセストークン";

var sheetId = SpreadsheetApp.openById("スプレッドシート のID");

var sheetName = sheetId.getSheetByName("スプレッドシート のシート名");


//LINEから受信したメッセージ（JSON）をパース
function doPost(e) {
  if (typeof e === "undefined") {
    //終了
    Logger.log("データ受信失敗");
    return;
  } else {
    //JSONをパースして格納
    var json = JSON.parse(e.postData.contents);
    Logger.log(json);
    //結果を関数にわたす
    replyFromSheet(json)
  }
}

//受信したデータをもとに返信内容を設定
function replyFromSheet(data) {
  //返信先
  var replyURL = "https://api.line.me/v2/bot/message/reply";
  
  //シートの最終行を取得
  var lastRow = sheetName.getLastRow();
  
  //シート内の受信語句、変身語句を取得
  var wordList = sheetName.getRange(1,1,lastRow,2).getValues();
  
  //メッセージ情報を変換(LINEから受信したメッセージ)
  var replyToken = data.events[0].replyToken;
  //受信した内容
  var text = data.events[0].message.text;
  
  //返信用の配列
  var replyList = [];
  
  //LINEで受信したメッセージをシートの受信メッセージ一覧を比較
  for (var i = 1; i < wordList.length; i++) {
    if (wordList[i][0] == text) {
      replyList.push(wordList[i][1]);
    } 
  }
  
  //LINEから受信したメッセージがシートの設定と一致しない場合
  if (replyList.length < 1) {
    Logger.log("データ一致なし");
    //return;
    var errorWord = "指定の返信ワード無し"
    replyList.push(errorWord);
    var messageLength = 1;
    
  } else if (replyList.length > 5){
    //replyListが多い場合はmessageLengthを5にする（LINEは一度に5メッセージしか送信できない）
    // -> リプライの一覧は1項目につき5項目以下にする
    var messageLength = 5;
  } else {
    var messageLength = replyList.length;
  }
  
  //返信用配列
  var messageArray = [];
  
  //内容を返信用フォーマットに当て込む
  for (var j = 0; j < messageLength; j++) {
    messageArray.push({"type": "text", "text": replyList[j]});
  }
  
  //ヘッダー情報
  var headers = {
    "Content-Type": "application/json; charset=UTF-8",
    "Authorization": "Bearer " + accessToken,
  };
  
  //返信用データ
  var postData = {
    "replyToken": replyToken,
    "messages": messageArray,
  };
  
  var options = {
    "method": "post",
    "headers": headers,
    "payload": JSON.stringify(postData)
  };
  
  //通信実施
  UrlFetchApp.fetch(replyURL, options);
  
}
