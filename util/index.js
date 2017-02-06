
'use strict';

var crypto = require('crypto');
var assert = require('assert');
var url = require('url');
var request = require('request');

//常量
var _defaultTimeout = 2000,//get 默认超时时间
  _defaultPostTimeout = 5000,//post 默认超时时间
  _keepAlive = true;//是否开启keep alive


//hash_hmac
module.exports.hash_hmac = function (text, key) {
  var hash = crypto.createHmac('sha1', key).update(new Buffer(text)).digest();
  return hash
};

//apiclient 类
var apiClient = function (options) {
  assert(options, 'options is necessary');
  assert(options.host, 'options.host is necessary');
  this.host = options.host;
  this.path = options.path;
  this.method = options.method || 'get';
  this.headers = options.headers || {};
  this.timeout = options.timeout || _defaultTimeout;
  if (this.method && this.method == 'post')
    this.postTimeout = options.postTimeout || options.timeout || _defaultPostTimeout;

  if (this.timeout < 200) this.timeout = _defaultTimeout;
  if (this.postTimeout < 500) this.postTimeout = _defaultPostTimeout;

  if (typeof options.keepAlive === 'undefined' || options.keepAlive == null)
    this.keepAlive = _keepAlive;
  else
    this.keepAlive = options.keepAlive;
};

//原生调用,返回 err,response,body
apiClient.prototype.originalRequest = function (params, callback) {

  if (!this.path) this.path = '';
  var reqUrl = url.resolve(this.host, this.path);
  if (typeof params === 'function') {
    callback = params;
    params = {};
  }
  if (!params) params = {};

  var reqOptions = {
    method: this.method,
    url: reqUrl,
    headers: this.headers,
    forever: this.keepAlive,
    rejectUnauthorized: false
  };


  if (this.method === 'get') {
    reqOptions.qs = params;

    //默认超时时间
    if (this.timeout) reqOptions.timeout = this.timeout;
  }
  else if (this.method === 'post') {
    try {
      if (reqOptions.headers && (reqOptions.headers['Content-Type'] == 'application/x-www-form-urlencoded' || reqOptions.headers['content-type'] == 'application/x-www-form-urlencoded'))
        reqOptions.form = params;
      else
        reqOptions.body = JSON.stringify(params);
    } catch (e) {
    }

    //默认超时时间
    if (this.postTimeout) reqOptions.timeout = this.postTimeout;
  }

  request(reqOptions, function (error, response, body) {
    callback(error, response, body);
  });
};

//基础调用,返回 err,body
apiClient.prototype.baseRequest = function (params, callback) {
  this.originalRequest(params, function (error, response, body) {
    if (!error && response && response.statusCode == 200) {
      try {
        var _body = JSON.parse(body);
        var result = undefined;
        result = _body;
      }
      catch (e) {
        return callback(e);
      }
      return callback(null, result);
    } else if (error) {
      return callback(error);
    } else {
      if (!response) response = {};
      return callback(new Error('http code:' + response.statusCode + ' body:' + body));
    }
  });
};

//基础请求,返回json parse 后的 body,返回error,result
module.exports.request = function (options, paramsOrCallback, callback) {
  var ac = new apiClient(options);
  if (typeof paramsOrCallback === 'function') {
    callback = paramsOrCallback;
    paramsOrCallback = null;
  }
  return ac.baseRequest(paramsOrCallback, callback);
};

//原生请求,返回error, response, body
module.exports.execOriginal = function (options, paramsOrCallback, callback) {
  var ac = new apiClient(options);
  if (typeof paramsOrCallback === 'function') {
    callback = paramsOrCallback;
    paramsOrCallback = null;
  }
  return ac.originalRequest(paramsOrCallback, callback);
};

//解析base64image
module.exports.decodeBase64Image = function (dataString) {
  if (!dataString) return {};

  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (!dataString) {
    return response;
  }

  if (!matches) {
    response.type = '';
    response.dataWithNoTitle = dataString;
    response.dataByte = new Buffer(dataString, 'base64');
    return response;
  }

  if (matches.length !== 3) {
    return new Error('图片信息有误');
  }

  response.type = matches[1];
  response.dataWithNoTitle = matches[2];
  response.dataByte = new Buffer(matches[2], 'base64');

  return response;
};