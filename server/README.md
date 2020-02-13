## 一、koa脚手架

```
//1.安装依赖
npm i koa-generator -g
```

```
//2.创建项目
koa2 server
```

```
//3.启动项目
npm i 
npm run dev
```

## 二、操作数据库

```
//1.安装mongoose
yarn add mongoose
```

2-1 mongoose模块化

```js
//db.js
//1.连接数据
const mongoose = require('mongoose');
mongoose.connect( 'mongodb://127.0.0.1:27017/shop', {useNewUrlParser: true},(err)=>{
    if(err) throw err;
    console.log("database连接成功")
});
module.exports = mongoose;
```

```js
//2.定义schema和数据库中的表映射
var mongoose = require('./db');
var GoodsSchema = new mongoose.Schema({
    productId:String,
    productName:String,
    salePrice:Number,
    productImage:String,
    productUrl:String
})
var Goods =  mongoose.model('Goods',GoodsSchema,'goods');
module.exports = Goods;
```

## 三、给前端返回的数据格式

```
{ 
   //200请求成功 1001没有请求成功
    code:200,
    msg:"请求成功",
    result:data,
    total:17
    //从数据中请求的数据装载到result中
}
```

## 四、实现后端跨域

```js
//1.安装koa2-cors这个模块
yarn add koa2-cors
//2.配置  http://192.168.14.57:8080/ 读取后台的数据
const cors =  require('koa2-cors');
app.use(cors({
  origin:"*"  //配置允许跨域的域名
}))
```



## 五、axios-get

#### 5-1  parmas参数传递数据给后端

```js
methods: {
    handlePrice(gt, lt) {
      console.log(gt, lt);
      this.$http({
        url: "/goods/price",
        method: "get",
        params: {
          gt,
          lt
        }
      }).then(res => {
          this.goodsList = res.data.result;
      });
    }
  }
```

#### 5-2 后端query接收get传值

```js
/* 根据价格大小查询 */
router.get("/goods/price", async ctx => {
  var { gt, lt } = ctx.query;
})
```

#### 5-3 对数据库进行查询

```js
var data = await GoodsModel.find({ salePrice: { $gt: gt, $lt: lt } })
```

#### 5-4 对有数据和没数据的处理

```js
//后台
/* 根据价格大小查询 */
router.get("/goods/price", async ctx => {
  var { gt, lt } = ctx.query;
  var data = await GoodsModel.find({ salePrice: { $gt: gt, $lt: lt } })
  if (data.length) {
    ctx.body = {
      code: 200,
      msg: "数据请求成功",
      result: data,
      total: data.length
    }
  }else{
    ctx.body = {
      code:1001,
      msg:"没有数据"
    }
  }

})
```

```js
//前台
 methods: {
    handlePrice(gt, lt) {
      console.log(gt, lt);
      this.$http({
        url: "/goods/price",
        method: "get",
        params: {
          gt,
          lt
        }
      }).then(res => {
        if (res.data.code == 200) {
          this.goodsList = res.data.result;
        }else{
          this.goodsList = [];
          this.$message({
            duration:1000,
            message:res.data.msg,
            type: 'warning'
          })
        }
      });
    }
  }
```

