/**
 * 组织结构图展示工具
 * by hzl
 */

function OrgCharts() {
	var orgCharts = this;
	this.menuOperation = {
		data: {},
		cut: false,
		copy: false
	};
	this.targetF = null, //上一次选择的节点
		this.target = null, //当前选择的节点
		this.menu = [];
	this.onClick = {}; //元素点击事件
	this.onAdd = null; //菜单添加事件
	this.el_style = 'normal'; //元素风格
	this.el_root = {}; //操作根元素
	this.data = {}; //数据
	//根据地址绘制
	this.drawByUrl = function(data) {
		try {
			//请求服务器数据 start
			var ajax = new XMLHttpRequest();
			ajax.open('get', data.url);
			ajax.send();
			ajax.onreadystatechange = function() {
				if(ajax.readyState == 4 && ajax.status == 200) {
					orgCharts.data = JSON.parse(ajax.responseText).data;
					orgCharts.draw();

					//加载完成  判断是否定义完成回调函数  有则执行回调
					var isFunction = false;
					try {  
						isFunction = typeof(eval(data.success)) == "function";
					} catch(e) {}
					if(isFunction) {  
						data.success();
					}
				}
			}
			//请求服务器数据 end

		} catch(e) {
			//加载失败 执行回调
			var isFunction = false;

			try {  
				isFunction = typeof(eval(data.error)) == "function";
			} catch(e) {}

			if(isFunction) {  
				data.error(e);
			}
			//加载失败 执行回调 end
		}

	}
	//初始化 id元素   style样式
	this.init = function(data) {
		try {   //尝试初始化
			this.el_root = document.getElementById(data.id);

			this.el_root.setAttribute("class", "root_div"); //根容器样式

			if(data.theme != undefined && data.theme != '') {
				this.el_style = data.theme;
			}

			if(data.menu.length > 0) {
				orgCharts.menu = data.menu;
			}

			setMouseMove(data.id, true);

			var isFunction = false;

			try {  
				isFunction = typeof(eval(data.onClick)) == "function";
			} catch(e) {}
			if(isFunction) {  
				orgCharts.onClick = data.onClick;
			}

			try {  
				isFunction = typeof(eval(data.onAdd)) == "function";
			} catch(e) {}
			if(isFunction) {  
				orgCharts.onAdd = data.onAdd;
			}

			//初始化成功  判断是否定义完成回调函数  有则执行回调

			try {  
				isFunction = typeof(eval(data.success)) == "function";
			} catch(e) {}
			if(isFunction) {  
				data.success();
			}
		} catch(e) {
			//初始化异常  判断是否定义 异常回调函数 有则执行
			if(this.el_root == undefined) {
				e = '初始化错误: 找不到元素id';
			}
			var isFunction = false;

			try {  
				isFunction = typeof(eval(data.error)) == "function";
			} catch(e) {}

			if(isFunction) {  
				data.error(e);
			}

		}
	}
	//根据数据绘制
	this.drawByData = function(data) { //初始化 data数据  
		try {  
			this.data = data.data;
			this.draw();
			//成功回调 start
			var isFunction = false;

			try {  
				isFunction = typeof(eval(data.success)) == "function";
			} catch(e) {}

			if(isFunction) {  
				data.success();
			}
			//成功回调 end
		} catch(e) {
			//异常回调 start
			var isFunction = false;

			try {  
				isFunction = typeof(eval(data.error)) == "function";
			} catch(e) {}

			if(isFunction) {  
				data.error(e);
			}
			//异常回调 end
		}

	}
	//设置主题
	this.setTheme = function(theme) {
		try {  
			if(theme != undefined && theme != '') {
				orgCharts.el_root.innerHTML = '';
				orgCharts.el_style = theme;
				orgCharts.draw();
			}
		} catch(e) {

		}
	}

	this.draw = function() {
		//nodes节点数组  parent容器
		function drawNodes(nodes, parent, orgTab) {
			var level_count = 0; //跳过已经计算的层级

			for(var x in nodes) {
				var openShow = true; //是否展开子项
				var node = document.createElement("div"); //节点 容器
				var contentSpan = document.createElement("span"); //节点标题
				var content = document.createElement("div"); //节点标题
				var open = document.createElement("div"); //节点 容器
				contentSpan.setAttribute("org_tab", orgTab + x); //
				if(nodes[x].html == '' || nodes[x].html == undefined) {
					contentSpan.innerText = nodes[x].name; //节点标题内容
					content.setAttribute("class", "node node-" + orgCharts.el_style); //节点容器样式
					if(nodes[x].child!=undefined&&nodes[x].child.length > 0) {
						if(nodes[x].open == 'true') {
							open.setAttribute("class", "org-open-down org-open-down-" + orgCharts.el_style); //节点容器样式
						} else {
							open.setAttribute("class", "org-open-up org-open-up-" + orgCharts.el_style); //节点容器样式
							openShow = false;
						}
					}
				} else {
					content.setAttribute("class", "user-html"); //节点容器样式
					contentSpan.innerHTML = nodes[x].html;
					if(nodes[x].child!=undefined&&nodes[x].child.length > 0) {
						if(nodes[x].open == 'true') {
							open.setAttribute("class", "org-open-down org-open-down-" + orgCharts.el_style); //节点容器样式
						} else {
							open.setAttribute("class", "org-open-up org-open-up-" + orgCharts.el_style); //节点容器样式
							openShow = false;
						}
					}
				}

				content.appendChild(contentSpan);
				content.appendChild(open);

				//点击回调 start
				contentSpan.onmousedown = function(oEvent) {
					if(!oEvent) oEvent = window.event;
					oEvent.stopPropagation();
				}
				contentSpan.onmouseup = function(oEvent) {
					if(!oEvent) oEvent = window.event;
					oEvent.stopPropagation();
					if(oEvent.button == 2) {
						document.getElementById("org_menu_delete").style.display = '';
						document.getElementById("org_menu_cut").style.display = '';
						document.getElementById("org_menu_copy").style.display = '';
						if(orgCharts.menuOperation.cut || orgCharts.menuOperation.copy) {
							document.getElementById("org_menu_paste").style.display = '';
						} else {
							document.getElementById("org_menu_paste").style.display = 'none';
						}

						if(orgCharts.onAdd == null) {
							document.getElementById("org_menu_add").style.display = 'none';
						} else {
							document.getElementById("org_menu_add").style.display = '';
						}

						orgCharts.target = this;
						var menu = document.getElementById("org_menu_id");
						menu.style.left = this.offsetLeft + 'px';
						menu.style.top = (this.offsetTop - 30) + 'px';
						if(menu.style.display == "none") {
							menu.style.display = "";
						}
					} else if(oEvent.button == 0) {

						var isFunction = false;
						try {  
							isFunction = typeof(eval(orgCharts.onClick)) == "function";
						} catch(e) {}

						if(isFunction) {  
							var tab = this.getAttribute("org_tab");
							var tabs = tab.split("-");
							var data = orgCharts.data[tabs[0]];
							for(var x = 1; x < tabs.length; x++) {
								data = getData(data, tabs[x]);
							}

							orgCharts.onClick(this, data);
						}

					}
				}
				contentSpan.oncontextmenu = function() {
					event.returnValue = false;
				}

				//点击回调 end

				//收起与隐藏 start
				open.onclick = function() {
					var open = '';
					if(this.className == "org-open-up org-open-up-" + orgCharts.el_style) {
						this.setAttribute("class", "org-open-down org-open-down-" + orgCharts.el_style);
						show(this);
						open = 'true';
					} else if(this.className == "org-open-down org-open-down-" + orgCharts.el_style) {
						this.setAttribute("class", "org-open-up org-open-up-" + orgCharts.el_style);
						hide(this);
						open = 'false';
					}
					//获取标记
					var tab = this.previousSibling.getAttribute("org_tab");
					var tabs = tab.split("-");
					var data = orgCharts.data[tabs[0]];
					for(var x = 1; x < tabs.length; x++) {
						data = getData(data, tabs[x]);
					}

					data.open = open; //设置节点开闭属性
				}
				//收起与隐藏 end
				function hide(el) {
					var brother1 = el.parentNode.parentNode.lastChild;
					var brother2 = brother1.previousSibling;
					brother1.style.display = 'none';
					brother2.style.display = 'none';
				}

				function show(el) {
					var brother1 = el.parentNode.parentNode.lastChild;
					var brother2 = brother1.previousSibling;
					brother2.style.display = '';
					brother1.style.display = '';
				}

				node.setAttribute("class", "node"); //节点容器样式

				if(parent.parentNode.id != orgCharts.el_root.id && nodes.length > 1) {

					var line_h = document.createElement("div"); //头部线条

					/*
					 * 选择线条类型
					 */
					if(x == 0) {
						line_h.setAttribute("class", "line transverse-line-s transverse-line-" + orgCharts.el_style); //节点容器样式
					} else if(x == nodes.length - 1) {
						line_h.setAttribute("class", "line transverse-line-e transverse-line-" + orgCharts.el_style); //节点容器样式
					} else {
						line_h.setAttribute("class", "line transverse-line-c transverse-line-" + orgCharts.el_style); //节点容器样式
					}

					node.appendChild(line_h);

					var line_div = document.createElement("div"); //头部线条
					var line_s = document.createElement("div"); //头部线条

					line_s.setAttribute("class", "line vertical-line-" + orgCharts.el_style); //节点容器样式

					line_div.appendChild(line_s);

					node.appendChild(line_div); //添加线条
				}

				node.appendChild(content); //添加标题

				if(nodes[x].child!=undefined&&nodes[x].child.length > 0) {

					var span_div = document.createElement("div"); //竖的线条
					var span = document.createElement("span"); //竖的线条

					span.setAttribute("class", "line vertical-line-" + orgCharts.el_style); //节点容器样式

					span_div.appendChild(span);
					var parent_div = document.createElement("div");
					parent_div.setAttribute("class", "parent_div");

					if(!openShow) {
						span_div.style.display = 'none';
						parent_div.style.display = 'none';
					}
					node.appendChild(span_div);

					node.appendChild(parent_div);

					drawNodes(nodes[x].child, parent_div, orgTab + x + "-");

				}

				parent.appendChild(node);

			}

		}

		/**
		 * 创建第一个父容器
		 */
		orgCharts.el_root.innerHTML = '';
		var parent_div = document.createElement("div");
		parent_div.setAttribute("class", "parent_div");
		parent_div.id = 'parent_main';

		orgCharts.el_root.style.paddingTop = '50px';
		orgCharts.el_root.appendChild(parent_div);

		//初始化右键菜单
		if(orgCharts.menu.length > 0) {
			var menu = document.createElement("div");
			var items = document.createElement("div");
			var paste = false; //粘贴
			items.style.display = 'flex';
			items.style.position = 'relative';
			items.style.height = '24px';
			items.style.borderRadius = '5px';
			items.style.background = '#eaeaea';
			menu.id = 'org_menu_id';

			for(var x in orgCharts.menu) {
				var img = document.createElement('img');
				img.style.width = '20px';
				img.style.cursor = 'pointer';
				img.style.margin = '2px';
				switch(orgCharts.menu[x]) {
					case 'add':
						img.src = "svg/plus-circle.svg";
						items.appendChild(img);
						img.title = '添加节点';
						img.id = 'org_menu_add';
						img.onclick = function() {
							closeOrgMenue();
							var tab = orgCharts.target.getAttribute("org_tab");
							var tabs = tab.split("-");
							var dataTemp = {};
							if(tabs.length <= 1) { //判断是否根节点如果是则删除,否则遍历到对应节点
								dataTemp = JSON.parse(JSON.stringify(orgCharts.data[tabs[0]]));
							} else {
								var data = JSON.parse(JSON.stringify(orgCharts.data[tabs[0]]));
								for(var x = 1; x < tabs.length - 1; x++) {
									data = getData(data, tabs[x]);
								}
								dataTemp = data.child[tabs[tabs.length - 1]];
							}
							orgCharts.onAdd(dataTemp, tab);

						}
						break;
					case 'delete':
						img.id = 'org_menu_delete';
						img.src = "svg/minus-circle.svg";
						items.appendChild(img);
						img.title = '删除节点';
						img.onclick = function() {
							//获取标记
							var tab = orgCharts.target.getAttribute("org_tab");
							var tabs = tab.split("-");
							if(tabs.length <= 1) { //判断是否根节点如果是则删除,否则遍历到对应节点
								orgCharts.data.splice([tabs[0]], 1);
							} else {
								var data = orgCharts.data[tabs[0]];
								for(var x = 1; x < tabs.length - 1; x++) {
									data = getData(data, tabs[x]);
								}

								data.child.splice(tabs[tabs.length - 1], 1);
							}
							orgCharts.draw();
						}
						break;
					case 'cut':
						img.id = 'org_menu_cut';
						img.src = "svg/cut.svg";
						items.appendChild(img);
						img.title = '剪切';
						paste = true;
						img.onclick = function() {
							if(orgCharts.targetF != null) {
								orgCharts.targetF.parentNode.parentNode.style.border = 'none';
								orgCharts.targetF.parentNode.parentNode.style.background = '';
								orgCharts.targetF.parentNode.parentNode.onmouseup = function() {};
							}
							orgCharts.targetF = orgCharts.target;
							orgCharts.target.parentNode.parentNode.style.border = '1px dashed #bf2727';
							orgCharts.target.parentNode.parentNode.style.background = '#fbfbfb';
							orgCharts.menuOperation.cut = true;
							orgCharts.menuOperation.copy = false;
							orgCharts.target.parentNode.parentNode.onmouseup = function() {
								closeOrgMenue()
							}
							closeOrgMenue();

						}
						break;
					case 'copy':
						img.id = 'org_menu_copy';
						img.src = "svg/copy.svg";
						items.appendChild(img);
						img.title = '拷贝';
						paste = true;
						img.onclick = function() {
							if(orgCharts.targetF != null) {
								orgCharts.targetF.parentNode.parentNode.style.border = 'none';
								orgCharts.targetF.parentNode.parentNode.style.background = '';
								orgCharts.targetF.parentNode.parentNode.onmouseup = function() {};
							}
							orgCharts.targetF = orgCharts.target;
							orgCharts.target.parentNode.parentNode.style.border = '1px dashed #bf2727';
							orgCharts.target.parentNode.parentNode.style.background = '#fbfbfb';
							orgCharts.menuOperation.copy = true;
							orgCharts.menuOperation.cut = false;

						}
						break;
				}

			}
			if(paste) {
				var img = document.createElement('img');
				img.id = "org_menu_paste";
				img.style.width = '20px';
				img.style.cursor = 'pointer';
				img.style.margin = '2px';
				img.src = "svg/paste.svg";
				items.appendChild(img);
				img.title = '粘贴';
				img.onclick = function() {
					orgCharts.targetF.parentNode.parentNode.style.border = 'none';
					orgCharts.targetF.parentNode.parentNode.style.background = '';
					if(orgCharts.menuOperation.cut == true) {

						//获取标记
						var tab = orgCharts.targetF.getAttribute("org_tab");
						var tabs = tab.split("-");
						var dataTemp = {};
						var num = 0;
						var deleteData = {};
						if(tabs.length <= 1) { //判断是否根节点如果是则删除,否则遍历到对应节点
							deleteData = orgCharts.data;
							num = tabs[0];
							dataTemp = orgCharts.data[tabs[0]];
						} else {
							var data = orgCharts.data[tabs[0]];
							for(var x = 1; x < tabs.length - 1; x++) {
								data = getData(data, tabs[x]);
							}

							dataTemp = data.child[tabs[tabs.length - 1]];
							deleteData = data.child;
							num = tabs[tabs.length - 1];
						}

						if(orgCharts.target == null) {
							orgCharts.data.push(dataTemp);
						} else {
							tab = orgCharts.target.getAttribute("org_tab");
							tabs = tab.split("-");

							var data = orgCharts.data[tabs[0]];
							for(var x = 1; x < tabs.length; x++) {
								data = getData(data, tabs[x]);
							}

							data.child.push(dataTemp);
						}

						deleteData.splice(num, 1);

						orgCharts.draw();
						orgCharts.menuOperation.cut = false;
					} else if(orgCharts.menuOperation.copy == true) {
						//获取源 标记
						var tab = orgCharts.targetF.getAttribute("org_tab");
						var tabs = tab.split("-");
						var dataTemp = {};
						if(tabs.length <= 1) { //判断是否根节点如果是则删除,否则遍历到对应节点
							dataTemp = JSON.parse(JSON.stringify(orgCharts.data[tabs[0]]));
						} else {
							var data = JSON.parse(JSON.stringify(orgCharts.data[tabs[0]]));
							for(var x = 1; x < tabs.length - 1; x++) {
								data = getData(data, tabs[x]);
							}
							dataTemp = data.child[tabs[tabs.length - 1]];
						}
						//获取目标标记

						if(orgCharts.target == null) {
							orgCharts.data.push(dataTemp);
						} else {

							tab = orgCharts.target.getAttribute("org_tab");
							tabs = tab.split("-");
							var data = orgCharts.data[tabs[0]];
							for(var x = 1; x < tabs.length; x++) {
								data = getData(data, tabs[x]);
							}
							data.child.push(dataTemp);
						}
						orgCharts.draw();
						orgCharts.menuOperation.copy = false;
					}
					orgCharts.targetF = null;
				}
			}

			var img = document.createElement('img');
			img.style.width = '20px';
			img.style.cursor = 'pointer';
			img.style.margin = '2px';
			img.src = "svg/close-circle.svg";
			items.appendChild(img);
			img.title = '关闭';
			img.onclick = function() {
				closeOrgMenue();
				if(orgCharts.targetF != null) {
					orgCharts.targetF.parentNode.parentNode.style.border = 'none';
					orgCharts.targetF.parentNode.parentNode.style.background = '';
					orgCharts.targetF.parentNode.parentNode.onmouseup = function() {};
				}
				if(orgCharts.targetF != null) {
					orgCharts.targetF.parentNode.parentNode.style.border = 'none';
					orgCharts.targetF.parentNode.parentNode.style.background = '';
					orgCharts.targetF.parentNode.parentNode.onmouseup = function() {};
				}
				orgCharts.menuOperation.copy = false;
				orgCharts.menuOperation.cut = false;
			}
			menu.appendChild(items);

			menu.style.position = 'absolute';
			menu.style.top = 0;
			menu.style.display = 'none';

			orgCharts.el_root.appendChild(menu);
		}
		//初始化右键菜单 end

		orgCharts.el_root.oncontextmenu = function() {
			event.returnValue = false;
		}

		drawNodes(orgCharts.data, parent_div, "");
	}

	function getData(dataX, num) {
		return dataX.child[num]; //对应节点获取数据
	}

	//关闭菜单
	function closeOrgMenue() {
		var menu = document.getElementById("org_menu_id");
		if(menu.style.display == "") {
			menu.style.display = "none";
		}
	}

	//鼠标移动事件
	function setMouseMove(id, T) {
		//鼠标移动事件 start
		var el = document.getElementById(id);
		el.style.left = '0px';
		el.style.top = '0px';
		var x = 0; //
		var y = 0; //
		var l = 0; //记录上次移动位置
		var t = 0; //记录上次移动位置
		var isDown = false;
		//鼠标按下事件
		el.onmousedown = function(e) {
			if(T) {
				//获取x坐标和y坐标
				x = e.clientX;
				y = e.clientY;
				//开关打开
				isDown = true;
				//设置样式  
				el.style.cursor = 'move';
			}

		}

		//鼠标移动
		el.onmousemove = function(e) {
			if(isDown == false || !T) {
				return;
			}
			//获取x和y
			var nx = e.clientX;
			var ny = e.clientY;
			el.style.left = l + (nx - x) + 'px';
			el.style.top = t + (ny - y) + 'px';

		}
		//鼠标抬起事件
		el.onmouseup = function(oEvent) {
			if(T) {
				//开关关闭
				isDown = false;
				el.style.cursor = 'default';
				l = parseInt(el.style.left.split("px")[0]);
				t = parseInt(el.style.top.split("px")[0]);
				if(!oEvent) oEvent = window.event;
				if(oEvent.button == 2) {
					orgCharts.target = null;
					var menu = document.getElementById("org_menu_id");
					document.getElementById("org_menu_delete").style.display = 'none';
					document.getElementById("org_menu_cut").style.display = 'none';
					document.getElementById("org_menu_copy").style.display = 'none';

					if(orgCharts.menuOperation.cut || orgCharts.menuOperation.copy) {
						document.getElementById("org_menu_paste").style.display = '';
					} else {
						document.getElementById("org_menu_paste").style.display = 'none';
					}

					if(orgCharts.onAdd == null) {
						document.getElementById("org_menu_add").style.display = 'none';
					} else {
						document.getElementById("org_menu_add").style.display = '';
					}

					menu.style.left = (oEvent.clientX - el.offsetLeft - 30) + 'px';
					menu.style.top = (oEvent.clientY - el.offsetTop - 30) + 'px';
					if(menu.style.display == "none") {
						menu.style.display = "";
					}
				}
			}
		}

		//鼠标移动事件 end
	}
	//添加数据
	this.addNodes = function(dataTemp, tab) {
		var tabs = tab.split("-");
		var data = orgCharts.data[tabs[0]];
		for(var x = 1; x < tabs.length; x++) {
			data = getData(data, tabs[x]);
		}
		data.child.push(dataTemp);
		orgCharts.draw();
	}
	
	this.getData=function(){
		return orgCharts.data;
	}
}