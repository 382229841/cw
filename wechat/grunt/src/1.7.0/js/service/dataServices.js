app.factory('httpRequest', ['$http', '$q', '$log', function ($http, $q, $log) {
    return {
        Request: function (requestType, api, requestData, header, service, isShowLoading,isCache) {
            var d = $q.defer();
            //requestType 'GET'
            var url;
            if (service) {
                url = api;
            }
            else {
                url = serviceUrl + api;
            }
            if(isShowLoading){
                showLoading();
            }                
            if (header) {
                $http.defaults.headers.common = header;
            }else{
                //$http.defaults.headers.common = { "content-type": "application/x-www-form-urlencoded" };
                $http.defaults.headers.common = { "content-type": "application/json" };
            }
            if(requestType=="get" || requestType=="GET" || requestType=="DELETE"){
                    /*$http.jsonp(url+'&callback=JSON_CALLBACK')
                        .success(
                            function(data, status, header, config){
                                hideLoading();
                                d.resolve(data);
                            }
                        )
                        .error(
                            function(data){
                               hideLoading();
                                d.reject(data);
                            }
                        );*/
                   var phpApi="http://m.xiaoniubang.com/api/post.php";//?url="+encodeURIComponent(url)+"&method=get";
                   var data={url:url,data:{},method:requestType};
                   $http({ method: 'POST', url: phpApi, data: angular.toJson(data), cache :isCache }).
                        success(
                        function (data, status, headers, config) {
                            hideLoading();
                            if(data.status==1){
                                d.resolve(data.data);
                            }else{
                                d.resolve(data.msg);
                            }
                            
                        }).
                        error(function (data, status, headers, config) {
                            hideLoading();
                            $log.error("Error: ", headers);
                            d.reject(data);
                        });
                  /*$.ajax({
                    url: phpApi,
                    dataType: "json",
                    cache:true,
                    type:'GET',
                    success: function(data){
                        hideLoading();
                        d.resolve(data);
                    },
                    error:function(data){
                         hideLoading();
                         $log.error("Error: ", data);
                         d.reject(data);
                    }
                });*/
            }else{
                   var phpApi="http://m.xiaoniubang.com/api/post.php";//?url="+encodeURIComponent(url)+"&method="+requestType;
                   var data={url:url,data:requestData,method:requestType};
                   $http({ method: 'POST', url: phpApi, data:angular.toJson(data), cache :isCache }).
                        success(
                        function (data, status, headers, config) {
                            hideLoading();
                            d.resolve(data);
                        }).
                        error(function (data, status, headers, config) {
                            hideLoading();
                            $log.error("Error: ", headers);
                            d.reject(data);
                        });
                        /*$.ajax({
                            url: url,
                            dataType: "json",
                            cache:true,
                            type:'PUT',
                            success: function(data){
                                hideLoading();
                                d.resolve(data);
                            },
                            error:function(data){
                                 hideLoading();
                                 $log.error("Error: ", data);
                                 d.reject(data);
                            }
                        });*/
            }
           
            return d.promise;
        },
        Get: function (api, isShowLoading,header, requestData,isCache,service) {
            isCache=isCache==undefined?true:isCache;
            var r=requestData?requestData:"";
            service?service:false;
            return this.Request("GET", api, r, header,service,isShowLoading,isCache);
        },
        POST: function (api, requestData, header, isShowLoading) {
            return this.Request("POST", api, requestData, header, false, isShowLoading);
        },
        PUT: function (api, requestData, header, isShowLoading) {
            return this.Request("PUT", api, requestData, header,false,isShowLoading);
        },
        DELETE: function (api, requestData, header, isShowLoading) {
            return this.Request("DELETE", api, "", header, false, isShowLoading);
        },
        APIPOST: function (api, requestData, header, isShowLoading) {
            return this.Request("POST", api, requestData, header, javaServiceUrl, isShowLoading);
        }
    };
} ]);

app.factory('anchorScroll', function () {
    function toView(element, top, height) {
        var winHeight = $(window).height();
        
        element = $(element);
        var scrollTo=(element.offset().top - height);
        if(scrollTo>0 && scrollTo<=1){
            return;
        }
        $('.scrollable-content').animate({
            scrollTop: top ? scrollTo : (element.offset().top + element.outerHeight() + height - winHeight)
        }, {
            duration: 10,
            easing: 'linear',
            complete: function () {
                if (!inView(element)) {
                    var offset=(element.offset().top - height);
                    var adj=scrollTo>0? scrollTo: 0;
                    $('.scrollable-content').scrollTop(offset+adj);
                }
            }
        });
    }

    function inView(element) {
        element = $(element);

        var win = $(window),
            winHeight = win.height(),
            eleTop = element.offset().top,
            eleHeight = element.outerHeight(),
            viewTop = win.scrollTop(),
            viewBottom = viewTop + winHeight;

        function isInView(middle) {
            return middle > viewTop && middle < viewBottom;
        }

        if (isInView(eleTop + (eleHeight > winHeight ? winHeight : eleHeight) / 2)) {
            return true;
        } else if (eleHeight > winHeight) {
            return isInView(eleTop + eleHeight - winHeight / 2);
        } else {
            return false;
        }
    }

    return {
        toView: toView,
        inView: inView
    };
})