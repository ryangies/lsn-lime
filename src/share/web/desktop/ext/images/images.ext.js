// 

js.extend('ext.images',function(js){var CForm=js.lsn.forms.Form;this.Form=function(id){CForm.call(this,js.ext.images.settings.get(id),js.ext.images.config);};var Form=this.Form.prototype=js.lang.createMethods(CForm);});js.extend('ext.images',function(js){this.Main=function(){this.input=new js.ext.images.Form('input');this.view=new js.ext.images.View();};var _proto=this.Main.prototype=js.lang.createMethods();_proto.attachButtons=function(elem){var div=js.dom.createElement('DIV');js.dom.appendChild(elem,div);js.ext.images.settings.get('buttons').iterate(function(idx,button){js.dom.appendChildren(div,js.dom.createElements('BUTTON',{'onClick':[this.submitAction,this,[button]],'innerHTML':button.getString('text')},'#text= '));},this);};_proto.attachOutput=function(elem){elem.appendChild(this.view.getRootElement());};_proto.attachInput=function(elem){elem.appendChild(this.input.getRootElement());};_proto.submitAction=function(event,button){var name=button.getString('action');var confirmation=button.getString('confirm');if(confirmation&&!confirm(confirmation))return;var req=new js.http.Stream('[#`./module.pm`]/'+name);req.addActionListener('onReceive',this.onReceive,this);req.addEventListener('onCreate',this.onCreate,this);req.addEventListener('onComplete',this.onComplete,this);req.submit(this.input.getValues());};_proto.onCreate=function(req){var ctrls=js.dom.getElementsByTagName(js.dom.getBody(),['INPUT','SELECT','BUTTON']);for(var i=0,ctrl;ctrl=ctrls[i];i++){js.dom.setAttribute(ctrl,'disabled','disabled');}
this.view.clear();};_proto.onReceive=function(action,data){this.view.updateUI(data);};_proto.onComplete=function(req){var ctrls=js.dom.getElementsByTagName(js.dom.getBody(),['INPUT','SELECT','BUTTON']);for(var i=0,ctrl;ctrl=ctrls[i];i++){js.dom.removeAttribute(ctrl,'disabled');}};});js.extend('ext.images',function(js){this.View=function(){this.items=[];};var _proto=this.View.prototype=js.lang.createMethods();_proto.getRootElement=function(){return this.uiRoot||this.createUI();};_proto.createUI=function(){return this.uiRoot=js.dom.createElement('DIV.results');};_proto.clear=function(){this.items=[];var root=this.getRootElement();js.dom.removeChildren(root);};_proto.updateUI=function(data){var part=data.toObject();if(part.type=='result'){this.updateResults(part);}else if(part.type=='error'){alert(part.message);}else{throw'Unknown response data';}}
_proto.updateResults=function(part){var src=new js.http.Location(part.addr);if(part.resize){src.addParameter('resize',part.resize);}
var root=this.getRootElement();var item=js.dom.createElement('DIV.item',['IMG',{'src':src.getHref(),'width':part.resize_dims[0],'height':part.resize_dims[1]},'PRE',['#text',{'nodeValue':['url('+part.addr+');','width:'+part.actual_dims[0]+'px;'+'height:'+part.actual_dims[1]+'px;'+' /* Actual */','width:'+part.resize_dims[0]+'px;'+'height:'+part.resize_dims[1]+'px;'+' /* Resized */'].join("\n")}]]);if(!this.items[part.addr]){root.appendChild(item);}else{var old=this.items[part.addr];js.dom.insertBefore(item,old);js.dom.removeElement(old);}
this.items[part.addr]=item;};});js.extend('ext.images',function(js){this.settings=[#:js:var ./settings.hf];this.config=[#:js:var ./module.pm/get_config];});