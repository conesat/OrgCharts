/**
 @ Name：layui.orgCharts 中国省市区选择器
         注意：本文件只是一个扩展组件的示例，暂时没有写相关功能
 @ Author：贤心
 @ License：MIT 
 */

layui.define('form', function(exports) { //假如该组件依赖 layui.form
	var $ = layui.$,
		form = layui.form

		//字符常量
		,
		MOD_NAME = 'orgCharts',
		ELEM = '.layui-orgCharts'

		//外部接口
		,
		orgCharts = function() {
			//用户调用方法
			var orgCharts = this;
			//样式模板
			this.themeTemp = [{
				id: 0, //样式id
				html: '' //样式html
			}];
			//菜单操作
			this.menuOperation = {
				//操作过的数据 记录在此
				data: {
					delete: {}, //被删除的数据
					add: {} //被新建的数据
				},
				cut: false, //剪切
				copy: false //拷贝
			};
			//备份数据 用于专注模式后恢复
			this.resetD = []; //用于专注模式返回
			this.targetF = null; //上一次选择的节点
			this.target = null; //当前选择的节点
			this.menu = []; //菜单项
			this.onClick = {}; //元素点击事件
			this.onAdd = null; //菜单添加事件
			this.onEdit = null; //编辑回调
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
							//请求成功读取数据
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
					//初始化主题
					if(data.theme != undefined && data.theme != '') {
						this.el_style = data.theme;
					}
					//初始化菜单
					if(data.menu.length > 0) {
						orgCharts.menu = data.menu;
					}
					//初始化拖动
					setMouseMove(data.id, true);

					//判断四否具备回调方法
					var isFunction = false;
					//判断是否定义点击回调
					try {  
						isFunction = typeof(eval(data.onClick)) == "function";
					} catch(e) {}
					if(isFunction) {  
						orgCharts.onClick = data.onClick;
					}
					//判断是否定义添加回调
					try {  
						isFunction = typeof(eval(data.onAdd)) == "function";
					} catch(e) {}
					if(isFunction) {  
						orgCharts.onAdd = data.onAdd;
					}

					//判断是否定义编辑回调
					try {  
						isFunction = typeof(eval(data.onEdit)) == "function";
					} catch(e) {}
					if(isFunction) {  
						orgCharts.onEdit = data.onEdit;
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
						orgCharts.el_root.innerHTML = ''; //清空画布
						orgCharts.el_style = theme; //设置主题
						orgCharts.draw(); //绘制
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
							if(nodes[x].child != undefined && nodes[x].child.length > 0) {
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
							if(nodes[x].child != undefined && nodes[x].child.length > 0) {
								if(nodes[x].open == 'true') {
									open.setAttribute("class", "org-open-down org-open-down-" + orgCharts.el_style); //节点容器样式
								} else {
									open.setAttribute("class", "org-open-up org-open-up-" + orgCharts.el_style); //节点容器样式
									openShow = false;
								}
							}
						}
						//添加组件 start
						content.appendChild(contentSpan);
						content.appendChild(open);
						//添加组件 end

						//点击 start
						contentSpan.onmousedown = function(oEvent) {
							if(!oEvent) oEvent = window.event;
							oEvent.stopPropagation(); //阻止向上冒泡
						}

						//鼠标在组件上松开
						contentSpan.onmouseup = function(oEvent) {
							if(!oEvent) oEvent = window.event;
							oEvent.stopPropagation(); //阻止向上冒泡
							if(oEvent.button == 2) {
								document.getElementById("org_menu_delete").style.display = '';
								document.getElementById("org_menu_cut").style.display = '';
								document.getElementById("org_menu_copy").style.display = '';
								document.getElementById("org_menu_absorbed").style.display = '';
								document.getElementById("org_menu_edit").style.display = '';
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

						if(nodes[x].child != undefined && nodes[x].child.length > 0) {

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
									if(orgCharts.target != null) {
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
									} else {
										orgCharts.onAdd(dataTemp, null);
									}

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

									document.getElementById("org_menu_paste").style.display = '';
									orgCharts.targetF = orgCharts.target;
									orgCharts.target.parentNode.parentNode.style.border = '1px dashed #bf2727';
									orgCharts.target.parentNode.parentNode.style.background = '#fbfbfb';
									orgCharts.menuOperation.copy = true;
									orgCharts.menuOperation.cut = false;

								}
								break;
							case 'absorbed':
								img.id = 'org_menu_absorbed';
								img.src = "svg/absorbed.svg";
								items.appendChild(img);
								img.title = '专注模式';
								img.onclick = function() {
									closeOrgMenue();
									var tab = orgCharts.target.getAttribute("org_tab");
									var tabs = tab.split("-");
									//拷贝当前数据备份
									var resData = new Object();
									resData.data = JSON.parse(JSON.stringify(orgCharts.data)); //数据
									resData.tab = tab; //节点
									orgCharts.resetD.push(resData); //添加进去

									//获取当前节点数据 start
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
									orgCharts.data = []; //清空绘制数据
									orgCharts.data.push(dataTemp); //赋值
									//获取当前节点数据 end
									orgCharts.draw(); //重新绘制
								}
								if(orgCharts.resetD.length > 0) {
									var img2 = document.createElement('img');
									img2.id = "org_menu_back";
									img2.style.width = '20px';
									img2.style.cursor = 'pointer';
									img2.style.margin = '2px';
									img2.src = "svg/back.svg";
									items.appendChild(img2);
									img2.title = '返回上一层';
									img2.onclick = function() {
										//获取标记
										var tab = orgCharts.resetD[orgCharts.resetD.length - 1].tab;
										var tabs = tab.split("-");
										var deleteData = {};
										if(tabs.length <= 1) {
											orgCharts.resetD[orgCharts.resetD.length - 1].data[tabs[0]] = JSON.parse(JSON.stringify(orgCharts.data))[0];
										} else {
											var data = orgCharts.resetD[orgCharts.resetD.length - 1].data[tabs[0]];
											for(var x = 1; x < tabs.length - 1; x++) {
												data = getData(data, tabs[x]);
											}
											data.child[tabs[tabs.length - 1]] = JSON.parse(JSON.stringify(orgCharts.data))[0];
										}
										orgCharts.data = []; //清空绘制数据
										orgCharts.data = orgCharts.resetD[orgCharts.resetD.length - 1].data; //赋值
										orgCharts.resetD.splice(orgCharts.resetD.length - 1, 1);
										orgCharts.draw(); //重新绘制
									}

									var img3 = document.createElement('img');
									img3.id = "org_menu_back";
									img3.style.width = '20px';
									img3.style.cursor = 'pointer';
									img3.style.margin = '2px';
									img3.src = "svg/backAll.svg";
									items.appendChild(img3);
									img3.title = '关闭专注模式';
									img3.onclick = function() {
										while(orgCharts.resetD.length > 0) {
											//获取标记
											var tab = orgCharts.resetD[orgCharts.resetD.length - 1].tab;
											var tabs = tab.split("-");
											var deleteData = {};
											if(tabs.length <= 1) {
												orgCharts.resetD[orgCharts.resetD.length - 1].data[tabs[0]] = JSON.parse(JSON.stringify(orgCharts.data))[0];
											} else {
												var data = orgCharts.resetD[orgCharts.resetD.length - 1].data[tabs[0]];
												for(var x = 1; x < tabs.length - 1; x++) {
													data = getData(data, tabs[x]);
												}
												data.child[tabs[tabs.length - 1]] = JSON.parse(JSON.stringify(orgCharts.data))[0];
											}
											orgCharts.data = []; //清空绘制数据
											orgCharts.data = orgCharts.resetD[orgCharts.resetD.length - 1].data; //赋值
											orgCharts.resetD.splice(orgCharts.resetD.length - 1, 1);
											orgCharts.draw(); //重新绘制
										}
									}
								}

								break;
							case 'edit':
								img.id = 'org_menu_edit';
								img.src = "svg/edit.svg";
								items.appendChild(img);
								img.title = '编辑';
								paste = true;
								img.onclick = function() {
									closeOrgMenue();
									if(orgCharts.target != null) {
										var tab = orgCharts.target.getAttribute("org_tab");
										var tabs = tab.split("-");
										var dataTemp = {};
										if(tabs.length <= 1) { //判断是否根节点如果是则删除,否则遍历到对应节点
											dataTemp = orgCharts.data[tabs[0]];
										} else {
											var data = orgCharts.data[tabs[0]];
											for(var x = 1; x < tabs.length - 1; x++) {
												data = getData(data, tabs[x]);
											}
											dataTemp = data.child[tabs[tabs.length - 1]];
										}
										orgCharts.onEdit(dataTemp);
									}
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
							document.getElementById("org_menu_absorbed").style.display = 'none';
							document.getElementById("org_menu_edit").style.display = 'none';

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
				if(tab == null) {
					orgCharts.data.push(dataTemp);
				} else {
					var tabs = tab.split("-");
					var data = orgCharts.data[tabs[0]];
					for(var x = 1; x < tabs.length; x++) {
						data = getData(data, tabs[x]);
					}
					data.child.push(dataTemp);
				}
				orgCharts.draw();
			}

			this.getData = function() {
				if(orgCharts.resetD.length > 0) {
					return orgCharts.resetD[0].data;
				}
				return orgCharts.data;
			}
		}
		//操作当前实例
		,
		thisIns = function() {
			var that = this,
				options = that.config,
				id = options.id || options.index;

			return {
				reload: function(options) {
					that.reload.call(that, options);
				},
				config: options
			}
		}

		//构造器
		,
		Class = function(options) {
			var that = this;
			that.index = ++orgCharts.index;
			that.index = ++orgCharts.index;
			that.config = $.extend({}, that.config, orgCharts.config, options);
			that.render();
		};

	//默认配置
	Class.prototype.config = {
		layout: ['province', 'city', 'county', 'street'] //联动层级
		//其他参数
		//……
	};

	//渲染视图
	Class.prototype.render = function() {}

	//核心入口
	orgCharts.render = function(options) {
		var ins = new Class(options);
		return thisIns.call(ins);
	};

	//加载组件所需样式
	layui.link(layui.cache.base + 'orgCharts/orgCharts.css?v=1', function() {
		//样式加载完毕的回调

	}, 'orgCharts'); //此处的“orgCharts”要对应 orgCharts.css 中的样式： html #layuicss-orgCharts{}

	exports('orgCharts', orgCharts);
});