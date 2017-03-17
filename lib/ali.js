'use strict';

var aliConfig = require('../config/config.json').ali;
var queryStr = require('querystring');
var util = require('../util/index');
var assert = require('assert');

//身份证OCR识别
module.exports.idCardOCR = function (params, options, callback) {

  assert(aliConfig.AppKey, '请配置ali AppKey');
  assert(aliConfig.AppSecret, '请配置ali AppSecret');
  assert(aliConfig.AppCode, '请配置ali AppCode');

  if (!callback && options && typeof options == 'function') {
    callback = options;
    options = {};
  }

  if (!params) return callback(new Error('缺少必要参数'));

  //批量
  if (Array.isArray(params)) return module.exports.idCardOCRBatch.call(null, params, options, callback);

  if (!callback && typeof options == 'function') {
    callback = options;
    options = {};
  }

  var array = [];

  array.push(params);

  //单个查询
  module.exports.idCardOCRBatch(array, options, function (err, result) {
    if (err) return callback(err);
    if (!result) return callback(new Error('no result'));
    return callback(null, result && result.list && result.list[0]);
  });

};

//批量识别
module.exports.idCardOCRBatch = function (params, options, callback) {
  if (!callback && typeof options == 'function') {
    callback = options;
    options = {};
  }

  var call = {
    method: 'post',
    path: '/rest/160601/ocr/ocr_idcard.json',
    host: 'https://dm-51.data.aliyun.com',
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
      , "Authorization": 'APPCODE ' + aliConfig.AppCode
    }
  };

  var p = {inputs: []};

  if (Array.isArray(params)) {
    params.forEach(function (item) {
      if (item.image && typeof item.card_type == 'number' && (item.card_type == 0 || item.card_type == 1)) p.inputs.push({
        image: {
          dataType: 50,
          dataValue: util.decodeBase64Image(item.image).dataWithNoTitle
        },
        configure: {
          dataType: 50,
          //身份证图片类型，0-头像面，1-国徽面
          dataValue: JSON.stringify({side: item.card_type.toString() == '0' ? 'face' : 'back'})
        }
      });
    });
  }

  if (p.inputs.length <= 0) return callback(null);

  util.request(call, p, function (error, result) {

    if (error) return callback(error);

    if (!result) return callback(new Error('no result'));

    if (!Array.isArray(result.outputs)) return callback(new Error('result should be an array'));

    var ret = {list: []};

    result.outputs.forEach(function (item) {
      if (item && item.outputValue && item.outputValue.dataValue) {
        var data = {};
        try {
          data = JSON.parse(item.outputValue.dataValue);
        } catch (e) {
          data = {};
        }
        var side = {};

        if (data.config_str) {
          try {
            side = JSON.parse(data.config_str);
          }
          catch (e) {
            side = {};
          }
        }


        if (side && side.side == 'face') {
          ret.list.push({
            // success: data.success,
            name: data.name,
            sex: data.sex,
            nation: data.nationality,
            birth: data.birth,
            address: data.address,
            id: data.num,
            side: 0
          });
        }
        else {
          ret.list.push({
            // success: data.success,
            authority: data.issue,
            start_date: data.start_date,
            end_date: data.end_date,
            valid_date: data.start_date || '' + '-' + data.end_date || '',
            side: 1
          });
        }
      }
    });

    return callback(null, ret);
  });

};