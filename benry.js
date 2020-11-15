var benry=function(obj){
	return new benry.prototype.init(obj);
}
benry.r=function(i){
	return [...Array(i).keys()];
}
benry.ck=function(ary,callback){
	var ck=0;
	benry.r(ary.length).forEach(function(i){
		if( callback(ary[i]) ){ ck++; }
	});
	return ck;
}
benry.each=function(obj,callback){
	if(Object.prototype.toString.call(obj)!=='[object Array]'){
		obj=[obj];
	}
	var length=obj.length,i=0,s=callback.toString();

	if( s.match(/^i=>/) ){
		benry.r(length).forEach(i=>{
			callback(i);
		});
	}
	else if( s.match(/^\(i,val\)=>/) ){
		benry.r(length).forEach(i=>{
			callback.call(obj,i,obj[i]);
		});
	}
	else if( s.match(/^val=>|^item=>|^[_a-z\$]+\$=>|^\(val,i\)=>/) ){
		benry.r(length).forEach(i=>{
			callback.call(obj,obj[i],i);
		});
	}else{
		benry.r(length).forEach(i=>{
			callback.call(obj[i],i,obj[i]);
		});
	}
}
benry.map=function(obj,callback){
	var length=obj.length,i=0,s=callback.toString();
	var self=this;
	var arr=[];
	if(Object.prototype.toString.call(obj)==='[object Array]'){
		benry.each(obj,val=>{
			arr.push( callback.call(self,val) );
		});
		return arr;
	}else{
		arr.push( callback.call(this,obj) );
		return arr;
	}
}
benry.reduce=function(list, callback, init){
	var r = init,i=0,length=list.length;
	for(;i<length; i++) {
		if(i==0 && init==undefined){
			r=list[i];
		}else{
			r=callback.call(r,r, list[i]);
		}
	}
	return r;
}
benry.shuffle=function(list,callback){
	var rand;
	benry.each(list,(i,val)=>{
		rand = Math.floor( Math.random() * ( i + 1 ) );
		[list[i], list[rand]] = [list[rand], list[i]]
	});
	return this;
}
benry.trace=function($trace_areas,_msgs,callback){
	if(callback){ callback.call($trace_areas); }
	var msgs=_msgs.data.concat().reverse();
	benry.each($trace_areas,$trace_zone$=>{
		$trace_zone$.html('');
		benry.each(msgs, msg$=>{
			$trace_zone$.append(msg$);
		});
	});
}
benry.createProgressForm=function(obj,callback){
	var $progress=$(`<div>`);
		$progress.css({
			"display":"grid",
			"grid-template-areas":"\'id per time\'",
			"grid-template-columns":"1fr 3fr 1fr",
			"text-align":"center",
			"width":"1020px"
		});
	var $id_zone=$(`<div class="id-zone">id</div>`);
		$id_zone.css({
			"color":"black",
			"margin":"10px"
		});
	var $per_zone=$(`<div class="per-zone">waiting...</div>"`);
		$per_zone.css({
			"color":"gray",
			"border":"1px solid gray",
			"background":"linear-gradient(90deg,lime 0%,lime 0%,#eee 0px,#eee 100%)",
			"margin":"10px"
		});
	var $time_zone=$(`<div class="time-zone">--:--:-- / 00:00:00</div>`);
		$time_zone.css({
			"color":"black",
			"margin":"10px"
		});
	$progress.append($id_zone,$per_zone,$time_zone);
	obj.$progress=$progress;
	if(callback){ callback.call(obj); }
	return obj;
}
benry.createUploadForm=function(obj,dragover,drop,callback){
	var $btn=$('<button>');
		$btn.addClass('btn btn-primary btn-block');
		$btn.css({"width":'100%',"height":'100px'});
		$btn.html('ここにフィアルを<br>ドロップしてください');
	var $form=$(`<div>`);
		$form.css({"padding":'100px'});
		$form.append($btn);
	obj.$form=$form;

	$form[0].addEventListener('dragover',dragover,false);
	$form[0].addEventListener('drop',function(event){
		event.preventDefault();
		var items = event.dataTransfer.items;
		for (var item of items) {
			var item_queue=queue();
			var entry = item.webkitGetAsEntry();
			var entryReader = entry.createReader();
			var _results=[];
			entryReader.readEntries(files=>{
				benry.r(files.length).forEach(i=>{
					var file=files[i];
					if(!file.isFile){ return; }
					file.file(file2=>{
						item_queue.add({
							"msg":`file onload waiting`,
							"async":false,
							"callback":function(i,item$que,$queue){
								var reader = new FileReader();
								reader.readAsArrayBuffer(file2);
								reader.onload=()=>{
									item$que.complete();
									$queue.study();
									if( !!callback(file2) ){
										_results.push( file2 );
									}
									if( $queue.isComplete() ){
										drop( _results );
									}
								}
							}
						}).study();
					});
				});
			});
		}
	},false);
	return obj;
}

benry.prototype={
	constructor:benry,
	data:[],
	add:function(item,callback){
		var self=this;
		if(callback){
			item=benry.map.call(self,item,callback);
			benry.each(item,val=>{
				self.add(val);
			});
		}else{
			this.data.push(item);
		}
		return this;
	},
	eq:function(i){ return this.data[i]; },
	ck:function(callback){ return benry.ck.call(this,this.data,callback); },
	each:function(callback){ return benry.each.call(this,this.data,callback); },
	map:function(callback){ return benry.map.call(this,this.data,callback); },
	reduce:function(callback){ return benry.reduce.call(this,this.data,callback); },
	shuffle:function(callback){ return benry.shuffle.call(this,this.data,callback); },
	trace:function(msgs,callback){
		return benry.trace.call(this,this.data,msgs,callback);
	},
	createUploadForm:function(dragover,drop,callback){ return benry.createUploadForm.call(this.data[0],this.data[0],dragover,drop,callback); },
	createProgressForm:function(callback){ return  benry.createProgressForm.call(this.data[0],this.data[0],callback); }
}
benry.prototype.init=function(item,callback){
	var self=this;
	this.data=[];

	if(!item){ return this; }
	if(callback){
		item=benry.map(item,callback);
	}
	if(Object.prototype.toString.call(item)==='[object Array]'){
		benry.each(item,val=>{
			self.add(val);
		});
	}else{
		this.add(item);
	}
	return this;
}
benry.prototype.init.prototype = benry.prototype;
window._=benry;
