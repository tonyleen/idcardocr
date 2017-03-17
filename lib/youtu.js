'use strict';


var youtuConfig = require('../config/config.json').youtu;
var queryStr = require('querystring');
var util = require('../util/index');
var assert = require('assert');


//身份证OCR识别
module.exports.idCardOCR = function (params, options, callback) {

  assert(youtuConfig.appID, '请配置youtu appID');
  assert(youtuConfig.qq, '请配置youtu qq');
  assert(youtuConfig.secretID, '请配置youtu secretID');
  assert(youtuConfig.secretKey, '请配置youtu secretKey');


  if (!callback && options && typeof options == 'function') {
    callback = options;
    options = {};
  }

  if (!params) return callback(new Error('缺少必要参数'));

  var call = {
    method: 'post',
    path: '/youtu/ocrapi/idcardocr',
    host: 'http://api.youtu.qq.com',
    headers: {"Content-Type": "text/json", "Authorization": getRequestSign()}
  };

  if (params && params.image) params.image = util.decodeBase64Image(params.image).dataWithNoTitle;

  var p = {
    app_id: youtuConfig.appID,
    image: params.image,
    url: params.url,
    card_type: params.card_type,//身份证图片类型，0-头像面，1-国徽面
    session_id: params.session_id || ''
  };

  util.request(call, p, function (error, result) {

    if (error) return callback(error);
    if (!result) return callback(new Error('no result'));

    var ret = {};

    switch (params.card_type) {
      case 0:
        ret = {
          name: result.name,
          sex: result.sex,
          nation: result.nation,
          birth: result.birth,
          address: result.address,
          id: result.id,
          side: 0,
        };
        break;
      case 1:
        var validDate = result.valid_date.split('-');
        var ret = {
          valid_date: result.valid_date,
          authority: result.authority,
          start_date: validDate && Array.isArray(validDate) && validDate.length > 0 && validDate[0],
          end_date: validDate && Array.isArray(validDate) && validDate.length > 0 && validDate[1],
          side: 1,
        };
        break;
    }

    return callback(null, ret);
  });

};

//名片OCR识别
module.exports.cardOCR = function () {

};

//设置配置
module.exports.config = function () {

};

//生成签名串
var getRequestSign = function () {
  var rdm = parseInt(Math.random() * Math.pow(2, 32));
  var beforeSign = {
    u: youtuConfig.qq,//u为开发者创建应用时的QQ号
    a: youtuConfig.appID,//a为用户的AppID
    k: youtuConfig.secretID,//k为用户的SecretID
    t: parseInt(Date.now() / 1000),//t为当前时间戳，是一个符合UNIX Epoch时间戳规范的数值，单位为秒
    e: 0,//e为此签名的凭证有效期，是一个符合UNIX Epoch时间戳规范的数值，单位为秒, e应大于t, 生成的签名在 t 到 e 的时间内 都是有效的. 如果是0, 则生成的签名只有再t的时刻是有效的.
    r: rdm,//r为随机串，无符号10进制整数，用户需自行生成，最长10位。
    f: ''//f为空
  };
  var beforeSignStr = queryStr.stringify(beforeSign);
  var res = util.hash_hmac(beforeSignStr, youtuConfig.secretKey);
  var data = new Buffer(beforeSignStr);
  return new Buffer.concat([res, data]).toString('base64');
};