/**
 * AngularJS Tutorial 1
 * @author Nick Kaye <nick.c.kaye@gmail.com>
 */

/**
 * Main AngularJS Web Application
 */

var app = angular.module('shoppingCart', [
  'ngRoute'
]);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider
    // Home
    .when("/", {
                templateUrl: "views/products.html",
                controller: "ProductCtrl"}
    ).when("/about", {
                templateUrl: "views/about.html",
                controller: "PageCtrl"}
    ).when("/thankyou", {
                templateUrl: "views/thankyou.html",
                controller: "ProductCtrl"}
    ).when("/pricing", {
                templateUrl: "views/pricing.html",
                controller: "PageCtrl"}
    ).when("/products", {
                templateUrl: "views/products.html",
                controller: "ProductCtrl"}
    ).when("/contact", {
                templateUrl: "views/contact.html",
                controller: "PageCtrl"}
    ).when("/blog",{
                templateUrl: "views/blog.html",
                controller: "BlogCtrl"}
    ).when("/blog/post", {
                templateUrl: "views/blog_item.html",
                controller: "BlogCtrl"}
    ).when("/cart", {
                templateUrl: "views/cart.html",
                controller: "ProductCtrl"}
    ).otherwise("/404", {
                templateUrl: "views/404.html",
                controller: "PageCtrl"}
    );
}]);

/**
 * Controls the Blog
 */
app.controller('BlogCtrl', function ($scope, $location, $http){
    console.log("Blog Controller reporting for duty.");
});

/**
 * Controls all other Pages
 */

app.controller('ProductCtrl', function ($rootScope, $scope, $location, $http){
    $scope.products = [
                    {sku : "APL", name: "Apple", description : "Eat one every day to keep the doctor away!", price : 12},
                    {sku : "BAN", name: "Banana", description : "Eat one every day to keep the doctor away!", price : 14},
                    {sku : "ORN", name: "Orange", description : "Eat one every day to keep the doctor away!", price : 15},
                    {sku : "MAN", name: "Mango", description : "Eat one every day to keep the doctor away!", price : 32},
                    {sku : "AOL", name: "Lemon", description : "Eat one every day to keep the doctor away!", price : 23},
                    {sku : "KOL", name: "Coke", description : "Eat one every day to keep the doctor away!", price : 42},
                    {sku : "COL", name: "Fanta", description : "Eat one every day to keep the doctor away!", price : 12},
                    {sku : "DOL", name: "Pepsi", description : "Eat one every day to keep the doctor away!", price : 32},
                    {sku : "POL", name: "Dew", description : "Eat one every day to keep the doctor away!", price : 11}
                ];
    
    $scope.addProductToCart = function (sku, name, price, quantity) {
            if (quantity != 0) {
                // update quantity for existing item
                var found = false;
                for (var i = 0; i < $rootScope.cartItems.length && !found; i++) {
                    var item = $rootScope.cartItems[i];
                    if (item.sku == sku) {
                        found = true;
                        item.quantity = $rootScope.toNumber(item.quantity + quantity);
                        if (item.quantity <= 0) {
                            this.items.splice(i, 1);
                        }
                    }
                }
                // new item, add now
                if (!found) {
                    var item = {};
                    item.sku = sku;
                    item.name = name;
                    item.price = price;
                    item.quantity = $rootScope.toNumber(quantity);
                    $rootScope.cartItems.push(item);
                }
            }
            localStorage['cartItems'+ "_items"] = JSON.stringify($rootScope.cartItems);
    };
    
    $scope.clearItems = function () {
        $rootScope.cartItems = [];
        if (localStorage != null && JSON != null) {
            localStorage['cartItems'+ "_items"] = JSON.stringify($rootScope.cartItems);
        }
    }
    
    $scope.clearOrderdedItems = function () {
        $rootScope.orderedItems = [];
        if (localStorage != null && JSON != null) {
            localStorage['cartItems'+ "_cache"] = JSON.stringify($rootScope.orderedItems);
        }
    }
    
    $scope.checkoutPayPal = function () {
        // global data
        var data = {
            cmd: "_cart",
            business: 'samit@gmail.com',
            upload: "1",
            rm: "2",
            charset: "utf-8"
        };
    
        // item data
        for (var i = 0; i < $rootScope.cartItems.length; i++) {
            var item = $rootScope.cartItems[i];
            var ctr = i + 1;
            data["item_number_" + ctr] = item.sku;
            data["item_name_" + ctr] = item.name;
            data["quantity_" + ctr] = item.quantity;
            data["amount_" + ctr] = item.price.toFixed(2);
        }
        data["notify_url"] = 'http://localhost/angular/website/#/products';
        data["return"] = 'http://localhost/angular/website/#/thankyou';
        data["cancel_url"] = 'http://localhost/angular/website/#/products';
        // build form
        var form = jQuery('<form/></form>');
        form.attr("action", "https://www.sandbox.paypal.com/cgi-bin/webscr");
        form.attr("method", "POST");
        form.attr("style", "display:none;");
        this.addFormFields(form, data);
        jQuery("body").append(form);
        // submit form
        localStorage['cartItems'+ "_cache"] = JSON.stringify($rootScope.cartItems);
        this.clearItems();
        form.submit();
        form.remove();
    }
    
    $scope.addFormFields = function (form, data) {
        if (data != null) {
            jQuery.each(data, function (name, value) {
                if (value != null) {
                    var input = $("<input></input>").attr("type", "hidden").attr("name", name).val(value);
                    form.append(input);
                }
            });
        }
    }
    
    $scope.getOrderedItems = function () {
        var items = localStorage != null ? localStorage['cartItems' + "_cache"] : null;
        if (items != null && JSON != null) {
            try {
                var items = JSON.parse(items);
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (item.sku != null && item.name != null && item.price != null && item.quantity != null) {
                        item.quantity = $rootScope.toNumber(item.quantity);                        
                        $rootScope.orderedItems.push(item);
                    }
                }
            }
            catch (err) {
                console.log(err);
            }
        }
    }
    
    $rootScope.getTotalOrderedPrice = function (sku) {
        var total = 0;
        for (var i = 0; i < $rootScope.orderedItems.length; i++) {
            var item = $rootScope.orderedItems[i];
            if (sku == null || item.sku == sku) {
                total += $rootScope.toNumber(item.quantity * item.price);
            }
        }
        return total;
    }
    
    $rootScope.getTotalOrderedCount = function (sku) {
        var count = 0;
        for (var i = 0; i < $rootScope.orderedItems.length; i++) {
            var item = $rootScope.orderedItems[i];
            if (sku == null || item.sku == sku) {
                count += $rootScope.toNumber(item.quantity);
            }
        }
        return count;
    };
});

app.controller('CommonController', function($rootScope, $scope) {
    $rootScope.cartItems = [];
    $rootScope.orderedItems = [];
    $scope.loadItems = function () {
        var items = localStorage != null ? localStorage['cartItems' + "_items"] : null;
        if (items != null && JSON != null) {
            try {
                var items = JSON.parse(items);
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (item.sku != null && item.name != null && item.price != null && item.quantity != null) {
                        item.quantity = $rootScope.toNumber(item.quantity);                        
                        $rootScope.cartItems.push(item);
                    }
                }
            }
            catch (err) {
                console.log(err);
            }
        }
    }
    
    $rootScope.getTotalCount = function (sku) {
        var count = 0;
        
        for (var i = 0; i < $rootScope.cartItems.length; i++) {
            var item = $rootScope.cartItems[i];
            if (sku == null || item.sku == sku) {
                count += $rootScope.toNumber(item.quantity);
            }
        }
        return count;
    };
    
    $rootScope.toNumber = function (value) {
        value = value * 1;
        return isNaN(value) ? 0 : value;
    };
    
    $rootScope.getTotalPrice = function (sku) {
        var total = 0;
        for (var i = 0; i < $rootScope.cartItems.length; i++) {
            var item = $rootScope.cartItems[i];
            if (sku == null || item.sku == sku) {
                total += $rootScope.toNumber(item.quantity * item.price);
            }
        }
        return total;
    }
})

app.controller('PageCtrl', function ($scope, $location, $http){
  console.log("Page Controller reporting for duty.");
  // Activates the Carousel
    jQuery('.carousel').carousel({
        interval: 5000
    });
    // Activates Tooltips for Social Links
    jQuery('.tooltip-social').tooltip({
        selector: "a[data-toggle=tooltip]"
    })
});