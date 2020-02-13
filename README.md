# vue-shop

## 一、加载首页数据

```
/goods/list
{
    start:0,
    limit：8
}
```

```js
//1.前端代码实现
//只取八条数据,从第一开始获取
export default {
  data() {
    return {
      limit: 8,
      start: 0,
      goodsList: []
    };
  }
  mounted() {
    this.initData();
  },
  methods: {
    initData() {
      this.$http
        .get("/goods/list", {
          //通过params属性传递参数给后端
          params: { start: this.start, limit: this.limit }
        })
        .then(res => {
          if (res.data.code == 200) {
            this.goodsList = res.data.result;
            this.total = Math.ceil(res.data.total / this.limit) * 10;
          }
        });
    }
  }
};
</script>
```

```js
//后端业务
router.get('/goods/list', async (ctx) => {
  var {start,limit} = ctx.query;
  var total = await GoodsModel.find({}).count();
  var data = await GoodsModel.find({}).skip(Number(start))
  .limit(Number(limit));
  ctx.body = {
    code: 200,
    msg: "首页数据请求成功",
    result: data,
      //给前端设置分页
    total:total
  }
})
```

## 二、分页

```js
//前端代码
//total  10为只有1页  为30就有3页
<el-pagination
		   //获取当前处于第几页
            @current-change="getPage"
            class="page"
            background
            layout="prev, pager, next"
            :total="total"
          ></el-pagination>
```

```js
methods:{
    getPage(page) {
        //改变从哪一个位置开始查询
      this.start = (page - 1) * this.limit;
      this.initData();
	}
}

```

## 三、价格的升序和降序

```
//对goodsList进行升序和降序
```

```
//前端代码
<span @click="handleSort">
          价格
          <i class="iconfont">{{(sortFlag==1)?'&#xe62b;':'&#xe62a;'}}</i>
 </span>
```

```js
methods:{
    compareUp(value) {
      return (a, b) => {
        return a[value] - b[value];
      };
    },
    compareDown(value) {
      return (a, b) => {
        return b[value] - a[value];
      };
    },
    handleSort() {
      this.sortFlag = this.sortFlag == 1 ? -1 : 1;
      if (this.sortFlag == 1) {
        this.goodsList.sort(this.compareUp("salePrice"));
      } else {
        this.goodsList.sort(this.compareDown("salePrice"));
      }
    }
}

```

## 四、根据价格区间进行排序

```js
methods:{
    handlePrice(gt,lt){
        this.$http({
            url:'/goods/price',
            method:"get",
            //传递gt,和lt给后台
            params:{
                gt,
                lt
            }
        }).then(res=>{
            if(res.data.code==200){
                this.goodsList = res.data.result;
                this.total = 10;
            }
        })
    },
}
```

```js
/* 根据价格区间查询 */
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

## 五、默认

```js
<el-button @click="handleDefault">默认</el-button>
```

```js
methods:{
    handleDefault(){
        this.initData()
    }
}
```

## 六、添加到购物车

```js
methods:{
      addCart(productId){
        this.$http({
          method:"post",
          url:'/users/addCart',
          data:{
            productId
          }
        }).then(res=>{
          this.$message({
            message:res.data.msg,
            duration:1000,
            type:"success"
          })
        })
      }
    }
```

```js
//后端代码
//添加到购物车
router.post('/addCart', async ctx => {
  var userId = "100000077";
  var { productId } = ctx.request.body;
  var goodsData = await GoodsModel.findOne({ productId: productId });
  // productNum,checked
  var obj = JSON.parse(JSON.stringify(goodsData));
  obj.productNum = 1;
  obj.checked = true;
  var userData = await UsersModel.findOne({});
    //看cartList是否有我们要添加的数据
  if (userData.cartList.every(item => item.productId != productId)) {
    await UsersModel.update({ userId: userId }, { $push: { "cartList": obj } })
    ctx.body = {
      msg:"添加成功",
      code:200
    }
  }else{
    ctx.body = {
      msg:"已经添加到购物车",
      code:200
    }
  }
})
```

## 七、登陆模块

#### 7-1 跨域访问服务器上的cookie

```js
//1.前端代码的配置 main.js
axios.defaults.withCredentials = true 
axios.defaults.crossDomain = true;
//允许跨域访问cookie
```

```js
//2.配置服务器  app.js
app.use(cors({
  origin:"http://192.168.14.57:8080",  //配置允许跨域的域名
  credentials:true
}))
```

#### 7-2 实现登陆功能

```
1.前端获取用户和密码
2.携带用户和密码向后台发送http请求
3.后端接收用户和密码
4.向数据库查询
5.将结果返回给前端
```

```js
//1.前端获取用户和密码
//2.携带用户和密码向后台发送http请求
 <el-button type="primary" @click="handleLogin">确 定</el-button>
 methods:{
      handleLogin(){
          if(this.form.username && this.form.pass){
              this.$http({
                  url:"/users/login",
                  method:"post",
                  data:{
                      userName:this.form.username,
                      userPwd:this.form.pass
                  }
              }).then(res=>{
                  console.log(res)
              })
          }
      }
  }
```

```js
//3.后端接收用户和密码 ctx.request.body
// 登陆模块
router.post('/login',async ctx=>{
  var data = ctx.request.body;
})
```

```js
//4.向数据库查询
router.post('/login',async ctx=>{
  var data = ctx.request.body;
  var res = await UsersModel.findOne(data);
    //没有的时候null 有的会返回数据
  console.log(res)
})
```

```js
//5.将结果返回给前端
// 登陆模块
router.post('/login',async ctx=>{
  var data = ctx.request.body;
  var res = await UsersModel.findOne(data);
  if(res){
    ctx.body = {
      code:"200",
      msg:"登陆成功",
      successName:res.userName
    }
  }else{
    ctx.body = {
      code:"400",
      msg:"用户名和密码错误"
    }
  }
})
```

```js
//前端处理代码
methods:{
      handleLogin(){
          if(this.form.username && this.form.pass){
              this.$http({
                  url:"/users/login",
                  method:"post",
                  data:{
                      userName:this.form.username,
                      userPwd:this.form.pass
                  }
              }).then(res=>{
                  //登陆成功
                  if(res.data.code==200){
                      this.$message({
                          message:res.data.msg,
                          duration:1000,
                          type:"success"
                      })
                      this.successName = res.data.successName
                      this.dialogFormVisible = false;
                  }else{
                      //用户名和密码错误
                      this.$message({
                          duration:1000,
                          message:res.data.msg,
                          type:"error"
                      })
                  }
              })
          }else{
              this.$message({
                  message:"用户名和密码不能为空",
                  duration:1000,
                  type:"error"
              })
          }
      }
  }
```

#### 7-3 使用cookie记录登陆的状态

```js
//1.登陆成功设置cookies
router.post('/login',async ctx=>{
  var data = ctx.request.body;
  var res = await UsersModel.findOne(data);
  if(res){
    ctx.cookies.set("userId",res.userId,{
      maxAge:1000*60*60
    })
    ctx.cookies.set("userName",res.userName,{
      maxAge:1000*60*60
    })
    ...
})
```

```js
//2.配置路由检查一下登陆的状态
//检查一下登陆的状态
router.get('/checkLogin',async ctx=>{
  var userId  = ctx.cookies.get("userId");
  if(userId){
    ctx.body = {
      code:200,
      msg:"登陆成功",
      result:ctx.cookies.get("userName")
    }
  }else{
    ctx.body = {
      code:1001,
      msg:"未登录"
    }
  }
})
```

```js
//3.页面初始加载时,调用/user/checkLogin检查用户是否登陆
mounted(){
      this.$http('/users/checkLogin').then(res=>{
          if(res.data.code==200){
              this.successName = res.data.result
          }else{
              this.$message({
                  message:"未登陆",
                  duration:1000,
                  type:"warning"
              })
          }
      })
  }
```

#### 7-4  退出登陆

```js
//1.配置路由 清除cookies
router.post('/logout',async ctx=>{
  ctx.cookies.set("userId","",{
    maxAge:-1
  })
  ctx.cookies.set("userName","",{
    maxAge:-1
  })
  ctx.body ={
    code:200,
    msg:"退出登陆"
  }
})
```

```js
//2.前端代码
methods:{
    handleLogout(){
          this.$http.post('/users/logout').then(res=>{
              this.$message({
                  message:res.data.msg,
                  duration:1000
              })
              this.successName = ""
          })
      }
}
```

#### 7-5 登陆拦截

```js
//使用中间件
//ctx.path 获取前端向后台访问的接口
app.use( async (ctx,next)=>{
  console.log(ctx.path)
  // 登陆才可以访问后端其他的接口
  if(ctx.cookies.get("userId")){
    await next()
  }else{
    //没有登陆的情况后端有些接口时可以访问
    if(ctx.path =="/users/login" || ctx.path =="/goods/list" || ctx.path == "/users/Logout"){
      await next()
    }else{
      ctx.body = {
        code:1001,
        msg:"未登陆"
      }
    }
  }
})
```

## 八、购物车模块

#### 8-1 购物车查询

```js
router.get('/cartList',async ctx=>{
  var data = await UsersModel.findOne({});
  var res = data.cartList;
  ctx.body ={
    code:200,
    result:res
  }
})
```

#### 8-2 购物车的删除

```js
//后代代码
router.post('/cartList/del',async ctx=>{
  var {productId} =  ctx.request.body;
  var userId = ctx.cookies.get("userId");
  var data  = await UsersModel.update({userId:userId},{$pull:{cartList:{productId:productId}}});
  if(data.ok==1){
    ctx.body  = {
      code:200,
      msg:"删除成功"
    }
  }else{
    ctx.body = {
      code:1001,
      msg:"删除失败"
    }
  }
})
```

```js
//前端代码
methods:{
    handleDelete(productId) {
      console.log(productId);
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$http
            .post("/users/cartList/del", {
              productId
            })
            .then(res => {
              console.log(res);
              this.initData();
            });
        })
        .catch(() => {});
    }
}
```

#### 8-3 购物车的修改

```js
//$set
//前台的代码  tips 传递item
<van-stepper
             @change="onChange(item)"
             v-model="item.productNum" integer />
         
```

```js
methods:{
    async onChange(item){
      var {productNum,productId,checked} = item;
      await this.$http.post('/users/cartList/edit',{
        productNum,
        productId,
        checked
      })
    }
}
```

```js
//后台代码
router.post('/cartList/edit',async ctx=>{
  var {productNum,productId,checked} =  ctx.request.body;
  var userId = ctx.cookies.get("userId");
  var data  = await UsersModel.update(
    {userId:userId,"cartList.productId":
    productId},{$set:{
    "cartList.$.productNum":productNum,
    "cartList.$.checked":checked
  }});
  if(data.ok==1){
    ctx.body ={
      msg:"修改成功",
      code:200
    }
  }
})
```

## 九、路由守卫

```js
Tips：一定要配置再路由地址所对应的主组件
  // 路由守卫
  beforeRouteLeave (to,from,next) {
     this.$http('/users/checkLogin').then(res=>{
       if(res.data.code == 200){
         next()
       }else{
         this.$message({
           message:res.data.msg,
           duration:1000
         })
       }
     })
  }
};
```

