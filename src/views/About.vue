<template>
  <div class="about">
    <div class="top">我的购物车</div>
    <div class="nav">
      <p>全选</p>
      <p>商品</p>
      <p>价格</p>
      <p>数量</p>
      <p>小计</p>
      <p>操作</p>
    </div>
    <div class="container">
      <div class="item" v-for="item of cartList" :key="item.id">
        <el-checkbox @change="onChange(item)" v-model="item.check"></el-checkbox>
        <div class="product">
          <img :src="item.productImage" alt />
          <p>{{item.productName}}</p>
        </div>
        <p class="price">{{item.salePrice}}</p>
        <el-input-number @change="onChange(item)" v-model="item.productNum" :min="1" :max="10" label="描述文字"></el-input-number>
        <p>{{item.salePrice*item.productNum}}</p>
        <el-button type="danger" @click="handleDelete(item.productId)">删除</el-button>
      </div>
      <div class="item item-sum">
        <p>
          <el-checkbox v-model="checkAll"></el-checkbox>全选
        </p>
        <div class="submit">
          <p>合计:{{sum | format(2)}}</p>
          <el-button type="danger">提交订单</el-button>
          <!-- <el-input class="btn" background-color="#F56C6C" v-model="input" type="button"></el-input> -->
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      num: 1,
      cartList: [],
      input:"提交订单"
    };
  },
  mounted() {
    this.initData();
  },
  methods: {
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
    },
    initData() {
      this.$http.get("users/cartList").then(res => {
        if (res.data.code == 200) {
          this.cartList = res.data.result;
        }
      });
    },
    async onChange(item){
      var {productNum,productId,check}=item;
      console.log(productNum)
      await this.$http.post("/users/cartList/edit",{productNum,productId,check})
    }
  },
  filters: {
    format(val, params) {
      return "￥" + val.toFixed(params);
    }
  },
  computed: {
    checkAll: {
      get() {
        return this.cartList.every(item => item.check);
      },
      set(val) {
        this.cartList.forEach(item => (item.check = val));
      }
    },
    sum() {
      // alert(1)
      var total = 0;
      this.cartList.forEach(item => {
        if (item.check) {
          total = item.salePrice * item.productNum + total;
        }
      });
      return total;
    }
  }
};
</script>
<style scoped>
.top {
  width: 100%;
  height: 60px;
  line-height: 60px;
  background: #f5f7fc;
  text-align: center;
  color: #2c3e50;
  font-size: 20px;
}
.nav {
  height: 52px;
  background: #333333;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.item img {
  width: 100px;
}
.item div {
  display: flex;
  align-items: flex-end;
}
.item {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 20px 0;
}
.el-input-number {
  width: 140px;
}
.price {
  width: 100px;
}
.product {
  width: 200px;
}
.item .submit {
  display: flex;
  align-items: center;
}
.submit p {
  margin-right: 20px;
}
.item-sum {
  width: 1690px;
  display: flex;
  justify-content: space-between;
  margin-left: auto;
  margin-right: auto;
}

</style>