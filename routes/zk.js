
var zk = require ("zookeeper");
var async = require("async");

var connect  = 'localhost:2181';



exports.get = function(req, res){
    var path = require('url').parse(req.url).pathname;
    path = path.replace(/^\/zk/, '');
    if(/\/$/.test(path)&& path!=='/') path = path.substr(0, path.length-1);
    getNodeRecursive(zkCtxt, '/', function(dataRec){

           getNodeAndChildren(zkCtxt, path, function(data, children){
               console.log("TYPEOF DATA "+ data);
               res.render('zk', { title: 'Ranger', data: data, children: children, allData: dataRec});
           })

    });



};
//-------------------------------------------------------------------- operations begin ---------------------------------------

var EVENT_WATCHER_READY = "watch_ready";

function getValidOptions(context, compCallback) {
    getNode(context, "/algs", function(data){
       var algs = data.toString().split(',');
       getNode(context, "/blenders", function(data2){
            var blenders = data2.toString().split(',');
            compCallback({algs: algs, blenders: blenders});
       });
    });
}

function getNodeAndChildren(zkCtxt, path, f) {
    getNode(zkCtxt, path, function(data){
        getNodeChildren(zkCtxt, path, function(children){
            f(data, children);
        });

    })
}

function getNode(context, path, compCallback) {
    console.log("getting node "+ path);
    context.zk.a_get(path, false, function ( rc, error, stat, data ){
        console.log ("getting node "+ path +" data is '"+data+"'");
        if(rc != 0) {
            throw error;
        }
        compCallback(data);
    } );
}

function getNodeChildren(context, path, compCallback){
    context.zk.a_get_children(path, false, function(rc, error, children) {
        console.log("getting children of node "+ path);
        if(rc!=0) {
            throw error;
        }
        compCallback(children);
    });
}

function finalPathPart(path) {
    if(path=='/') return 'ROOT';
    var split = path.split('/');
    return split[split.length-1];
}
function createPath(path, child) {
    if(path.indexOf("/", path.length - 1) !== -1) return path+child;
    return path+"/"+child;
}
function getNodeRecursive(context, path, completionCallback) {
    console.log('recursing thru'+path);
    var reducedPath = finalPathPart(path);
    getNode(context,path,
        function(data){
            console.log(typeof data);
            data = new String(data);
            console.log("in recursive for node "+path + " with data "+ data);
            getNodeChildren(context, path,
               function(children){
                   console.log("Children found "+children);
                   var childData = [];

                   async.each(children, function(child, callback){getNodeRecursive(context, createPath(path, child), function(data){
                       childData.push(data);
                       callback();
                   });}, function(err){completionCallback({path:reducedPath,data:data,children: childData})});

               })
        }
    );
}

function watchNode (context, step) {
    context.zk.aw_get (context.created_path, 
        function (type, state, path) { // this is watcher
            console.log ("get watcher is triggered: type=%d, state=%d, path=%s", type, state, path);
        }, 
        function (rc, error, stat, value) {// this is response from aw_get
            console.log ("get node result: %d, error: '%s', stat=%j, value=%s", rc, error, stat, value);
            if (rc != 0) {
                throw error;
            }
            context.zk.emit (EVENT_WATCHER_READY, context.created_path);
        }
    );
};

function setNode (context, step) {
    context.zk.a_set (context.created_path, "some other value", -1, function (rc, error, stat) {
        console.log ("set node result: %d, error: '%s', stat=%j", rc, error, stat);
        if (rc != 0) {
            throw error;
        }
    });
};



var zk_config = {connect:connect, debug_level:zk.ZOO_LOG_LEVEL_WARN, timeout:20000, host_order_deterministic:false};
var zkCtxt = {connected:false};

var zk_r = new zk ();
zkCtxt.zk = zk_r;
zk_r.init (zk_config);
zk_r.on (zk.on_connected, function (zkk) {
    console.log ("reader on_connected: zk=%j", zkk);
    zkCtxt.connected = true;
});
//
//var zk_w = new zk();
//zk_r.on (EVENT_WATCHER_READY, function (watched_path) {
//    zk_w.init (zk_config);
//    zk_w.on (ZK.on_connected, function (zkk) {
//        console.log ("writer on_connected: zk=%j", zkk);
//    });
//});
