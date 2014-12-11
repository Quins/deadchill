$(document).ready(function() {

	$("[data-calendar]").datepick({ 
		commandsAsDateFormat: true, 
    	prevText: '<', 
    	todayText: 'MM', 
    	nextText: '>'
	});

	$("[data-snowglobe]").snowglobe({

		imagesRoot: "/i/snowglobe/", 
		preparation: "/i/snowglobe/snowglobe-question.png", 
		character: "/i/figures/gingerbreadMan.png", 
		snowflakes: 100, 
		selectedCharacterClass: "b-prophecy-article-figures-collection-current-clause"
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
					snowflakes: 10, 
					loadProphecy: function(callback) {

						$("[data-snowglobe-prophecy-placeholder]").fadeOut(400, function() {

							$('[data-snowglobe-screen][data-snowglobe-screen-descriptor="shakescreen"]').addClass("b-prophecy-article-figures-result-section");
							$("[data-snowglobe-prophecy-title]").hide().removeClass("g-hidden").fadeIn();
							$("[data-snowglobe-prophecy]").text("Невероятные путешествия, наполненные множеством сладких моментов, борьбой с дикими условиями и романтикой.").hide().removeClass("g-hidden").fadeIn();
							if(callback) callback();
						});
					}
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
					if (ready.background && ready.character && ready.snow) {
						globe.api.animation.static();
						globe.entity.unbind("ready");
					}
				});

				$("[data-snowglobe-character]").click(function(event) {

					event.preventDefault();

					if ($(this).data("snowglobe-character-src") === "")
						return false;

					$("[data-snowglobe-character]").removeClass("b-prophecy-article-figures-collection-current-clause");
					$(this).addClass("b-prophecy-article-figures-collection-current-clause");

					return globe.api.initCharacter($(this).data("snowglobe-character-src"));
				});

				$("[data-snowglobe-action]").click(function(event) {

					event.preventDefault();

					if ($(this).data("snowglobe-action-descriptor") === "")
						return false;
					else if ($(this).data("snowglobe-action-descriptor") === "previous-character") {

						var characters = $("[data-snowglobe-character]");
						var current = characters.index(characters.filter("." + globe.properties.selectedCharacterClass));
						if (current > 0)
							characters.eq(current-1).click();

					} else if ($(this).data("snowglobe-action-descriptor") === "next-character") {

						var characters = $("[data-snowglobe-character]");
						var current = characters.index(characters.filter("." + globe.properties.selectedCharacterClass));
						if (current < $("[data-snowglobe-character]").length - 1)
							$("[data-snowglobe-character]").eq(current+1).click();

					} else if ($(this).data("snowglobe-action-descriptor") === "shakescreen") {

						$("[data-snowglobe-screen]").hide().removeClass("g-hidden");
						$('[data-snowglobe-screen][data-snowglobe-screen-descriptor="shakescreen"]').show();
						$("[data-snowglobe-action][data-snowglobe-action-descriptor='previous-character']").fadeOut();
						$("[data-snowglobe-action][data-snowglobe-action-descriptor='next-character']").fadeOut();
						$("[data-snowglobe-action][data-snowglobe-action-descriptor='shake']").hide().removeClass('g-hidden').fadeIn();

					} else if ($(this).data("snowglobe-action-descriptor") === "shake") {

						globe.api.animation.shake();
						$("[data-snowglobe-action][data-snowglobe-action-descriptor='shake']").fadeOut();
						setTimeout( function() {

							globe.api.animation.snow();
							globe.properties.loadProphecy(function() {

								$("[data-snowglobe-share]").hide().removeClass("g-hidden").fadeIn();
								$('[data-snowglobe-action][data-snowglobe-action-descriptor="character"]').hide().removeClass("g-hidden").fadeIn();
							});
						}, 1500);
					} else if ($(this).data("snowglobe-action-descriptor") === "character") {

						globe.api.animation.static();
						$("[data-snowglobe-screen]").hide().removeClass("g-hidden");

						$('[data-snowglobe-screen][data-snowglobe-screen-descriptor="character"]').show();
						$("[data-snowglobe-action][data-snowglobe-action-descriptor='shake']").fadeOut();
						$("[data-snowglobe-action][data-snowglobe-action-descriptor='previous-character']").fadeIn();
						$("[data-snowglobe-action][data-snowglobe-action-descriptor='next-character']").fadeIn();
					} else if ($(this).data("snowglobe-action-descriptor") === "start") {

						$("[data-snowglobe-screen]").hide().removeClass("g-hidden");

						$('[data-snowglobe-main]').removeClass("g-hidden");
						$('[data-snowglobe-screen][data-snowglobe-screen-descriptor="character"]').show();
					} else if ($(this).data("snowglobe-action-descriptor") === "tab") {

						$("[data-snowglobe-action][data-snowglobe-action-descriptor='tab']").removeClass("b-prophecy-article-pagination-collection-current-clause");
						$(this).addClass("b-prophecy-article-pagination-collection-current-clause");
						$("[data-snowglobe-tab]").addClass("g-hidden").eq(parseInt($(this).data("snowglobe-action-contents")-1)).removeClass("g-hidden");
					}

					return true;
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
				prepare: function() {

					globe.api.animation.stop();
					globe.layers.push({ 

						action: function() {

							globe.ctx.save();
							globe.ctx.drawImage(globe.pictures.snowglobe, 0, 1);
							globe.ctx.restore();
						}, 
						priority: 0, 
						descriptor: "prepare"
					});
					globe.api.hideSnow(0);
				}, 
				snow: function() {

					globe.api.animation.stop();
					globe.api.initSnow();
					globe.api.animation.interval = setInterval(function() {

						globe.api.draw();
					}, 25);
				}, 
				static: function() {

					globe.api.hideSnow(800);
					setTimeout( function() {
						clearInterval(globe.api.animation.interval);
						globe.api.animation.interval = setInterval(function() {

							globe.api.draw();
						}, 25);
					}, 800);
				}, 
				shake: function() {

					var x = new Shake();

					globe.api.animation.stop();
					globe.api.animation.interval = setInterval(function() {

						globe.ctx.translate(x, 0);
						globe.api.draw();
					}, 25);

					function Shake() {

						this._duration = 100;
						this._peak = 20;
						this._safe = 0.4;
						this._current = 0;
						this._started = new Date().getTime();
						this._destination = Math.floor(Math.random() * this._peak * 2 - this._peak);
					}

					Shake.prototype.valueOf = function() {

						var t = (new Date().getTime() - this._started) / this._duration;

						if (t > 1) {

							this._destination = (this._destination > 0 ? - Math.floor(Math.random() * this._peak * (1-this._safe) + this._peak * this._safe) : Math.floor(Math.random() * this._peak * (1-this._safe) + this._peak * this._safe));
							this._started = new Date().getTime();

							return 0;
						} else {

							var n = ((this._destination - this._current) * t * t) / (t * t + (1-t) * (1-t));
							this._current = this._current + n;

							return n;
						}
					};
				}, 
				stop: function() {

					clearInterval(globe.api.animation.interval);
					globe.ctx.setTransform(1, 0, 0, 1, 0, 0);
					globe.api.draw();
				}
			}
			globe.entity.on("snow", globe.api.animation.snow);
			globe.entity.on("shake", globe.api.animation.shake);
			globe.entity.on("stop", globe.api.animation.fade);

			globe.entity.on("layers", function() {

				globe.layers.names();
			});

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
				};

				function action() {
					for (var i = 0; i < globe.properties.snowflakes; i++) {
						globe.snow[i].draw();
					};
				}

				if (!globe.layers.change("snowflakes", action)) {

					globe.layers.push({ 

						action: action,
						priority: 35, 
						descriptor: "snowflakes"
					});
				}
			}


			globe.api.hideSnow = function(time) {

				for (var i = 0; i < globe.properties.snowflakes; i++) {

					if (globe.snow && globe.snow[i])
						globe.snow[i].fade(time);
				};
			}


			function Snowflake() {

				var center, 
					t, 
					duration, 
					size, 
					opacity, 
					color, 
					xv, 
					yv, 
					zv, 
					fade, 
					curve = {}, 
					forcefade = false, 
					fadelength = 2000;

				flake();

				this.draw = function() {

					globe.ctx.save();
					globe.ctx.beginPath();
					globe.ctx.fillStyle = color;
					globe.ctx.globalAlpha = opacity * fade;
					globe.ctx.shadowColor = "#fff";
					globe.ctx.shadowBlur = 5;
					globe.ctx.arc(center.x, center.y, size, 0, 2*Math.PI);
					globe.ctx.fill();
					globe.ctx.closePath();
					globe.ctx.restore();

					reposition();

					return true;
				}

				this.fade = function(time) {

					fadelength = time;
					forcefade = new Date().getTime();
				}

				function flake() {

					center = randominside(); 
					t = new Date().getTime();  
					duration = random(1200, 4000); 
					size = random(1,5); 
					opacity = 0.7 * walldistance(center) / globe.ball.r + 0.1; 
					color = "#fff"; 
					fade = 0;

					curve.step = Math.random() * 0.006 + 0.003;
					curve.origin = {
						x: center.x, 
						y: center.y 
					};
					curve.amplitude = (Math.random() * 0.8 + 0.2) * walldistance(curve.origin);
				}

				function reposition() {

					if (center.y >= globe.ball.ythreshold) {

						flake();
					} else {

						var dt = (new Date().getTime() - t);
						if (!fadeaction(dt)) return false;
						center.y = curve.origin.y + curve.step * dt;
						center.x = curve.origin.x + curve.amplitude * Math.sin(center.y);
						curve.amplitude = Math.min(walldistance(center), curve.amplitude);
					}
				}

				function fadeaction(dt) {

					if (forcefade) {

						var dt = (new Date().getTime() - forcefade);
						if (fade > 0) fade = 1 - dt / fadelength;
						if (fade < 0) fade = 0;

						return (fade === 0 ? false : true);
					} else {

						if (fade < 1) fade = dt / fadelength;
						else if (fade > 1) fade = 1;
						return true;
					}
				}

				function walldistance(center) {

					return Math.min(Math.abs(globe.ball.ythreshold - center.y), Math.abs(Math.sqrt((center.x - globe.ball.x)*(center.x - globe.ball.x) + (center.y - globe.ball.y)*(center.y - globe.ball.y)) - globe.ball.r));
				}

				function randominside() {

					var result = {}, 
						r = 0, 
						angle = Math.random() * 2 * Math.PI + Math.PI * 0.5, 
						top = globe.ball.y - globe.ball.r, 
						y = top + Math.random() * (globe.ball.ythreshold - top), 
						range = Math.sqrt(Math.pow(globe.ball.r, 2) - Math.pow(globe.ball.y - y, 2));
						x = globe.ball.x + range * (Math.random() < 0.5 ? -1 : 1) * Math.sqrt(Math.random());

					if (angle < globe.ball.angle.start || globe.ball.angle.end < angle)
						r = Math.random() * (globe.ball.ythreshold - globe.ball.y) * Math.sin(angle);
					else
						r = Math.random() * globe.ball.r;

					result.x = globe.ball.x + r * Math.cos(angle);
					result.y = globe.ball.y + r * Math.sin(angle);

					result.x = x;
					result.y = y;

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

				this.remove = function( descriptor ) {

					var pos = _descriptors.indexOf(descriptor);

					if (pos < 0)
						return false;
					else {
						_layers.splice(pos, 1);
						_priorities.splice(pos, 1);
						_descriptors.splice(pos, 1);
						return true;
					}
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