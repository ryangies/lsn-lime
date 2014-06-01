// 

js.extend('ext.editors.hash',function(js){var CScreen=js.ext.share.Screen;this.Screen=function(){CScreen.apply(this,arguments);this.hasInitialized=false;this.editors=new js.ext.share.ui.SwitchList('ext-editors-hash-area4');this.tabs=new js.ext.share.ui.TabList(this.editors);this.tabs.Tab=js.ext.editors.hash.ui.Tab;this.menu=null;this.area4=env.layout.getArea('layout1-area4');this.area4.addActionListener('onUpdate',[this.onResize,this]);};var _proto=this.Screen.prototype=js.lang.createMethods(CScreen);_proto.initialize=function(){this.menu=new js.ext.share.ui.menu.PanelMenu(env,this.editors);this.menu.load([#:json /ext/editors/hash/menu.hf]);js.dom.replaceChildren('ext-editors-hash-area2',this.menu.getElements());js.dom.replaceChildren('ext-editors-hash-area3',this.tabs.getElements());this.hasInitialized=true;};_proto.load=function(params){if(!this.hasInitialized)this.initialize();if(params&&params.dnode){var dnode=params.dnode;var iid=dnode.getInstanceId();var editor=this.editors.get(iid);if(!editor){editor=new js.ext.editors.hash.Editor(iid,params.schema);this.editors.add(editor);}
this.editors.select(editor,dnode);}};_proto.onResize=function(action,area){};});js.extend('ext.editors.hash',function(js){var _package=this;var _strings=[#:json ./strings.hf];var CAction=js.action.ActionDispatcher;var CEditor=_package.Editor=function(name,schema){CAction.apply(this);this.options={'autoCommit':false};this.name=name;this.schema=schema;this.conflict=false;this.isStoring=false;this.dnode=null;this.uiRoot=null;this.alUpdate=null;this.alBeforeUnload=env.layout.addActionListener('onPageBeforeUnload',this.onBeforeUnload,this);this.createUI();this.createView();};var _proto=CEditor.prototype=js.lang.createMethods(CAction);_proto.onBeforeUnload=function(action,event){if(!this.dnode)return;if(!this.hasChanged())return;var addr=this.dnode.getAddress();var msg=_string.on_abandon+"("+addr+")";if(event)event.returnValue=msg;return msg;};_proto.getOption=function(key){return this.options[key];};_proto.setOption=function(key,value){if(key in this.options){return this.options[key]=value;}else{throw new Error('Not an option:'+key);}};_proto.getDataNode=function(){return this.dnode;};_proto.getElements=function(){return[this.uiRoot];};_proto.getMenu=function(){};_proto.createUI=function(){this.uiRoot=js.dom.createElement('DIV#ext-editors-hash-Editor');};_proto.createView=function(){if(this.view){if(this.schema===this.view.schema)return;this.view.unload();}
this.view=new js.ext.editors.hash.ui.EditView(this.schema);js.dom.replaceChildren(this.uiRoot,this.view.getElements());};_proto.reload=function(){if(this.hasChanged()){env.status.confirm(_strings.on_discard,[function(result){if(result)this.doReload();},this]);return;}
this.doReload();};_proto.doReload=function(){var dnode=this.dnode;this.unload();this.load(dnode);};_proto.focus=function(){};_proto.close=function(){if(this.hasChanged()){env.status.confirm(_strings.on_discard,[function(result){if(result)this.doClose();},this]);return;}
this.doClose();};_proto.doClose=function(){this.unload();this.hide();this.executeClassAction('onClose',this);};_proto.getName=function(){return this.name;};_proto.show=function(appendTo,cb){js.dom.appendChildren(appendTo,this.getElements());this.unhide();this.focus();this.executeClassAction('onShow',this);if(cb)js.lang.callback(cb);};_proto.unhide=function(cb){js.dom.setOpacity(this.uiRoot,1);js.dom.setStyle(this.uiRoot,'visibility','visible');this.executeClassAction('onUnhide',this);if(cb)js.lang.callback(cb);};_proto.hide=function(cb){js.dom.setOpacity(this.uiRoot,0);js.dom.setStyle(this.uiRoot,'visibility','hidden');this.executeClassAction('onHide',this);if(cb)js.lang.callback(cb);};_proto.load=function(node){var dnode=node.getDataNode();if(dnode&&dnode!==this.dnode){if(this.dnode)this.unload();env.showLoading();if(js.util.isFunction(node.getSchema)){this.schema=node.getSchema();this.createView();}
dnode.reload([this.onDataLoad,this]);}else{this.executeClassAction('onReady',this);}};_proto.unload=function(){this.dnode=null;this.reset();if(this.alUpdate)this.alUpdate.remove();if(this.alRemove)this.alRemove.remove();};_proto.reset=function(){if(this.view&&this.view.form){this.view.form.reset();}};_proto.onDataLoad=function(dnode){env.hideLoading();this.unmarshal(dnode);this.alUpdate=dnode.addActionListener('update',this.onNodeUpdated,this);this.alRemove=dnode.addActionListener('remove',this.onNodeRemoved,this);this.executeClassAction('onLoad',this);this.executeClassAction('onReady',this);};_proto.onReady=function(){this.focus();};_proto.unmarshal=function(dnode){this.conflict=false;this.dnode=dnode;this.view.setDataNode(dnode,this.getOption('autoCommit'));};_proto.marshal=function(){return this.view.form.serializeValues();};_proto.onNodeUpdated=function(action,dnode){if(this.isStoring||this.getOption('autoCommit'))return;if(!this.hasChanged()){this.unmarshal(dnode);}else{this.conflict=true;env.status.confirm(_strings.on_conflict,[function(result){if(result){this.unmarshal(dnode);}else{this.dispatchAction('conflict',dnode);}},this]);}};_proto.onNodeRemoved=function(action,dnode){this.doClose();};_proto.hasChanged=function(){return this.view&&this.view.hasChanged();};_proto.store=function(){if(this.conflict){env.status.confirm(_strings.on_overwrite,[this.doStore,this]);}else{this.doStore(true);}};_proto.doStore=function(confirmed){if(!confirmed)return;var values=this.marshal();var addr=this.dnode.getAddress();env.showLoading();this.dnode.getDataBridge().update(addr,values,[this.onStore,this]);this.isStoring=true;};_proto.onStore=function(dnode){env.hideLoading();this.isStoring=false;if(dnode){env.status.notify(_strings.on_saved);this.dispatchAction('saved',dnode);this.focus();}else{env.status.alert(_strings.on_notsaved);this.dispatchAction('notsaved',dnode);}};});js.extend('ext.editors.hash.ui',function(js){var _package=this;var CTab=js.ext.share.ui.Tab;_package.Tab=function(selector,target){CTab.apply(this,arguments);this.alOpen=target.addActionListener('onLoad',this.onTargetOpen,this);};var _proto=_package.Tab.prototype=js.lang.createMethods(CTab);_proto.onTargetOpen=function(action,target){if(!target)return;var dnode=target.getDataNode();if(this.alUpdate)this.alUpdate.remove();this.alUpdate=dnode.addActionListener('update',this.updateUI,this);this.updateUI(null,dnode);};_proto.updateUI=function(action,dnode){var addr=dnode.getAddress();js.dom.setAttribute(this.uiAnchor,'href',addr);js.dom.setAttribute(this.uiAnchor,'title',addr);js.dom.setAttribute(this.uiIcon,'src',dnode.getIcon());js.dom.setValue(this.uiMark,dnode.getKey());};_proto.removeUI=function(action,target){CTab.prototype.removeUI.call(this);this.alOpen.remove();if(this.alUpdate)this.alUpdate.remove();};});js.extend('ext.editors.hash.ui',function(js){var _package=this;var CNodeLayer=js.data.NodeLayer;var CView=js.ext.share.ui.View;_package.FieldView=function(){CNodeLayer.apply(this,arguments);CView.call(this);};var _proto=_package.FieldView.prototype=js.lang.createMethods(CNodeLayer,CView);_proto.createElements=function(){this.uiRoot=js.dom.createElement('TR.FieldView');return[this.uiRoot];};_proto.onAdopted=function(){var field=this.node;if(field.isHidden())return;var elements=js.dom.createElements('TH.field-view-term',['LABEL',{innerHTML:field.getLabelText()},'DIV',field.getMenuElements()],'TD.field-view-definition',['P.description',{innerHTML:field.getDescriptionText()},'DIV.input',field.getElements()]);js.dom.replaceChildren(this.uiRoot,elements);};});js.extend('ext.editors.hash.ui',function(js){var _package=this;var CView=js.ext.share.ui.View;var COptions=js.impl.Options;_package.EditView=function(schema){COptions.call(this,{'autoCommit':false});this.schema=schema;this.dnode=null;this.form=new js.ext.share.input.Form();this.schemaLoaded=false;CView.call(this);};var _proto=_package.EditView.prototype=js.lang.createMethods(COptions,CView);_proto.CFieldView=js.ext.editors.hash.ui.FieldView;_proto.setDataNode=function(dnode,bAutoCommit){this.setOption('autoCommit',bAutoCommit);this.form.untieValues();this.dnode=dnode;if(!this.schema&&dnode.getValue('schema')){env.schemas.fetch(dnode.getValue('schema'),[function(schema){this.setup(schema);},this]);}else{this.setup();}};_proto.setup=function(schema){if(schema){this.schemaLoaded=false;this.schema=schema;js.dom.removeChildren(this.uiTBody);}
if(!this.schemaLoaded){this.form.loadSchema(this.schema);this.fieldView.walk(function(item){js.dom.appendChildren(this.uiTBody,item.getElements());},this);this.schemaLoaded=true;}
if(this.dnode){this.form.tieValues(this.dnode,this.getOption('autoCommit'));}};_proto.createElements=function(){this.uiTBody=js.dom.createElement('TBODY');this.uiRoot=js.dom.createElement('TABLE.EditView',[this.uiTBody]);this.fieldView=this.form.addLayer('field-layer',this.CFieldView);return[this.uiRoot];};_proto.unload=function(){js.dom.removeChildren(this.uiTBody);this.form.untieValues();this.form.removeAllChildren();this.schemaLoaded=false;};_proto.hasChanged=function(){return this.form.hasChanged();};});js.extend('ext.editors.hash',function(js){var config={"addr":"/ext/editors/hash/","name":"Hash editor","icon":"/res/icons/16x16/nodes/data-hash.png","elem":"ext-editors-hash-screen","layout":"layout1"};var initiator=new js.ext.share.Initiator({'type':'file-action','action':'edit-modeled-data','text':'Edit Data','target':'selection','tooltip':'Edit data according to its schema','icon':'/res/icons/16x16/apps/livesite.png','sortValue':2,'matchTypes':[/file-text-hfm/]});var handler=function(action,target,schema){try{var params={};if(js.util.isString(target)){env.hub.fetch(target,function(dnode){env.invokeHandler('edit-modeled-data',dnode,schema);});}else{params['dnode']=target.getDataNode();env.schemas.fetch(schema,function(schema){params['schema']=schema;var screen=env.screens.get(config.addr);env.screens.select(screen,params);});}}catch(ex){js.console.log('Could not open:',target,ex);}};env.registerHandler('edit-modeled-data',handler,initiator);env.registerHandler('ext-editors-hash-show-file-open',function(action){env.dialogs.get('ext-share-dialog-filesystem-open').run({},function(action,values){env.invokeHandler('edit-modeled-data',values.dnode);});});env.registerHandler('ext-editors-hash-file-close',function(action,editor){editor.close();});env.registerHandler('ext-editors-hash-file-reload',function(action,editor){editor.reload();});env.registerHandler('ext-editors-hash-file-save',function(action,editor){editor.store();});});