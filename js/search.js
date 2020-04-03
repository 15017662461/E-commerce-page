// (function ($) {
//     'use strict';
//     var $search = $('.search'),
//         $input = $search.find('.search-inputbox'),
//         $btn = $search.find('.search-btn'),
//         $form = $search.find('.search-form'),
//         $layer = $search.find('.search-layer');
//     //验证
//     $form.on('submit', function () {
//         if ($.trim($input.val()) === '') {
//             return false;
//         }
//     })

//     // 自动完成
//     $input.on('input', function () {
//         var url = 'https://suggest.taobao.com/sug?code=utf-8&_ksTS=1585220618506_764&callback=jsonp765&k=1&area=c2c&bucketid=13&q=' + encodeURIComponent($.trim($input.val()));
//         $.ajax({
//             url: url,
//             dataType: 'jsonp'
//         }).done(function (data) {
//             var html = '',
//                 dataNum = data['result'].length,
//                 maxNum = 10;
//             if (dataNum === 0) {
//                 $layer.hide().html('');
//                 return;
//             }
//             for (var i = 0; i < dataNum; i++) {
//                 // console.log(data.result[i][0]);
//                 // html += '<li class="search-layer-item .text-ellipsis">'+data.result[i][0]+'</li>';
//                 if (i >= maxNum) break;
//                 html += '<li class="search-layer-item text-ellipsis">' + data.result[i][0] + '</li>'
//             }
//             $layer.html(html).show();
//         }).fail(function () {
//                 $layer.hide().html('');
//             })
//             .always(function () {
//                 console.log('123')
//             });
//     });

//     $layer.on('click', '.search-layer-item', function () {
//         $input.val(removeHtmlTags($(this).html()));
//         $form.submit();
//     });

//     $(document).on('click',function(){
//         $layer.hide();
//     });
//     $input.on('click',function(e){
//         $layer.show();
//         e.stopPropagation();
//     });

//     function removeHtmlTags(str){
//         var reg = /<(?:[^>'"]|"[^"]*"|'[^']*')*>/g;
//         return str.replace(reg,'');
//     }


// }(jQuery))

(function ($) {
    'use strict';

    var cache = {
        data: {},
        count: 0,
        addData: function (key, data) {
            if (!this.data[key]) {
                this.data[key] = data;
                this.count++;
            }
        },
        readData: function (key) {
            return this.data[key];
        },
        deleteDataByKey:function(key){
            delete this.data[key];
            this.cont--;
        },
        deleteDataByOrder:function(num){
            var count = 0;

            for(var p in this.data){
                if(count >= num){
                    break;
                }
                count ++;
                this.deleteDataByKey(p);
            }
        }
    };


    function Search($elem, options) {
        this.$elem = $elem;
        this.options = options;
        this.$input = this.$elem.find('.search-inputbox');
        this.$form = this.$elem.find('.search-form');
        this.$layer = this.$elem.find('.search-layer');

        this.loaded = false;

        this.$elem.on('click', '.search-btn', $.proxy(this.submit, this));
        if (this.options.autocomplete) {
            this.autocomplete();
        }

    }
    Search.DEFAULTS = {
        autocomplete: false,
        url: 'https://suggest.taobao.com/sug?code=utf-8&_ksTS=1585220618506_764&callback=jsonp765&k=1&area=c2c&bucketid=13&q=',
        css3: false,
        js: false,
        animation: 'fade',
        getDataInterval: 200
    };
    Search.prototype.submit = function () {
        if ($.trim(this.$input.val()) === '') {
            return false;
        }
        this.$form.submit();
    };
    Search.prototype.autocomplete = function () {
        var timer = null,
            self = this;

        this.$input
            .on('input', function () {
                if (self.options.getDataInterval) {
                    clearTimeout(timer);
                    timer = setTimeout(function () {
                        self.getData();
                    }, self.options.getDataInterval);
                } else {
                    self.getData();
                }
            })
            .on('focus', $.proxy(this.showLayer, this))
            .on('click', function () {
                return false;
            });
        this.$layer.showHide(this.options);

        $(document).on('click', $.proxy(this.hideLayer, this));

    };
    Search.prototype.getData = function () {
        var self = this;
        var inputVal = this.getInputVal();
        if (inputVal === '') return self.$elem.trigger('search-noData');

        if(cache.readData(inputVal)) return self.$elem.trigger('search-getData',[cache.readData(inputVal)]);
        
        if (this.jqXHR) this.jqXHR.abort()
        this.jqXHR = $.ajax({
            url: this.options.url + inputVal,
            dataType: 'jsonp'
        }).done(function (data) {
            cache.addData(inputVal,data);
            console.log(cache);
            self.$elem.trigger('search-getData', [data]);
        }).fail(function () {
            self.$elem.trigger('search-noData');
        }).always(function () {
            self.jqXHR = null;
        });
    };
    Search.prototype.showLayer = function () {
        if (!this.loaded) return;
        this.$layer.showHide('show');
    };
    Search.prototype.hideLayer = function () {
        this.$layer.showHide('hide');
    };
    Search.prototype.getInputVal = function () {
        return $.trim(this.$input.val());
    };
    Search.prototype.setInputVal = function (val) {
        this.$input.val(removeHtmlTags(val));

        function removeHtmlTags(str) {
            return str.replace(/<(?:[^>'"]|"[^"]*"|'[^']*')*>/g, '');
        }
    };
    Search.prototype.appendLayer = function (html) {
        this.$layer.html(html);
        this.loaded = !!html;
    };

    $.fn.extend({
        search: function (option, value) {
            return this.each(function () {

                var $this = $(this),
                    search = $this.data('search'),
                    options = $.extend({}, Search.DEFAULTS, $(this).data(), typeof option === 'object' && option);
                // search(this, options);  
                if (!search) {//解决多次调用search问题
                    $this.data('search', search = new Search($this, options));

                }

                if (typeof search[option] === 'function') {
                    search[option](value);

                }

            });

        }
    });




}(jQuery))