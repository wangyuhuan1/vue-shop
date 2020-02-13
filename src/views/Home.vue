<template>
  <div class="home">
    <div class="header">
      <img src="@/assets/logo.svg" alt />
      <div>
        <p>{{successName}}</p>
        <router-link to="/about"><i class="iconfont">&#xe606;</i></router-link>
        <el-button @click="dialogFormVisible = true">登录</el-button>
        <el-dialog title="登陆界面" :visible.sync="dialogFormVisible">
          <el-form :model="form" status-icon :rules="rules">
            <el-form-item label="用户名" prop="username" :label-width="formLabelWidth">
              <el-input v-model="form.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="pass" :label-width="formLabelWidth">
              <el-input type="password" v-model="form.pass"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="handleLogin()">确 定</el-button>
          </div>
        </el-dialog>
        <el-button @click="handleLogout">退出</el-button>
      </div>
    </div>
    <div class="content-box">
      <div class="nav">
        <span>首页</span>
        <i class="iconfont">&#xe605;</i>
        <span>商品详情</span>
      </div>
      <div class="sort">
        <span>价格：</span>
        <span @click="handleDefault">默认</span>
        <span>
          <i class="iconfont" @click="handleSort">{{(sortFlag==1)?'&#xe66e;':'&#xe60b;'}}</i>
        </span>
      </div>
      <div class="container">
        <div class="left">
          <h3>通过价格搜索:</h3>
          <div v-for="item of searchPrice" :key="item.id">
            <p @click="handlePrice(item.gt,item.lt)">{{item.gt}}-{{item.lt}}</p>
          </div>
        </div>
        <div class="right">
          <div class="content">
            <div v-for="item of goodsList" :key="item._id">
              <img :src="item.productImage" alt />
              <p class="name">{{item.productName}}</p>
              <p class="price">￥{{item.salePrice}}</p>
              <el-button type="danger" plain @click="addCart(item.productId)">加入购物车</el-button>
            </div>
          </div>
        </div>
      </div>
      <div class="page">
        <el-pagination
          @current-change="getPage"
          background
          layout="prev, pager, next"
          :total="total"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "home",
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      }
    };
    return {
      searchPrice: [
        { gt: 0, lt: 100, id: 1001 },
        { gt: 100, lt: 500, id: 1002 },
        { gt: 500, lt: 1000, id: 1003 },
        { gt: 1000, lt: 5000, id: 1004 },
        { gt: 5000, lt: 10000, id: 1005 }
      ],
      goodsList: [],
      total: 10,
      limit: 8,
      start: 0,
      sortFlag: 1,
      dialogFormVisible: false,
      form: {
        username: "",
        pass: ""
      },
      rules: {
        pass: [{ validator: validatePass, trigger: "blur", required: true }],
        username: [{ required: true, message: "请输入用户名", trigger: "blur" }]
      },
      formLabelWidth: "120px",
      successName:""
    };
  },
  mounted() {
    this.initData();
    this.$http('/users/checkLogin').then(res=>{
      if(res.data.code==200){
        this.successName=res.data.result
      }else{
        this.$message({
          message:"未登录",
          duration:1000,
          type:"error"
        })
      }
    })
  },
  //路由守卫
  beforeRouteLeave (to,from,next) {
    this.$http('/users/checkLogin').then(res=>{
      console.log(typeof res.data.code)
      if(res.data.code==200){
        next()
      }else{
        this.$message({
          message:res.data.msg,
          duration:1000
        })
      }
    })
  },
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
          this.total = 10;
        } else {
          this.goodList = [];
          this.$message({
            duration: 1000,
            message: res.data.msg,
            type: "warning"
          });
        }
      });
    },
    open() {
      this.$prompt("用户名", "登录界面", {
        confirmButtonText: "确定"
        // cancelButtonText: '取消',
        // inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
        // inputErrorMessage: '邮箱格式不正确'
      })
        .then(({ value }) => {
          this.$message({
            type: "success",
            message: "你的邮箱是: " + value
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消输入"
          });
        });
    },
    getPage(page) {
      this.start = (page - 1) * this.limit;
      this.initData();
    },
    initData() {
      this.$http
        .get("/goods/list", {
          params: { start: this.start, limit: this.limit }
        })
        .then(res => {
          if (res.data.code == 200) {
            this.goodsList = res.data.result;
            this.total = Math.ceil(res.data.total / this.limit) * 10;
          }
        });
    },
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
    },
    handleDefault() {
      this.initData();
    },
    addCart(productId) {
      this.$http({
        method: "post",
        url: "/users/addCart",
        data: {
          productId
        }
      }).then(res => {
        console.log(res.data);
        this.$message({
          message: res.data.msg,
          duration: 1000,
          type: "success"
        });
      });
    },
    handleLogin() {
      // console.log(this.form);
      if (this.form.username && this.form.pass) {
        this.$http({
          url: "/users/login",
          method: "post",
          //传递的参数写在data里面
          data: {
            userName: this.form.username,
            userPwd: this.form.pass
          }
        }).then(res => {
          // console.log(res)
          if (res.data.code == 200) {
            this.$message({
              message: res.data.msg,
              duration: 1000,
              type: "success",  
            });
            this.dialogFormVisible=false
            this.successName=res.data.result
          } 
          else {
            this.$message({
              message: res.data.msg,
              duration: 1000,
              type: "error"
            });
          }
        });
      }else{
        this.$message({
          message:"用户名和密码不能为空",
          duration:1000,
          type:"error"
        })
      }
    },
    handleLogout(){
      this.$http.post('/users/logout').then(res=>{
        this.$message({
          message:res.data.msg,
          duration:1000
        })
        this.successName=""
      })
    }
  }
};
</script>
<style scoped>
a{text-decoration: none}
.header {
  height: 80px;
  padding: 0 150px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header img {
  width: 50px;
}
.header i {
  font-size: 32px;
  color: #666;
  margin-right: 20px;
  cursor: pointer;
}
.header div {
  display: flex;
  align-items: center;
}
.nav {
  padding: 20px 0;
}
.nav span {
  margin-right: 10px;
}
.nav span:first-child {
  color: #303133;
  font-weight: bolder;
}
.nav i {
  margin-right: 10px;
}
.nav span:last-child {
  color: #606266;
}
.content {
  display: flex;
  flex-wrap: wrap;
  /* justify-content: space-between; */
  color: #666666;
}
.content img {
  width: 200px;
}
.content div {
  margin: 0 0 20px 20px;
  padding: 10px;
  /* height:400px; */
  background: #fff;
  border: 2px solid #e9e9e9;
}
.content .price {
  color: #d5474c;
  margin-bottom: 20px;
}
.content .name {
  color: #2c3e50;
  font-weight: bolder;
  text-align: center;
  margin: 20px 0 55px 0;
}
.content .el-button {
  width: 100%;
  color: #d5474c;
  font-weight: bolder;
  border: 1px solid #d5474c;
}
.container {
  display: flex;
  margin-top: 40px;
}
.left {
  text-align: center;
  padding: 0 80px;
}
.left div {
  width: 200px;
}
.left div p {
  margin-top: 30px;
  cursor: pointer;
}
.sort {
  height: 66px;
  padding-right: 40px;
  background: #fff;
  text-align: right;
  line-height: 66px;
}
.sort span {
  margin-right: 15px;
}
.sort i {
  cursor: pointer;
}
.content-box {
  background: #f5f7fc;
  padding: 0 150px;
}
.page {
  display: flex;
  justify-content: center;
}
.page a {
  text-decoration: none;
  color: #666;
}
.page div {
  width: 35px;
  height: 35px;
  background: #f4f4f5;
  margin-right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
