// Livesite (c) Livesite Networks, LLC.

js.extend('ext.desktop',function(js){var _package=this;var CSwitchable=js.ext.share.ui.Switchable;var CPanel=_package.Panel=function(url){this.url=url;this.createElements();CSwitchable.call(this,url,this.iframe);};var _proto=CPanel.prototype=js.lang.createMethods(CSwitchable);_proto.createElements=function(){this.iframe=js.dom.createElement('IFRAME',{'frameBorder':'0','allowTransparency':'true','class':'layout1-area4','src':this.url});};_proto.onReload=function(){try{var iwin=js.dom.getContentWindow(this.iframe);var msg='Reload '+iwin.document.title+'?';env.status.confirm(msg,[function(ok){if(!ok)return;iwin.document.location.reload();},this]);}catch(ex){}};});js.extend('ext.desktop',function(js){var CScreen=js.ext.share.Screen;this.Screen=function(){CScreen.apply(this,arguments);this.panels=new js.ext.share.ui.SwitchList('ext-desktop-screen');this.openPanel=null;env.registerHandler('open-desktop-panel',[this.openDesktopPanel,this]);};var _proto=this.Screen.prototype=js.lang.createMethods(CScreen);_proto.onShow=function(){var panel=this.panels.getSelected();if(this.openPanel){this.panels.select(this.openPanel);this.openPanel=null;}};_proto.onHide=function(){this.openPanel=this.panels.deselect();};_proto.openDesktopPanel=function(action,arg){var panel=this.panels.get(arg);if(!panel){panel=new js.ext.desktop.Panel(arg);this.panels.add(panel);}
this.panels.select(panel);};});