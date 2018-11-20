/**
 * 组织结构图展示工具
 * by hzl
 */
Org = {
	el_style: 'normal', //元素风格
	el_root: {}, //操作根元素
	data: {}, //数据
	init: function(id, data, style) { //初始化 id元素 data数据  style样式
		this.el_root = document.getElementById(id);

		this.el_root.setAttribute("class", "root_div"); //根容器样式

		this.data = data.data;

		if(style != undefined) {
			this.el_style = style;
		}

		this.draw();

		//鼠标移动事件 start
		var el = document.getElementById(id);
		var x = 0;
		var y = 0;
		var l = 0;
		var t = 0;
		var isDown = false;
		//鼠标按下事件
		el.onmousedown = function(e) {
			//获取x坐标和y坐标
			x = e.clientX;
			y = e.clientY;

			//获取左部和顶部的偏移量
			l = el.offsetLeft;
			t = el.offsetTop;
			//开关打开
			isDown = true;
			//设置样式  
			el.style.cursor = 'move';
		}
		//鼠标移动
		window.onmousemove = function(e) {
			if(isDown == false) {
				return;
			}
			//获取x和y
			var nx = e.clientX;
			var ny = e.clientY;
			//计算移动后的左偏移量和顶部的偏移量
			var nl = nx - (x - l);
			var nt = ny - (y - t);

			el.style.left = nl + 'px';
			el.style.top = nt + 'px';
		}
		//鼠标抬起事件
		el.onmouseup = function() {
			//开关关闭
			isDown = false;
			el.style.cursor = 'default';
		}
		//鼠标移动事件 end
	},
	draw: function() {
		//nodes节点数组  parent容器
		function drawNodes(nodes, parent) {
			var level_count = 0; //跳过已经计算的层级

			for(var x in nodes) {

				var node = document.createElement("div"); //节点 容器

				var span_title = document.createElement("span"); //节点标题

				span_title.innerText = nodes[x].name; //节点标题内容
				span_title.setAttribute("class", "node node-" + Org.el_style); //节点容器样式
				node.setAttribute("class", "node"); //节点容器样式

				if(parent.parentNode.id != Org.el_root.id && nodes.length > 1) {

					var line_h = document.createElement("div"); //头部线条

					/*
					 * 选择线条类型
					 */
					if(x == 0) {
						line_h.setAttribute("class", "transverse-line-s transverse-line-" + Org.el_style); //节点容器样式
					} else if(x == nodes.length - 1) {
						line_h.setAttribute("class", "transverse-line-e transverse-line-" + Org.el_style); //节点容器样式
					} else {
						line_h.setAttribute("class", "transverse-line-c transverse-line-" + Org.el_style); //节点容器样式
					}

					node.appendChild(line_h);

					var line_div = document.createElement("div"); //头部线条
					var line_s = document.createElement("div"); //头部线条

					line_s.setAttribute("class", "vertical-line-" + Org.el_style); //节点容器样式

					line_div.appendChild(line_s);
					node.appendChild(line_div); //添加标题
				}

				node.appendChild(span_title); //添加标题

				if(nodes[x].child.length > 0) {

					var span_div = document.createElement("div"); //竖的线条
					var span = document.createElement("span"); //竖的线条

					span.setAttribute("class", "vertical-line-" + Org.el_style); //节点容器样式

					span_div.appendChild(span);

					node.appendChild(span_div);

					var parent_div = document.createElement("div");
					parent_div.setAttribute("class", "parent_div");
					node.appendChild(parent_div);

					drawNodes(nodes[x].child, parent_div);

				}
				parent.appendChild(node);

			}

		}
		var parent_div = document.createElement("div");
		parent_div.setAttribute("class", "parent_div");
		parent_div.id = 'parent_main';
		this.el_root.appendChild(parent_div);

		drawNodes(this.data, parent_div);
	}
}