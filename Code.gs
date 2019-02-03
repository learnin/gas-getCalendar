var RECEIPT_MAIL_ADDRESS = 'example@example.com',
    CALENDAR_ID = 'your-calendar-id';

function doGet() {
  return HtmlService.createTemplateFromFile("index").evaluate();
}

function executeGetCalendarEventsTextContent() {
  return getLastMonthEventsTsv();
}

function executeSendMailCalendarEvents() {
  var subject = 'カレンダーデータ',
      body = getLastMonthEventsTsv();

  // メール送信
  GmailApp.sendEmail(RECEIPT_MAIL_ADDRESS, subject, body);
}

function getLastMonthEventsTsv() {
  var DELIMITER = '\t',
      LF = '\n',
      HEADER = CALENDAR_ID + ' のカレンダーイベント' + LF + '開始' + DELIMITER + '終了' + DELIMITER + 'タイトル' + DELIMITER + '登録日時' + DELIMITER + '更新日時' + LF,
      now = getJstNowDate(),
      result = HEADER,
      events = getLastMonthEvents(CALENDAR_ID, now);
  
  events.forEach(function(event) {
    result += formatDate(event.getStartTime()) + DELIMITER + formatDate(event.getEndTime()) + DELIMITER + event.getTitle() + DELIMITER
      + formatDate(event.getDateCreated()) + DELIMITER + formatDate(event.getLastUpdated()) + LF;
  });
  return result;
}

/**
 * 前月のカレンダーイベントの一覧を返します
 *
 * @param {string} calendarId GoogleカレンダーID
 * @param {Date} now 現在日付
 * @return {Object[]} 前月のカレンダーイベントの一覧
 */
function getLastMonthEvents(calendarId, now) {
  var year = now.getFullYear(),
      month = now.getMonth(),
      firstDayOfLastMonth = new Date(year, month - 1, 1),

      // 終日イベントの場合、終了日は翌日00:00:00になるので、取得期間の終了日は当月1日00:00:00とする。
      // （これで当月1日00:00:00開始のイベントが結果に含まれないことは確認済）
      firstDayOfThisMonth = new Date(year, month, 1);

  return CalendarApp.getCalendarById(calendarId).getEvents(firstDayOfLastMonth, firstDayOfThisMonth);
}

/**
 * 日本の現在日付時刻を返します
 *
 * @return {Date} 日本のタイムゾーンにおける現在日付オブジェクト
 */
function getJstNowDate() {
  var now = new Date();
  var thisTimezoneOffset = now.getTimezoneOffset() / 60;
  
  // getTimezoneOffset はUTCからの差ではなく、現在のロケールからUTCまでの差なので+9ではなく-9時間となる。
  var TIMEZONE_OFFSET_JST = -9;
  
  if (thisTimezoneOffset === TIMEZONE_OFFSET_JST) {
    return now;
  }
  var utcTime = now.getTime() + thisTimezoneOffset * 60 * 60 * 1000;
  return new Date(utcTime - TIMEZONE_OFFSET_JST * 60 * 60 * 1000);
}

function formatDate(date) {
  return date.getFullYear() + '/' + paddingZero((date.getMonth() + 1), 2) + '/' + paddingZero(date.getDate(), 2) + ' ' + paddingZero(date.getHours(), 2) + ':' + paddingZero(date.getMinutes(), 2);
}

function paddingZero(s, length){
    return ('0000000000' + s).slice(-length);
}
