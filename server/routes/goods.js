const router = require('koa-router')()
const GoodsModel=require('../models/goods')
router.get('/goods/list', async (ctx) => {
  // ctx.cookies.set("name","zhangsan",{
  //   maxAge:1000*30  //cookie的有效时长
  // })
  console.log(ctx.query)
  var {start,limit}=ctx.query
  var total=await GoodsModel.find({}).count()
  var data=await GoodsModel.find({}).skip(Number(start)).limit(Number(limit))
  ctx.body={
    code:200,
    msg:"首页数据请求成功",
    result:data,
    total:total
  }
})
router.get("/goods/price",async ctx=>{
  console.log(ctx.query)
  var {gt,lt}=ctx.query;
  var data=await GoodsModel.find({salePrice:{$gt:gt,$lt:lt}})
  if(data.length){
    ctx.body={
      code:200,
      msg:"数据请求成功",
      result:data,
      total:data.length
    }
  }else{
    ctx.body={
      code:1001,
      msg:"没有数据"
    }
  }
})
module.exports = router
