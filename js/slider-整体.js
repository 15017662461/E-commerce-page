(function ($) {
    'use strict'

    function Slider($elem, options) {
        // 获取参数，调用初始化
        this.$elem = $elem;
        this.options = options;
        this.$items = this.$elem.find('.slider-item');
        this.$indicators = this.$elem.find('.slider-indicator');
        this.$controls = this.$elem.find('.slider-control');
        this.itemsNum = this.$items.length;
        this.curIndex = this._getCorrectIndex(this.options.activeIndex);
        this._init();
    }

    Slider.DEFAULTS = {
        // 默认参数
        css3: false,
        js: false,
        animation: 'fade',
        activeIndex: 0,
        interval: 0,
        loop: false
    };

    Slider.prototype._init = function () {
        //init 负责初始化以及相关事件的绑定
        var self = this;

        this.$indicators.removeClass('slider-indicator-active');
        this.$indicators.eq(this.curIndex).addClass('slider-indicator-active');
        this.$elem.trigger('slider-show');

        if (this.options.animation === 'slide') {//滑入滑出
            this.$elem.addClass('slider-slide');
            this.to = this._slide;
            this.$container = this.$elem.find('.slider-container');
            this.itemWidth = this.$items.eq(0).width();
            this.$container.css('left', -1 * this.curIndex * this.itemWidth);
            // 初始化move模块
            this.$container.move(this.options);

            if (this.options.loop) {
                this.$container.append(this.$items.eq(0).clone());
                this.transitionClass = this.$container.hasClass('transition') ? 'transition' : '';
                this.itemsNum++;
            }
            //发送消息
            
        } else {//淡入淡出
            this.$elem.addClass('slider-fade');
            this.$items.eq(this.curIndex).show();
            //初始化showHide模块
            this.$items.showHide(this.options);
            this.to = this._fade;
            // 发送消息
            this.$items.on('show shown hide hidden', function (e) {
                self.$elem.trigger('slider-' + e.type, [self.$items.index(this), this]);
            });
        }

        //事件绑定
        this.$elem
            .hover(function () {
                self.$controls.show();
            }, function () {
                self.$controls.hide();
            })
            .on('click', '.slider-control-left', function () {
                self.to(self._getCorrectIndex(self.curIndex - 1), 1);
            })
            .on('click', '.slider-control-right', function () {
                self.to(self._getCorrectIndex(self.curIndex + 1), -1);
            })
            .on('click', '.slider-indicator', function () {
                self.to(self._getCorrectIndex(self.$indicators.index(this)));
            })

        //开启与暂停自动切换
        if (this.options.interval && !isNaN(Number(this.options.interval))) {
            this.$elem.hover($.proxy(this.pause, this), $.proxy(this.auto, this));
            this.auto();
        }


    };

    Slider.prototype._getCorrectIndex = function (index, maxNum) {
        maxNum = maxNum || this.itemsNum;
        if (isNaN(Number(index))) return 0;
        if (index < 0) return maxNum - 1;
        if (index > maxNum - 1) return 0;
        return index;
    }

    Slider.prototype._activateIndicators = function (index) {
        // this.$indicators.eq(this.curIndex).removeClass('slider-indicator-active')
        this.$indicators.removeClass('slider-indicator-active');
        this.$indicators.eq(index).addClass('slider-indicator-active');
    }


    Slider.prototype._fade = function (index) {
        if (this.curIndex === index) return;
        this.$items.eq(this.curIndex).showHide('hide');
        this.$items.eq(index).showHide('show');

        this._activateIndicators(index);

        this.curIndex = index;
    };

    Slider.prototype._slide = function (index, direction) {
        if (this.curIndex === index) return;
        var self = this;
        this.$container.move('x', -1 * index * this.itemWidth);
        this.curIndex = index;

        if (this.options.loop && direction) {
            if (direction < 0) {//点击右边的按钮
                if (index === 0) {
                    this.$container.removeClass(this.transitionClass).css('left', 0);
                    this.curIndex = index = 1;
                    setTimeout(function () {
                        self.$container.addClass(self.transitionClass).move('x', -1 * index * self.itemWidth);
                    }, 20)
                }
            } else {//点击的是左边的按钮
                if (index === this.itemNum - 1) {

                    this.$container.removeClass(this.transitionClass).css('left', -1 * index * this.itemWidth);
                    this.curIndex = index = this.itemNum - 2;
                    setTimeout(function () {
                        self.$container.addClass(self.transitionClass).move('x', -1 * index * self.itemWidth);
                    }, 20);

                }
            }

            index = this._getCorrectIndex(index, this.itemsNum - 1);
        }

        this._activateIndicators(index);

    };

    Slider.prototype.auto = function () {
        var self = this;
        this.intervalId = setInterval(function () {
            self.to(self._getCorrectIndex(self.curIndex + 1),-1);
        }, this.options.interval);
    };

    Slider.prototype.pause = function () {
        clearInterval(this.intervalId);
    };

    $.fn.extend({
        slider: function (option) {
            return this.each(function () {

                var $this = $(this),
                    slider = $this.data('slider'),
                    options = $.extend({}, Slider.DEFAULTS, $(this).data(), typeof option === 'object' && option);
                // slider(this, options);  
                if (!slider) {//解决多次调用slider问题
                    $this.data('slider', slider = new Slider($this, options));
                }

                if (typeof slider[option] === 'function') {
                    slider[option]();

                }

            });
        }
    });
}(jQuery))
