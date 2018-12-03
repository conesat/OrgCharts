# OrgCharts
组织结构图
![Image](https://github.com/conesat/OrgCharts/blob/master/github_image/rec5.gif)


已知问题:拖动时,鼠标放在元素上会触发点击回调

更新:添加layui支持  使用方法参见 [demo](https://github.com/conesat/OrgCharts/tree/master/layui-orgCharts/layui_exts/orgCharts/demo)  

用法:

	var orgCharts=new OrgCharts();
	//初始化组件  
	Org.init({
		id: "org_charts", //必填
		theme: '', //可选
		success: function() { //可选
			console.log("初始化完成")
		},
		error: function(e) { //可选
			console.log(e);
		},
		onClick: function(el, data) { //点击方法  el被点击的元素  data对应传入数据
			alert('点击了'+data.name);
		},
		onAdd:function(data,tab){//添加回调 data为点击的数据  tab为标记点,用于插入新数据
			var myData=new Object();
			myData.name=prompt("输入name","新节点");
			myData.child=[];
			orgCharts.addNodes(myData,tab);
		}
	});
	
	//加载方式1   
	Org.drawByUrl({
		url: 'data/data.json', //必选  返回格式参考 data/data.json
		success: function() { //可选
			console.log("绘制化完成");
		},
		error: function(e) { //可选
			console.log('绘制失败');
		}
	});
	
	//加载方式2 
	Org.drawByData({
		data: 'jsondata',//必填json数据  格式请参照  data/data.json  中的data
			success: function() {//可选
				console.log("绘制化完成");
			,
			error: function(e) {//可选
				console.log('绘制失败');
			}
	});
	
	 设置主题  主题类型normal ,red ,green ,black ,gray
	 可自定义样式文件
	 类名格式如 
	 node-my 节点样式
	 vertical-line-my 竖线样式
	 transverse-line-my 横线样式
	 详细参考my.style
	 方法
	Org.setTheme('gray');
