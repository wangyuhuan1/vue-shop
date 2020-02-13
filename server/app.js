const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const goods = require('./routes/goods')
const users = require('./routes/users')
const cors=require("koa2-cors")
// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(cors({
  origin:"http://192.168.14.63:8080",   //配置允许跨域的域名
  credentials:true
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})
app.use(async (ctx,next)=>{
  //登录后才可以访问后端其他的接口
  console.log(ctx.path)
  if(ctx.cookies.get("userId")){
    await next()
  }else{
    //没有登录的情况后端有些接口可以访问
    if(ctx.path=="/users/login" ||ctx.path=="/goods/list"||ctx.path=="/users/logout"){
      await next()
    }else{
      ctx.body={
        code:1001,
        msg:"未登录"
      }
    }
  }
})
// routes
app.use(goods.routes(), goods.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
