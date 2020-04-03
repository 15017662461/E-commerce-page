(function ($) {
    'use strict';

    var transition = window.mt.transition;

    var init = function ($elem) {
        this.$elem = $elem;
        this.curX = parseFloat(this.$elem.css('left'));
        this.curY = parseFloat(this.$elem.css('top'));
    };
    var to = function (x, y, callback) {
        x = (typeof x === 'number') ? x : this.curX;
        y = (typeof y === 'number') ? y : this.curY;
        if (this.curX === x && this.curY === y) return;

        this.$elem.trigger('move', [this.$elem]);

        if (typeof callback === 'function') {
            callback();
        }
        this.curX = x;
        this.curY = y;
    }

    var Silent = function ($elem) {
        init.call(this, $elem);
        this.$elem.removeClass('transition');
    };

    Silent.prototype.to = function (x, y) {
        var self = this;
        to.call(this, x, y, function () {
            self.$elem.css({
                left: x,
                top: y
            });
            self.$elem.trigger('moved', [self.$elem]);
        });
    };

    Silent.prototype.x = function (x) {
        this.to(x);
    };

    Silent.prototype.y = function (y) {
        this.to(null, y);
    };


    var Css3 = function ($elem) {
        init.call(this, $elem);
        this.$elem.addClass('transition');
        this.$elem.css({
            left: this.curX,
            top: this.curY
        })
    };

    Css3.prototype.to = function (x, y) {
        var self = this;
        to.call(this, x, y, function () {
            self.$elem.css({
                left: x,
                top: y
            });
            self.$elem.off(transition.end).one(transition.end, function () {
                self.$elem.trigger('moved', [self.$elem]);
            });
        });
    };

    Css3.prototype.x = function (x) {
        this.to(x);
    };

    Css3.prototype.y = function (y) {
        this.to(null, y);
    };


    var Js = function ($elem) {
        init.call(this, $elem);
        this.$elem.removeClass('transition');
    };

    Js.prototype.to = function (x, y) {
        var self = this;
        to.call(this, x, y, function () {
            self.$elem.stop().animate({
                left: x,
                top: y
            }, function () {
                self.$elem.trigger('moved', [self.$elem]);
            })
        });
    };

    Js.prototype.x = function (x) {
        this.to(x);
    };

    Js.prototype.y = function (y) {
        this.to(null, y);
    };

    // var $box = $('#box'),
    //     $goBtn = $('#go-btn'),
    //     $backBtn = $('#back-btn'),
    //     move = new Js($box);
    // $box.on('move moved', function (e, $elem) {
    //     console.log(e.type);
    //     console.log($elem);
    // });
    // $goBtn.on('click', function () {
    //     // move.to(100, 50);
    //     move.x(100);
    // });
    // $backBtn.on('click', function () {
    //     // move.to(0, 20);
    //     move.x(0);
    // });

    var defaults = {
        css3: false,
        js: false,
    };
    var move = function ($elem, options) {
        var mode = null;
        if (options.css3 && transition.isSupport) {
            mode = new Css3($elem);
        } else if (options.js) {
            mode = new Js($elem);
        } else {
            mode = new Silent($elem);
        }

        return {
            to: $.proxy(mode.to, mode),
            x: $.proxy(mode.x, mode),
            y: $.proxy(mode.y, mode)
        }
    }

    $.fn.extend({
        move: function (option, x, y) {
            return this.each(function () {
                var $this = $(this),
                    mode = $this.data('move'),
                    options = $.extend({}, defaults, typeof option === 'object' && option);
                // move(this, options);  
                if (!mode) {//解决多次调用move问题
                    $this.data('move', mode = move($this, options));
                }

                if (typeof mode[option] === 'function') {
                    mode[option](x, y);
                }
            });
        }
    });
}(jQuery))