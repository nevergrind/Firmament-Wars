// animate.js
var animate = {
	nationName: function(){
		var tl = new TimelineMax();
		var split = new SplitText(".configureNationName", {
			type: "words,chars"
		});
		var chars = split.chars;
		tl.staggerFromTo(chars, .05, {
			immediateRender: true,
			alpha: 0
		}, {
			delay: .25,
			alpha: 1
		}, .016);
	},
	colors: [
		'#ffffff',
		'#ffaa66',
		'#ffcc99',
		'#ffddaa',
		'#ffff99',
		'#ff5555',
		'#ffff55'
	],
	randomColor: function(){
		return animate.colors[~~(Math.random()*6)];
	},
	getXY: function(tile){
		var box = DOM['unit' + tile].getBBox(),
			o = {
				x: box.x,
				y: box.y
			}
		return o;
	},
	icon: {
		troops: {
			audio: '',
			text: '\uf102',
			color: '#ff0'
		},
		energy: {
			audio: '',
			text: '\uf0e7',
			color: '#ffa'
		},
		food: {
			audio: '',
			text: '\uf179',
			color: '#b5ff00'
		},
		production: {
			audio: '',
			text: '\uf0e3',
			color: '#d60'
		},
		culture: {
			audio: '',
			text: '\uf024',
			color: '#d2d'
		},
		shield: {
			audio: 'build',
			text: '\uf286',
			color: '#ff0'
		}
	},
	upgrade: function(tile, type, count){
		if (animate.icon[type].audio){
			audio.play(animate.icon[type].audio);
		}
		var box = DOM['unit' + tile].getBBox();
		var x = box.x + box.width/2 - 10;
		var y = box.y + box.height/2 + 10;
		// show icon
		var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		text.setAttributeNS(null,"x",x);
		text.setAttributeNS(null,"y",y);
        text.style.fontFamily = 'FontAwesome';
        text.style.fontSize = '20px';
        text.style.fill = animate.icon[type].color;
		if (count){
			text.textContent = '+'+ count + ' '+ animate.icon[type].text;
		} else {
			text.textContent = animate.icon[type].text;
		}
		DOM.mapAnimations.appendChild(text);
		TweenMax.to(text, .5, {
			startAt: {
				xPercent: -50,
				yPercent: -50,
				transformOrigin: '50% 50%',
				alpha: 1,
				scale: .1
			},
			scale: 1,
			ease: Back.easeOut.config(3)
		});
		TweenMax.to(text, 1.5, {
			y: '-=30'
		});
		TweenMax.to(text, .5, {
			delay: 1.5,
			alpha: 0,
			onComplete: function(){
				this.target.parentNode.removeChild(this.target);
			}
		});
		// update bars
		this.updateMapBars(tile);
	},
	updateMapBars: function(tile){
		var box = DOM['unit' + tile].getBBox(),
			x = box.x + box.width/2 - 10,
			y = box.y + box.height/2 + 10;
		$(".mapBars" + tile).remove();
		this.initMapBars(tile, x, y);
		// console.info("UPDATING MAP BARS");
	},
	initMapBars: function(i, x, y){
		var e = DOM['unit' + i],
			x = e.getAttribute('x') - 25,
			y = e.getAttribute('y') - 24,
			boxHeight = 0,
			barHeight = 5,
			barPad = 1,
			widthPerTick = 5,
			widthMax = 40;
		
		if (game.tiles[i].food > 2){
			boxHeight += barHeight + barPad;
		}
		if (game.tiles[i].production > 1){
			boxHeight += barHeight + barPad;
		}
		if (game.tiles[i].culture){
			boxHeight += barHeight + barPad; 
		}
		if (game.tiles[i].defense){
			boxHeight += barHeight + barPad;
		}
		var foodWidth = game.tiles[i].food * widthPerTick;
		if (foodWidth > widthMax){
			foodWidth = widthMax;
		}
		// wrapper
		x += barHeight
		if (boxHeight){
			var svg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			svg.setAttributeNS(null, 'width', widthMax);
			svg.setAttributeNS(null, 'height', boxHeight);
			svg.setAttributeNS(null,"x",x);
			svg.setAttributeNS(null,"y",y + 26);
			svg.setAttributeNS(null,"fill","#151515");
			svg.setAttributeNS(null,"stroke","#000000");
			svg.setAttributeNS(null,"stroke-width",1);
			svg.setAttributeNS(null,"opacity",1);
			svg.setAttributeNS(null,"class","mapBars" + i);
			DOM.mapBars.appendChild(svg);
			// food
			y += 23; // fixed value?
			//x += 1 // padding
			if (game.tiles[i].food > 2){
				y += barHeight + barPad;
				var svg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				svg.setAttributeNS(null,"x1",x);
				svg.setAttributeNS(null,"y1",y);
				svg.setAttributeNS(null,"x2",x + foodWidth);
				svg.setAttributeNS(null,"y2",y);
				svg.setAttributeNS(null,"stroke","#b5ff00");
				svg.setAttributeNS(null,"stroke-width",widthPerTick);
				svg.setAttributeNS(null,"opacity",1);
				svg.setAttributeNS(null,"class","mapBars mapBars" + i);
				DOM.mapBars.appendChild(svg);
			}
			// production
			if (game.tiles[i].production > 1){
				y += barHeight + barPad;
				var productionWidth = game.tiles[i].production * (widthPerTick * 2);
				if (productionWidth > widthMax){
					productionWidth = widthMax;
				}
				var svg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				svg.setAttributeNS(null,"x1",x);
				svg.setAttributeNS(null,"y1",y);
				svg.setAttributeNS(null,"x2",x + productionWidth);
				svg.setAttributeNS(null,"y2",y);
				svg.setAttributeNS(null,"stroke","#55cfff");
				svg.setAttributeNS(null,"stroke-width",widthPerTick);
				svg.setAttributeNS(null,"opacity",1);
				svg.setAttributeNS(null,"class","mapBars mapBars2x mapBars" + i);
				DOM.mapBars.appendChild(svg);
			}
			// culture
			if (game.tiles[i].culture){
				y += barHeight + barPad;
				var cultureWidth = game.tiles[i].culture * widthPerTick;
				if (cultureWidth > widthMax){
					cultureWidth = widthMax;
				}
				var svg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				svg.setAttributeNS(null,"x1",x);
				svg.setAttributeNS(null,"y1",y);
				svg.setAttributeNS(null,"x2",x + cultureWidth);
				svg.setAttributeNS(null,"y2",y);
				svg.setAttributeNS(null,"stroke","#dd22dd");
				svg.setAttributeNS(null,"stroke-width",widthPerTick);
				svg.setAttributeNS(null,"opacity",1);
				svg.setAttributeNS(null,"class","mapBars mapBars" + i);
				DOM.mapBars.appendChild(svg);
			}
			// defense
			if (game.tiles[i].defense){
				y += barHeight + barPad;
				var defWidth = game.tiles[i].defense * (widthPerTick * 2);
				var svg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				svg.setAttributeNS(null,"x1",x);
				svg.setAttributeNS(null,"y1",y);
				svg.setAttributeNS(null,"x2",x + defWidth);
				svg.setAttributeNS(null,"y2",y);
				svg.setAttributeNS(null,"stroke","#ffff00");
				svg.setAttributeNS(null,"stroke-width",barHeight);
				svg.setAttributeNS(null,"opacity",1);
				svg.setAttributeNS(null,"class","mapBars mapBars2x mapBars" + i);
				DOM.mapBars.appendChild(svg);
			}
		}
	},
	gunfire: function(atkTile, defTile, playSound){
		var box1 = DOM['unit' + atkTile].getBBox(),
			box2 = DOM['unit' + defTile].getBBox();
		var sfx = ~~(Math.random()*9);
		var delay = [.6, .6, .43, .43, .43, .43, .9, .43, .76, .43];
		if (playSound){
			//console.info(delay, sfx)
			audio.play('machine' + sfx);
		}
		var shots = 30,
			w1 = 50,
			h1 = 50,
			w2 = w1/2,
			h2 = h1/2 - 10;
		if (!isMSIE && !isMSIE11 && !isMobile){
			for (var i=0; i<shots; i++){
				(function(){
					var path = document.createElementNS("http://www.w3.org/2000/svg","path"),
						x2 = box2.x + (Math.random() * w1) - w2;
						y2 = box2.y + (Math.random() * h1) - h2;
					var x1 = box1.x + ~~(Math.random()*16)-8,
						y1 = box1.y + ~~(Math.random()*16)-8;
					var drawPath = Math.random() > .5 ? 
						"M "+ x1 +","+ y1 + ' '+ x2 +","+ y2 :
						"M "+ x2 +","+ y2 +' ' + x1 +","+ y1
					path.setAttributeNS(null,"stroke",animate.randomColor());
					path.setAttributeNS(null,"stroke-width",1);
					DOM.world.appendChild(path);
					TweenMax.to(path, .075, {
						delay: (i / shots) * delay[sfx],
						startAt: {
							attr: {
								d: drawPath
							},
							drawSVG: '0%'
						},
						drawSVG: '0% 100%',
						ease: Power2.easeIn,
						onComplete: function(){
							TweenMax.to(path, .125, {
								drawSVG: '100% 100%',
								ease: Power2.easeOut,
								onComplete: function(){
									this.target.parentNode.removeChild(this.target);
								}
							});
						}
					});
				})();
			}
		}
	},
	cannons: function(atkTile, defTile, playSound, delay, delay2){
		var box1 = DOM['unit' + atkTile].getBBox(),
			box2 = DOM['land' + defTile].getBBox(),
			box3 = DOM['unit' + defTile].getBBox()
			delay = delay === undefined ? .08 : delay;
		if (game.tiles[atkTile].player === my.player){
			var a = [5, 6, 8];
			var sfx = ~~(Math.random() * 3);
			playSound && audio.play('grenade' + a[sfx]);
		}
		var x1 = box1.x + box1.width * .5;
			y1 = box1.y + box1.height * .5,
			w1 = box2.width * .5,
			w2 = w1/2,
			h1 = box2.height * .5,
			h2 = h1/2 - 10;
		for (var i=0; i<20; i++){
			(function(Math){
				var circ = document.createElementNS("http://www.w3.org/2000/svg","circle"),
					x2 = box3.x + (Math.random() * w1) - w2,
					y2 = box3.y + (Math.random() * h1) - h2;
				circ.setAttributeNS(null,"cx",x1);
				circ.setAttributeNS(null,"cy",y1);
				circ.setAttributeNS(null,"r",4);
				circ.setAttributeNS(null,"fill",g.color[game.player[game.tiles[atkTile].player].playerColor]);
				circ.setAttributeNS(null,"stroke",animate.randomColor());
				circ.setAttributeNS(null,"strokeWidth",1);
				DOM.mapAnimations.appendChild(circ);
				
				TweenMax.to(circ, delay, {
					delay: i * .0125,
					startAt: {
						alpha: 1
					},
					attr: {
						cx: x2,
						cy: y2
					},
					ease: Linear.easeNone,
					onComplete: function(){
						// explode outward
						var d1 = Math.random()*.5 + .3,
							d2 = delay2 === undefined ? d1/2 : delay2,
							s1 = (d1 * 10) + 3;
						TweenMax.to(circ, d2, {
							startAt: {
								fill: 'none',
								strokeWidth: 0,
								attr: {
									r: 0
								}
							},
							strokeWidth: s1,
							attr: {
								r: s1/2
							},
							ease: Linear.easeNone,
							onComplete: function(){
							// explode fades from inner
								TweenMax.to(circ, d2, {
									attr: {
										r: s1
									},
									strokeWidth: 0,
									ease: Sine.easeOut
								});
								TweenMax.to(circ, d2, {
									alpha: 0,
									onComplete: function(){
										this.target.parentNode.removeChild(this.target);
									},
									ease: Sine.easeOut
								});
							}
						});
					}
				});
			})(Math);
		}
		animate.smoke(defTile, box3.x, box3.y, .8);
	},
	missile: function(attacker, defender, playSound){
		if (playSound){
			audio.play('missile7');
		}
		var e2 = DOM['unit' + attacker],
			boxA = e2.getBBox(),
			x1 = boxA.x + boxA.width/2,
			y1 = boxA.y + boxA.height/2,
			e3 = DOM['unit' + defender],
			boxB = e3.getBBox(),
			x2 = boxB.x + boxB.width/2,
			y2 = boxB.y + boxB.height/2;
			
		// get missile line coordinates
		my.motionPath[0] = e2.getAttribute('x')*1 - 10;
		my.motionPath[1] = e2.getAttribute('y')*1 - 10;
		my.motionPath[4] = e3.getAttribute('x')*1 - 10;
		my.motionPath[5] = e3.getAttribute('y')*1 - 10;
		my.motionPath[2] = (my.motionPath[0] + my.motionPath[4]) / 2;
		my.motionPath[3] = ((my.motionPath[1] + my.motionPath[5]) / 2) - (Math.abs(x1-x2)/3);
		TweenMax.set(DOM.motionPath, {
			attr: {
				d: "M " + my.motionPath[0] +","+ my.motionPath[1] + ' ' +
					+ my.motionPath[4] +" "+ my.motionPath[5]
			}
		});
		var mis = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		mis.setAttributeNS(null, "cx", x1);
		mis.setAttributeNS(null, "cy", y1);
		mis.setAttributeNS(null, "r", 12);
		mis.setAttributeNS(null,"fill",g.color[game.player[game.tiles[attacker].player].playerColor]);
		mis.setAttributeNS(null,"stroke","#ffddaa");
		mis.setAttributeNS(null,"stroke-width",2);
		DOM.mapAnimations.appendChild(mis);
		var count = 0;
		TweenMax.to(mis, .1, {
			attr: {
				r: 3
			},
			repeat: -1
		});
		TweenMax.to(mis, 1, {
			startAt: {
				alpha: 1,
				xPercent: -50,
				yPercent: -50
			},
			attr: {
				cx: x2,
				cy: y2
			},
			ease: Power2.easeIn,
			onUpdate: function(){
				count++;
				if (count % 2 === 0){
					// smoke trail
					var svg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
					svg.setAttributeNS(null, 'height', 40);
					svg.setAttributeNS(null, 'width', 40);
					svg.setAttributeNS(null, 'opacity', 1);
					svg.setAttributeNS(null, "x", mis.getAttribute('cx')-10);
					svg.setAttributeNS(null, "y", mis.getAttribute('cy')-10);
					svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'images/smoke.png');
					DOM.mapAnimations.appendChild(svg);
					TweenMax.to(svg, .3, {
						startAt: {
							xPercent: -50,
							yPercent: -50,
							transformOrigin: '50% 50%'
						},
						scale: 3,
						onComplete: function(){
							this.target.parentNode.removeChild(this.target);
						}
					});
					TweenMax.to(svg, .5, {
						alpha: 0
					});
				}
			},
			onComplete: function(){
				this.target.parentNode.removeChild(this.target);
				animate.missileExplosion(defender, g.color[game.player[game.tiles[attacker].player].playerColor]);
			}
		});
		/*
		var path = MorphSVGPlugin.pathDataToBezier('#motionPath', {
			align: 'relative'
		});
			bezier: {
				values: path,
				type: 'cubic',
				curviness: 1.5,
				autoRotate: true
			},
		*/
	},
	missileExplosion: function(tile, misColor){
		var box = DOM['unit' + tile].getBBox(),
			a = [5, 6, 8],
			sfx = ~~(Math.random() * 3);
		audio.play('grenade' + a[sfx]);
		var x = 0,
			y = 0;
		for (var i=0; i<5; i++){
			(function(Math){
				var circ = document.createElementNS("http://www.w3.org/2000/svg","circle");
				x = box.x + Math.random() * 60 - 30;
				y = box.y + Math.random() * 60 - 30;
				circ.setAttributeNS(null,"cx",x);
				circ.setAttributeNS(null,"cy",y);
				circ.setAttributeNS(null,"r",0);
				circ.setAttributeNS(null,"fill",misColor);
				circ.setAttributeNS(null,"stroke",'#ffffaa');
				DOM.mapAnimations.appendChild(circ);
				
				var delay = i * .05;
				TweenMax.to(circ, .75, {
					delay: delay,
					attr: {
						r: 32
					},
					onComplete: function(){
						TweenMax.to(circ, 1, {
							attr: {
								r: 1
							},
							ease: Power1.easeIn,
							onComplete: function(){
								this.target.parentNode.removeChild(this.target);
							},
						});
					},
					ease: Power4.easeOut
				});
				TweenMax.to(circ, .1, {
					fill: "hsl(+=0%, +=0%, +="+ ~~(Math.random()*100) +"%)",
					repeat: -1
				});
				TweenMax.to(circ, 1.75, {
					startAt:{
						alpha: 1
					},
					alpha: 0,
					ease: Power2.easeIn
				});
			})(Math);
		}
		animate.smoke(tile, x, y, 1);
	},
	nuke: function(tile, attacker){
		var box = DOM['unit' + tile].getBBox();
		var x = box.x;
		var y = box.y;
		// bomb shadow
		shadow = document.createElementNS("http://www.w3.org/2000/svg","ellipse");
		shadow.setAttributeNS(null,"cx",x);
		shadow.setAttributeNS(null,"cy",y);
		shadow.setAttributeNS(null,"rx",2);
		shadow.setAttributeNS(null,"ry",1);
		shadow.setAttributeNS(null,"fill",'#000000');
		shadow.setAttributeNS(null,"stroke",'none');
		DOM.mapAnimations.appendChild(shadow);
		TweenMax.to(shadow, 1, {
			startAt: {
				opacity: .5
			},
			attr: {
				rx: 10,
				ry: 5
			},
			ease: Power1.easeIn,
			onComplete: function(){
				this.target.parentNode.removeChild(this.target);
			}
		});
		// drop bomb svg
		var bomb = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		bomb.setAttributeNS(null, "cx", x);
		bomb.setAttributeNS(null, "cy", y - window.innerHeight);
		bomb.setAttributeNS(null, "r", 15);
		bomb.setAttributeNS(null,"fill",g.color[game.player[attacker].playerColor]);
		bomb.setAttributeNS(null,"stroke","#ffddaa");
		bomb.setAttributeNS(null,"stroke-width",2);
		DOM.mapAnimations.appendChild(bomb);
		var count = 0;
		TweenMax.to(bomb, .1, {
			attr: {
				r: 3
			},
			ease: Linear.easeIn,
			repeat: -1
		});
		TweenMax.to(bomb, 1, {
			startAt: {
				alpha: 1,
			},
			attr: {
				cy: y
			},
			ease: Power1.easeIn,
			onComplete: function(){
				this.target.parentNode.removeChild(bomb);
			}
		});
		// start bomb explosion sequence
		TweenMax.to(g, 1, {
			onComplete: function(){
				audio.play('bomb9');
				TweenMax.to(DOM.screenFlash, .05, {
					startAt: {
						opacity: .7,
						background: '#ffffff'
					},
					opacity: 0,
					background: '#ff8800',
					ease: Expo.easeOut
				});
				// shake
				// animate.screenShake(16, 10, .016, true);
				var circ = document.createElementNS("http://www.w3.org/2000/svg","circle");
				circ.setAttributeNS(null,"cx",x);
				circ.setAttributeNS(null,"cy",y);
				circ.setAttributeNS(null,"r",1);
				circ.setAttributeNS(null,"fill",g.color[game.player[attacker].playerColor]);
				circ.setAttributeNS(null,"stroke",'#ffdd88');
				DOM.mapAnimations.appendChild(circ);
				
				TweenMax.to(circ, 1.5, {
					startAt: {
						alpha: 1
					},
					attr: {
						r: 80
					},
					onComplete: function(){
						TweenMax.to(circ, 1, {
							attr: {
								r: 50
							},
							ease: Power1.easeIn
						});
					},
					ease: Power3.easeOut
				});
				TweenMax.to(circ, .05, {
					fill: "hsl(+=0%, +=0%, +=20%)",
					repeat: -1,
					yoyo: true,
					ease: SteppedEase.config(6)
				});
				TweenMax.to(circ, 2.5, {
					alpha: 0,
					ease: Power4.easeIn,
					onComplete: function(){
						this.target.parentNode.removeChild(this.target);
					}
				});
				
				animate.smoke(tile, x, y);
				animate.smoke(tile, x, y);
				animate.smoke(tile, x, y);
				animate.smoke(tile, x, y);
			}
		});
	},
	logo: function(linear){
		resizeWindow();
	},
	smoke: function(tile, x, y, scale){
		if (x === undefined){
			var o = animate.getXY(tile);
			x = o.x;
			y = o.y;
		}
		if (scale === undefined){
			scale = 1.25;
		}
		var smoke = document.createElementNS("http://www.w3.org/2000/svg","image");
		smoke.setAttributeNS(null,"width",256);
		smoke.setAttributeNS(null,"height",256);
		smoke.setAttributeNS(null,"x",x);
		smoke.setAttributeNS(null,"y",y);
		smoke.setAttributeNS(null,"opacity",0);
		smoke.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","images/smoke.png");
		DOM.mapUpgrades.appendChild(smoke);
		TweenMax.to(smoke, 3, {
			startAt: {
				alpha: 1,
				transformOrigin: '50% 50%',
				xPercent: -50,
				yPercent: -50,
				scale: 0
			},
			ease: Power4.easeOut,
			scale: scale
		});
		TweenMax.to(smoke, 3, {
			alpha: 0,
			onComplete: function(){
				this.target.parentNode.removeChild(this.target);
			}
		});
		
	},
	screenShake: function(count, d, interval, fade){
		// number of shakes, distance of shaking, interval of shakes
		var foo = 0;
		(function doit(count, d, interval, e, M){
			var d2 = d/2;
			if (fade){
				if (foo % 2 === 0){
					d--;
					if (d < 2){
						d = 2;
					}
				}
			}
			TweenMax.to(e, interval, {
				x: ~~(M.random()*(d)-d2),
				y: ~~(M.random()*(d)-d2),
				onComplete:function(){
					TweenMax.to(e, interval, {
						x: ~~(M.random()*(d)-d2),
						y: ~~(M.random()*(d)-d2),
						onComplete:function(){
							TweenMax.to(e, interval, {
								x: ~~(M.random()*(d)-d2),
								y: ~~(M.random()*(d)-d2),
								onComplete:function(){
									TweenMax.to(e, interval,{
										x: 0,
										y: 0,
										onComplete: function(){
											foo++;
											if(foo < count){ 
												doit(count, d, interval, e, M); 
											}
										}
									});
								}
							});
						}
					});
				}
			});
		})(count, d, interval, DOM.gameWrap, Math);
	},
	selectTile: function(oldTgt, newTgt){
		TweenMax.set(DOM['land' + oldTgt], {
			fill: g.color[game.player[game.tiles[oldTgt].player].playerColor],
			stroke: game.tiles[oldTgt].player ? g.color[game.player[game.tiles[oldTgt].player].playerColor] : '#aaa',
			strokeDasharray: 'none',
			strokeDashoffset: 0,
			strokeWidth: 1,
			onComplete: function(){
				if (game.tiles[oldTgt].player){
					TweenMax.set(this.target, {
						strokeWidth: 1,
						stroke: "hsl(+=0%, +=0%, -=30%)"
					});
				}
			}
		});
		// move to top
		var x = DOM['land' + newTgt].cloneNode(true);
		DOM.landWrap.appendChild(x);
		DOM['land' + newTgt].parentNode.removeChild(DOM['land' + newTgt]);
		// cache
		DOM['land' + newTgt] = document.getElementById('land' + newTgt);
		
		var newStroke = g.color[game.player[!game.tiles[newTgt].player ? 
			my.player : game.tiles[newTgt].player].playerColor];
		var newFill = g.color[game.player[!game.tiles[newTgt].player ? 
			0 : game.tiles[newTgt].player].playerColor];
		TweenMax.set(DOM['land'+ newTgt], {
			fill: newFill,
			stroke: newStroke,
			onComplete: function(){
				TweenMax.set(this.target, {
					stroke: "hsl(+=0%, +=0%, +=15)"
				});
			}
		});
		TweenMax.to(DOM['land' + newTgt], .4, {
			startAt: {
				strokeDasharray: '5,5',
				strokeWidth: 3,
				strokeDashoffset: 0
			},
			strokeDashoffset: 10,
			repeat: -1,
			ease: Linear.easeNone
		});
	},
	energyBar: function(){
		TweenMax.to(DOM.energyIndicator, g.speed, {
			startAt: {
				x: -5
			},
			x: 150,
			ease: Linear.easeNone
		});
		TweenMax.to(DOM.currentYearBG, 2, {
			startAt: {
				alpha: 1
			},
			alpha: 0
		});
	}
}