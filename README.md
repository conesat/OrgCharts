# OrgCharts
组织结构图

![输入图片说明](https://gitee.com/conesat/OrgCharts/raw/master/rec-image/rec.gif "在这里输入图片标题")



使用方法参见 [demo](https://gitee.com/conesat/OrgCharts/blob/master/js-orgCharts/index.html)  


数据格式为

```
{
    "id": "2",  //id可有可无
    "name": "主要部门2",  //name可有可无
    "open": "true",  //false为不展开 空或者true为展开
    "html": "",    //自定义文本  注意:里面不能使用" 请用'代替
    "child": []   //子节点 与当前节点 格式一致
}
```



除以上内容可以按需添加
在add 与edit 方法可以自行修改数据 
通过getData方法可以取出全部修改完成的数据

当data中html不为空时默认显示html内容 否则显示name

layui 请参考  layui中demo示例 或者前往layui官网搜索插件查看示例 [地址链接](https://fly.layui.com/extend/orgCharts/)

js用法:

	
```
    var Org=new OrgCharts();
    //初始化组件  
    Org.init({
        id: "org_charts", //必填
        theme: '', //可选
        menu:['edit','add','delete','cut','copy','absorbed'],//右键菜单项
        success: function() { //可选
            //console.log("初始化完成")
        },
        error: function(e) { //可选
            //console.log("初始化失败");
        },
        onClick: function(el, data) { //点击方法  el被点击的元素  data对应传入数据
            //console.log(data.id);
            alert('点击了' + data.name);//可以得到data中存在任意字段
        },
        onAdd:function(data,tab){//添加回调 data为点击的数据  tab为标记点,用于插入新数据
            var myData=new Object();//新的节点 可以再次编辑节点中任意任意字段包括自定义的
            myData.name=prompt("输入name","新节点");
            myData.child=[];
            if(myData.name!=null){
                orgCharts.addNodes(myData,tab);
            }
        },
        onEdit:function(data){//编辑回调 data为点击的数据 直接修改 然后重新绘制即可
            data.html=prompt("输入name",data.html);//同理可以修改节点任意字段 
            if(data.name!=""){
                orgCharts.draw();//记得重新绘制 否则看不到效果
            }
        }
    });
	
    //加载方式1   
    Org.drawByUrl({
        url: 'data/data.json', //路径必选 可以是后台返回数据  返回格式参考 data/data.json
        success: function() { //可选
            console.log("绘制化完成");
        },
        error: function(e) { //可选
            console.log('绘制失败');
        }
    });
	
    //加载方式2 直接传入数据jsondata 可以通过ajax获取数据后 将数据传到该方法进行绘制
    Org.drawByData({
        data: 'jsondata',//必填json数据  格式请参照  data/data.json  中的data
        success: function() {//可选
            console.log("绘制化完成");
        ,
        error: function(e) {//可选
            console.log('绘制失败');
        }
    });

    //加载方式2 结合jquery ajax使用示例
    $.ajax({      
        type: "get",
        url: "data/data.json",
        dataType: "text",
        success: function(data) {
            var JSONData = JSON.parse(data);
            orgCharts.drawByData({
            data: JSONData.data, 
                success: function() { //可选
                    /console.log("绘制化完成");
                },
                error: function(e) { //可选
                    //console.log('绘制失败');
                }
            });
        },
        error: function(msg) {}    
    });
	
    设置主题  主题类型normal ,red ,green ,black ,gray
    可自定义样式文件
    类名格式如 
    node-my 节点样式
    vertical-line-my 竖线样式
    transverse-line-my 横线样式
    方法详细参考my.style
    Org.setTheme('gray');
    Org.getData(); //获取全部数据  与传输数据格式一致
```
