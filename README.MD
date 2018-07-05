# 新浪微相册备份 sina album
----
突然有想备份新浪相册的冲动，没有找到跟自己习惯符合的工具, 哒噔，就诞生了。


依赖
--------
- fs
- optimist
- path
- request

用法
--------
1. npm install
2. node index.js -u -p -c  

index.js 支持3个参数:
* -u --uid  
指定微博用户uid

* -p --path  
指定存放目录路径, 默认`'./backup'`

* -c --cookie  
指定使用的cookie, 可以在index.js 中设置默认值

工具默认**同步**执行，个人也推荐在此模式下运行，因此没有提供对应异步的参数

> cookie的获取见其他资料吧 \-\_\-

license
--------
MIT
