#身份证识别

##目前仅提供身份证识别，后期加入名片或者其他图片识别

###调用

####YOUTU
var ocr = require('./index').youtu;//引用youtu

//请求参数（image/url共存时，url优先）
var params = {
  image: '身份证base64格式',
  url: '身份证图片地址',
  card_type: 0,//身份证图片类型，0-正面，1-反面
  session_id: ''
};

//调用函数
ocr.idCardOCR(params, function (err, result) {
  console.log('youtu:', err, result);
});

//结果

1头像面

{ name: '叶建华',
  sex: '男',
  nation: '汉',
  birth: '1977/7/14',
  address: '江西省贵溪市泗沥钦何家村西山组8号附1号',
  id: '360621197707143215',
  side: 0
}

2国徽面

{
  valid_date: '2007.10.25-2027.10.25',
  authority: '包头市公安局',
  start_date: '2007.10.25',
  end_date: '2027.10.25',
  side: 1
}

---

####ALI
var ocr = require('./index').ali;//引用ali

//请求参数
var params = {
  image: '身份证base64格式',
  card_type: 0,//身份证图片类型，0-正面，1-反面
};

//调用函数
ocr.idCardOCR(params, function (err, result) {
  console.log('ali:',err, result);
});

//结果

单个请求
1.1头像面
{
    success: true,
	name: '叶建华',
	sex: '男',
	nation: '汉',
	birth: '19770714',
	address: '江西省贵溪市泗沥镇何家村西山组8号附1号',
	id: '360621197707143215',
	side: 0
}

1.2国徽面
{
    success: true,
	authority: '包头市公安局青山分局',
	start_date: '20071025',
	end_date: '20271025',
	side: 1
}

批量请求

{
	list:
	[{
	        success: true,
			name: '叶建华',
			sex: '男',
			nation: '汉',
			birth: '19770714',
			address: '江西省贵溪市泗沥镇何家村西山组8号附1号',
			id: '360621197707143215',
			side: 0
		}, {
		    success: true,
			authority: '包头市公安局青山分局',
			start_date: '20071025',
			end_date: '20271025',
			side: 1
		}
	]
}

--