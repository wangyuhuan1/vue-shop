```
show dbs //显示所有的数据库
use shop //切换shop这个库
show collections //看库中有几张表

```

```
db.goods.find({})
//只查第一条和第二条 skip limit
//skip是下标 limit查询多少条
db.goods.find({}).skip(0).limit(2)
```

```
//升序sort({condition:1}) 降序sort({condition:-1})
```

```js
//根据价格大小排序  升序
db.goods.find({}).sort({price:1})
//根据价格大小排序  降序
db.goods.find({}).sort({price:-1})
```

```
//&gt  大于某个数
//选择price大于1000的商品
db.goods.find({condition:{$gt:1000}})
//$lt  小于某个数
//选择price小于1000的商品
db.goods.find({condition:{$lt:1000}})
//选择price大于900,小于1100的商品
db.goods.find({price:{$gt:900,$lt:1100}})
```

```
//count()统计数据
db.goods.find({}).count();
```

## 二、内嵌数组的添加和删除,更新

```
//carts
{
    userId:1001,
    cartList:[
        {id:100,name:"book"}
    ]
    
}
```

```
//$push 向carts这张表中的cartList添加一条数据
db.carts.update({userId:1001},{$push:{cartList:{id:200,name:"imac"}}})
```

```
//$pull 删除  将carts这张表中的cartList中id等于100的数据删除
db.carts.update({userId:1001},{$pull:{cartList:{id:100}}})
```

```
//$set  更新的操作
db.carts.update({userId:1001,"cartList.id":100},{$set:{"cartList.$.name":"xiaomi"}})
```

```
db.users.update({userId:"100000077","cartList.productId":"201710016"},{$set:{"cartList.$.productNum":"3"}})
```

