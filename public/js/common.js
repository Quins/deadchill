$(document).ready(function() {

	$("[data-calendar]").datepick({ 
		commandsAsDateFormat: true, 
    	prevText: '<', 
    	todayText: 'MM', 
    	nextText: '>'
	});

	$("[data-snowglobe]").snowglobe({

		imagesRoot: "/i/snowglobe/"
	});
});


/* Snowglobe */

(function( $ ) {
	$.fn.snowglobe = function(options) {

		if (!options)
			var options = {};

		return this.each( function() {

			var globe = {

				entity: $(this), 
				width: $(this).width(), 
				height: $(this).height(), 
				ctx: $(this).get(0).getContext('2d'), 
				properties: $.extend({
					imagesRoot: "./i/", 
					snowflakes: 10
				}, options), 
				pictures: {}, 
				ready: {
					background: false, 
					character: false
				}, 
				api: {}
			}

			if (!globe.ctx)
				return false;

			(globe.api.init = function () {

				var required = {
					"frontsnow": 0, 
					"snowglobe": 1
				}, ready = [];

				$.each(required, function(name, position) {

					ready[position] = false;

					globe.pictures[name] = new Image();
					globe.pictures[name].onload = function() {

						ready[position] = true;
						globe.ready.background = AND.apply(null, ready);
						if (globe.ready.background)
							globe.entity.trigger("draw_bg");
					}
					globe.pictures[name].src = globe.properties.imagesRoot + name + ".png";
				});

				function AND() {
					var result = true;
					for (var i =0; i < arguments.length; i++) {
						result = result && arguments[i];
					}
					return result;
				}

				return true;
			})();


			globe.api.character = function(path) {

				if (!globe.pictures.character)
					globe.pictures.character = new Image();

				globe.pictures.character.src = path;

				return true;
			}
			globe.entity.on("draw_character", function(event) { globe.api.character(event.contents.path); });


			globe.api.bg = function() {

				globe.ctx.clearRect(0, 0, globe.width, globe.height);
				globe.ctx.save();
				globe.ctx.drawImage(globe.pictures.snowglobe, 0, 1);
				if (globe.pictures.character)
					globe.ctx.drawImage(globe.pictures.character, 10, 20);
				globe.ctx.drawImage(globe.pictures.frontsnow, 85, 284);
				globe.ctx.restore();
			}
			globe.entity.on("draw_bg", globe.api.bg);

			globe.api.snow = function() {

				globe.snow = [];

				for (var i = 0; i < globe.properties.snowflakes; i++) {
					globe.snow[i] = new Snowflake();
					globe.snow[i].draw();
				};
			}
			globe.entity.on("draw_snow", globe.api.snow);

			function Snowflake() {

				var x = random(120,320), 
					y = random(100,240), 
					size = random(1,5), 
					opacity = Math.random() * 0.7 + 0.3, 
					color = "#fff", 
					xv, 
					yv, 
					zv;

				this.draw = function() {

					globe.ctx.save();
					globe.ctx.fillStyle = color;
					globe.ctx.globalAlpha = opacity;
					globe.ctx.shadowColor = "#fff";
					globe.ctx.shadowBlur = 5;
					globe.ctx.arc(x, y, size, 0, 2*Math.PI);
					globe.ctx.closePath();
					globe.ctx.fill();
					globe.ctx.restore();

					return true;
				}
			}

			function random(min, max) {

				return min + Math.floor(Math.random() * (max - min));
			}
		});
	};
})(jQuery);


/* Unsorted */
function executeFunction(name, context) {
	
	var context = context ? context : window;
	var properties = Array.prototype.slice.call(arguments).splice(2, 100);
	var namespaces = name.split(".");
	var func = namespaces.pop();
	
	for(var i = 0; i < namespaces.length; i++) {
		
		context = context[namespaces[i]];
	}
	
	return context[func].apply(this, properties);
}

function getElementPercentageWidth(element) {
	
	var width = element.width();
	var parentWidth = element.offsetParent().width();
	
	return Math.ceil(100 * (width / parentWidth));
}

function getSubstring(string, substringPattern) {
	
	var searchResults = string.match(substringPattern);
	
	return ((searchResults && searchResults[1]) ? searchResults[1] : "");
}

var identificators = {};

function generateIdentificator() {

	var identificator = '';
	var identificatorLength = 10;
	var charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	var charsetLength = charset.length;

	for (i = 0; identificatorLength > i; i += 1) {
  
		var charIndex = Math.random() * charsetLength;  
		identificator += charset.charAt(charIndex);  
	}
	
	identificator = identificator.toLowerCase();

	if (identificators[identificator])
		return generateIdentificator();

	identificators[identificator] = true;  

	return identificator;
}

var cookiesDomain = "quins.ru";

function createCookie(name, value, days) {

	if (days) {
		
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var expires = "; expires=" + date.toGMTString();

	} else
		var expires = "";
	
	document.cookie = name + "=" + value + expires + "; path=/" + ((cookiesDomain) ? "; domain=" + cookiesDomain : "");
}

function readCookie(name) {
	
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');

	for(var i = 0; i < ca.length; i++) {

		var c = ca[i];
		
		while (c.charAt(0) == ' ')
			c = c.substring(1,c.length);
		
		if (c.indexOf(nameEQ) == 0)
			return c.substring(nameEQ.length,c.length);
	}

	return "";
}

function eraseCookie(name) {

	createCookie(name, "", -1);
}