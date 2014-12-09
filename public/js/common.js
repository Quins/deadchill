$(document).ready(function() {

	$("[data-calendar]").datepick({ 
		commandsAsDateFormat: true, 
    	prevText: '<', 
    	todayText: 'MM', 
    	nextText: '>'
	});

	$("[data-snowglobe]").snowglobe({

		imagesRoot: "/i/snowglobe/", 
		character: "/i/figures/frog.png"
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
					character: false, 
					snowflakes: 10
				}, options), 
				pictures: {}, 
				layers: new Layers(), 
				api: {}, 
				ball: {

					x: 218, 
					y: 222, 
					r: 166, 
					angle: {

						start: 0.86 * Math.PI, 
						end: 2.14 * Math.PI
					}, 
					ythreshold: 292
				}
			}

			if (!globe.ctx)
				return false;

			(function() {

				var ready = {
					background: false,
					snow: false, 
					character: false
				}

				globe.entity.on("ready", function(e) {

					ready[e.contents] = true;
					if (ready.background && ready.character && ready.snow)
						globe.api.animation.shake();
				});

				return true;
			})();

			(globe.api.init = function () {

				globe.layers = new Layers();

				globe.pictures.snowglobe = new Image();
				globe.pictures.snowglobe.onload = function() {

					globe.layers.push({ 

						action: function() {

							globe.ctx.save();
							globe.ctx.drawImage(globe.pictures.snowglobe, 0, 1);
							globe.ctx.restore();
						}, 
						priority: -1, 
						descriptor: "background"
					});

					globe.entity.trigger($.Event("ready", {contents: "background"}));
				}
				globe.pictures.snowglobe.src = globe.properties.imagesRoot + "snowglobe.png";

				globe.pictures.frontsnow = new Image();
				globe.pictures.frontsnow.onload = function() {

					globe.layers.push({ 

						action: function() {

							globe.ctx.save();
							globe.ctx.drawImage(globe.pictures.frontsnow, 85, 284);
							globe.ctx.restore();
						},
						priority: 50, 
						descriptor: "snow"
					});

					globe.entity.trigger($.Event("ready", {contents: "snow"}));
				}
				globe.pictures.frontsnow.src = globe.properties.imagesRoot + "frontsnow.png";

				return true;
			})();


			(globe.api.initCharacter = function(path) {

				if (!path) {

					globe.entity.trigger($.Event("ready", {contents: "character"}));
					return false;
				}

				globe.pictures.character = new Image();
				globe.pictures.character.onload = function() {

					var action = function() {

						globe.ctx.save();
						globe.ctx.drawImage(globe.pictures.character, globe.ball.x - Math.floor(globe.pictures.character.width/2), globe.ball.ythreshold - globe.pictures.character.height + 10);
						globe.ctx.restore();
					};

					if (!globe.layers.change("character", action)) {

						globe.layers.push({ 

							action: action,
							priority: 25, 
							descriptor: "character"
						});
					}

					globe.entity.trigger($.Event("ready", {contents: "character"}));
				}
				globe.pictures.character.src = path;

				return true;
			})(globe.properties.character);
			globe.entity.on("add", function(event) { if (event.contents.entity === "character") globe.api.initCharacter(event.contents.url); });


			globe.api.clear = function() {

				globe.ctx.clearRect(0, 0, globe.width, globe.height);
			}


			globe.api.draw = function() {

				var layers = globe.layers.list();

				globe.ctx.clearRect(0, 0, globe.width, globe.height);
				for (var i = 0; i < layers.length; i++) {
					layers[i]();
				}

				return true;
			};
			globe.entity.on("draw", globe.api.draw);


			globe.api.animation = {

				interval: false,
				snow: function() {

					globe.api.animation.stop();
					globe.api.animation.interval = setInterval(function() {

						globe.api.draw();
					}, 25);
				}, 
				shake: function() {

					var x = new Shake();

					globe.api.animation.stop();
					globe.api.animation.interval = setInterval(function() {

						globe.ctx.translate(x, 0);
						globe.api.draw();
					}, 25);

					function Shake() {

						this._duration = 800;
						this._start = 0;
						this._started = new Date().getTime();
						this._destination = Math.floor(Math.random() * 10 + 5);
						this._distance = this._destination;
					}

					Shake.prototype.valueOf = function() {

						var t = (new Date().getTime() - this._started) / this._duration;

						if (t > 1) {

							this._start = this._destination;
							this._destination = (this._start > 0 ? - Math.floor(Math.random() * 10 + 5) : Math.floor(Math.random() * 10 + 5));
							this._started = new Date().getTime();
							this._distance = Math.abs(this._start - this._destination);
						}

						t /= this._duration/2;
						if (t < 1) return this._distance/2 * Math.pow( 2, 10 * (t - 1) ) + this._start;
						else return this._distance/2 * ( -Math.pow( 2, -10 * (t - 1)) + 2 ) + this._start;
					};
				}, 
				stop: function() {

					clearInterval(globe.api.animation.interval);
					globe.ctx.setTransform(1, 0, 0, 1, 0, 0);
				}
			}
			globe.entity.on("snow", globe.api.animation.snow);
			globe.entity.on("shake", globe.api.animation.shake);
			globe.entity.on("fade", globe.api.animation.fade);

			globe.api.service = function() {

				globe.ctx.save();
				globe.ctx.beginPath();
				globe.ctx.arc(globe.ball.x, globe.ball.y, globe.ball.r, globe.ball.angle.start, globe.ball.angle.end);
				globe.ctx.stroke();
				globe.ctx.beginPath();
				globe.ctx.moveTo(368, globe.ball.ythreshold);
				globe.ctx.lineTo(67, globe.ball.ythreshold);
				globe.ctx.stroke();
				globe.ctx.closePath();
				globe.ctx.restore();
			}


			globe.api.initSnow = function() {

				globe.snow = [];

				for (var i = 0; i < globe.properties.snowflakes; i++) {
					globe.snow[i] = new Snowflake();
					globe.snow[i].draw();
				};
			}
			globe.entity.on("draw_snow", globe.api.initSnow);


			function Snowflake() {

				var center = randominside(), 
					size = random(1,5), 
					opacity = 0.7 * walldistance(center) / globe.ball.r + 0.1, 
					color = "#fff", 
					xv, 
					yv, 
					zv;

				this.draw = function() {

					globe.ctx.save();
					globe.ctx.beginPath();
					globe.ctx.fillStyle = color;
					globe.ctx.globalAlpha = opacity;
					globe.ctx.shadowColor = "#fff";
					globe.ctx.shadowBlur = 5;
					globe.ctx.arc(center.x, center.y, size, 0, 2*Math.PI);
					globe.ctx.fill();
					globe.ctx.closePath();
					globe.ctx.restore();

					return true;
				}

				function walldistance(center) {

					return Math.min(Math.abs(globe.ball.ythreshold - center.y), Math.abs(Math.sqrt((center.x - globe.ball.x)*(center.x - globe.ball.x) + (center.y - globe.ball.y)*(center.y - globe.ball.y)) - globe.ball.r));
				}

				function randominside() {

					var result = {}, 
						r = 0, 
						angle = Math.random() * 2 * Math.PI + Math.PI * 0.5;

					if (angle < globe.ball.angle.start || globe.ball.angle.end < angle)
						r = Math.random() * (globe.ball.ythreshold - globe.ball.y) * Math.sin(angle);
					else
						r = Math.random() * globe.ball.r;

					result.x = globe.ball.x + r * Math.cos(angle);
					result.y = globe.ball.y + r * Math.sin(angle);

					return result;
				}
			}

			function Layers() {

				var _layers = [], 
					_priorities = [], 
					_descriptors = [];

				this.list = function() {

					return _layers;
				}

				this.push = function( layer ) {

					var pos = 0;

					if (!layer.priority)
						layer.priority = ( _priorities.length ? _priorities[_priorities.length-1]+1 : 0);

					if (!layer.descriptor)
						layer.descriptor = false;

					for (var i = 0; i < _priorities.length; i++) {
						if (_priorities[i] < layer.priority)
							pos++;
					};

					_layers.splice(pos, 0, layer.action);
					_priorities.splice(pos, 0, layer.priority);
					_descriptors.splice(pos, 0, layer.descriptor);

					return true;
				}

				this.change = function( descriptor, action ) {

					var pos = _descriptors.indexOf(descriptor);

					if (pos < 0)
						return false;
					else 
						_layers[pos] = action;
					return true;
				}

				this.names = function() {

					console.log(_descriptors);
				}

				return this;
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