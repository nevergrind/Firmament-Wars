// animate.js
var animate = {
	nationName: function(){
		var tl = new TimelineMax();
		var split = new SplitText("#nationName", {
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
	randomColor: function(){
		var x = ~~(Math.random()*6),
			c = '#ffffff';
		if (x === 0){
			c = '#ffffaa';
		} else if (x === 1){
			c = '#ffddaa';
		} else if (x === 2){
			c = '#ffeedd';
		} else if (x === 3){
			c = '#eeeecc';
		} else if (x === 4){
			c = '#ffbb77';
		}
		return c;
	},
	getXY: function(tile){
		var e2 = document.getElementById('unit' + tile),
			box = e2.getBBox(),
			o = {
				x: box.x,
				y: box.y
			}
		return o;
	},
	upgrade: function(tile){
		audio.play('build');
		var e1 = document.getElementById('unit' + tile),
			box = e1.getBBox();
		var x = box.x + box.width/2 - 10;
		var y = box.y + box.height/2 + 10;
		// smoke
		var size = game.tiles[tile].defense - game.tiles[tile].capital ? 1 : 0;
		for (var i=1; i<=(3 + (size*3)); i++){
			var svg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
			svg.setAttributeNS(null, 'height', 256);
			svg.setAttributeNS(null, 'width', 256);
			svg.setAttributeNS(null,"x",x);
			svg.setAttributeNS(null,"y",y);
			svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'images/goldSmoke.png');
			DOM.mapAnimations.appendChild(svg);
			TweenMax.to(svg, .5, {
				startAt: {
					xPercent: -50,
					yPercent: -50,
					transformOrigin: '50% 50%',
					opacity: 1,
					scale: 0
				},
				scale: i*.1,
				opacity: 0,
				onComplete: function(){
					this.target.parentNode.removeChild(this.target);
				}
			});
		}
		// show shield
		var shield = document.createElementNS("http://www.w3.org/2000/svg","image");
		shield.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","images/bulwark.png");
		shield.setAttributeNS(null,"width",28);
		shield.setAttributeNS(null,"height",32);
		shield.setAttributeNS(null,"x",x);
		shield.setAttributeNS(null,"y",y);
		DOM.mapAnimations.appendChild(shield);
		TweenMax.to(shield, .5, {
			startAt: {
				xPercent: -50,
				yPercent: -50,
				transformOrigin: '50% 50%',
				opacity: 1,
				scale: .1
			},
			scale: 1,
			ease: Back.easeOut.config(3)
		});
		TweenMax.to(shield, 1.5, {
			y: '-=30'
		});
		TweenMax.to(shield, .5, {
			delay: 1.5,
			opacity: 0,
			onComplete: function(){
				this.target.parentNode.removeChild(this.target);
			}
		});
		// update bars
		this.updateMapBars(tile);
	},
	updateMapBars: function(tile){
		var e1 = document.getElementById('unit' + tile),
			box = e1.getBBox(),
			x = box.x + box.width/2 - 10,
			y = box.y + box.height/2 + 10;
		$(".mapBars" + tile).remove();
		this.initMapBars(tile, x, y);
		// console.info("UPDATING MAP BARS");
	},
	initMapBars: function(i, x, y){
		var e = document.getElementById('unit' + i);
		var x = e.getAttribute('x') - 24;
		var y = e.getAttribute('y') - 24;
		
		var boxHeight = 6;
		if (game.tiles[i].culture){
			boxHeight += 4;
		}
		if (game.tiles[i].defense){
			boxHeight += 4;
		}
		var boxOpacity = game.tiles[i].player ? 1 : 0;
		var foodWidth = game.tiles[i].food * 3;
		if (foodWidth > 24){
			foodWidth = 24;
		}
		// wrapper
		x += 4
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		svg.setAttributeNS(null, 'width', 26);
		svg.setAttributeNS(null, 'height', boxHeight);
		svg.setAttributeNS(null,"x",x);
		svg.setAttributeNS(null,"y",y + 26);
		svg.setAttributeNS(null,"fill","#2a2a2a");
		svg.setAttributeNS(null,"stroke","#000000");
		svg.setAttributeNS(null,"opacity",boxOpacity);
		svg.setAttributeNS(null,"class","mapBars" + i);
		DOM.mapBars.appendChild(svg);
		// food
		y += 29;
		x += 1
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
		svg.setAttributeNS(null,"x1",x);
		svg.setAttributeNS(null,"y1",y);
		svg.setAttributeNS(null,"x2",x + foodWidth);
		svg.setAttributeNS(null,"y2",y);
		svg.setAttributeNS(null,"stroke","#88dd00");
		svg.setAttributeNS(null,"stroke-width","3");
		svg.setAttributeNS(null,"opacity",boxOpacity);
		svg.setAttributeNS(null,"class","mapBars mapBars" + i);
		DOM.mapBars.appendChild(svg);
		// culture
		if (game.tiles[i].culture){
			y += 4;
			var cultureWidth = game.tiles[i].culture * 3;
			if (cultureWidth > 24){
				cultureWidth = 24;
			}
			var svg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			svg.setAttributeNS(null,"x1",x);
			svg.setAttributeNS(null,"y1",y);
			svg.setAttributeNS(null,"x2",x + cultureWidth);
			svg.setAttributeNS(null,"y2",y);
			svg.setAttributeNS(null,"stroke","#dd22dd");
			svg.setAttributeNS(null,"stroke-width","3");
			svg.setAttributeNS(null,"opacity",boxOpacity);
			svg.setAttributeNS(null,"class","mapBars mapBars" + i);
			DOM.mapBars.appendChild(svg);
		}
		// defense
		if (game.tiles[i].defense){
			y += 4;
			var defWidth = game.tiles[i].defense * 6;
			var svg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			svg.setAttributeNS(null,"x1",x);
			svg.setAttributeNS(null,"y1",y);
			svg.setAttributeNS(null,"x2",x + defWidth);
			svg.setAttributeNS(null,"y2",y);
			svg.setAttributeNS(null,"stroke","#ffff00");
			svg.setAttributeNS(null,"stroke-width","3");
			svg.setAttributeNS(null,"opacity",boxOpacity);
			svg.setAttributeNS(null,"class","mapBars mapBars" + i);
			DOM.mapBars.appendChild(svg);
		}
	},
	gunfire: function(tile, playSound){
		var e1 = document.getElementById('land' + tile),
			box = e1.getBBox();
		var sfx = ~~(Math.random()*9);
		var delay = [.5, .5, .33, .33, .33, .33, .8, .33, .66, .4];
		if (playSound){
			audio.play('machine' + sfx);
		}
		var x = 0,
			y = 0;
		for (var i=0; i<50; i++){
			(function(Math){
				var circ = document.createElementNS("http://www.w3.org/2000/svg","circle");
				x = box.x + (Math.random() * (box.width * .8)) + box.width * .1;
				y = box.y + (Math.random() * (box.height * .8)) + box.height * .1;
				circ.setAttributeNS(null,"cx",x);
				circ.setAttributeNS(null,"cy",y);
				circ.setAttributeNS(null,"r",6);
				circ.setAttributeNS(null,"fill",animate.randomColor());
				circ.setAttributeNS(null,"stroke",'#000');
				DOM.world.appendChild(circ);
				
				TweenMax.to(circ, .125, {
					delay: Math.random() * delay[sfx],
					startAt:{
						opacity: 1
					},
					attr: {
						r: 0,
					},
					onComplete: function(){
						this.target.parentNode.removeChild(this.target);
					}
				});
			})(Math);
		}
		animate.smoke(tile, x, y, .5);
	},
	cannons: function(tile, playSound){
		var e1 = document.getElementById('land' + tile),
			box = e1.getBBox();
		if (playSound){
			var a = [5, 6, 8];
			var sfx = ~~(Math.random() * 3);
			audio.play('grenade' + a[sfx]);
		}
		var x = 0,
			y = 0;
		for (var i=0; i<20; i++){
			(function(Math){
				var circ = document.createElementNS("http://www.w3.org/2000/svg","circle");
				x = box.x + (Math.random() * (box.width * .8)) + box.width * .1;
				y = box.y + (Math.random() * (box.height * .8)) + box.height * .1;
				circ.setAttributeNS(null,"cx",x);
				circ.setAttributeNS(null,"cy",y);
				circ.setAttributeNS(null,"r",16);
				circ.setAttributeNS(null,"fill",'#ffff55');
				circ.setAttributeNS(null,"stroke","#ffff55");
				DOM.mapAnimations.appendChild(circ);
				
				var delay = i * .015;
				TweenMax.to(circ, .3, {
					delay: delay,
					attr: {
						r: 4
					},
					onUpdate: function(){
						TweenMax.set(circ, {
							fill: animate.randomColor()
						});
					},
					onComplete: function(){
						this.target.parentNode.removeChild(this.target);
					}
				});
				TweenMax.to(circ, .3, {
					delay: delay,
					startAt:{
						opacity: 1
					},
					opacity: 0
				});
			})(Math);
		}
		animate.smoke(tile, x, y, .7);
	},
	missile: function(attacker, defender, playSound){
		if (playSound){
			audio.play('missile7');
		}
		var e2 = document.getElementById('unit' + attacker),
			boxA = e2.getBBox(),
			x1 = boxA.x + boxA.width/2,
			y1 = boxA.y + boxA.height/2,
			e3 = document.getElementById('unit' + defender),
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
			ease: Circ.easeIn,
			attr: {
				d: "M " + my.motionPath[0] +","+ my.motionPath[1] + ' ' +
					+ my.motionPath[4] +" "+ my.motionPath[5]
			}
		});
		var path = MorphSVGPlugin.pathDataToBezier('#motionPath', {
			align: 'relative'
		});
		// create missile 591 93
		var mis = document.createElementNS("http://www.w3.org/2000/svg", "image");
		mis.setAttributeNS(null,"width",30);
		mis.setAttributeNS(null,"height",5);
		mis.setAttributeNS(null,"x",x1);
		mis.setAttributeNS(null,"y",y1);
		mis.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "images/missile.png");
		DOM.mapAnimations.appendChild(mis);
		
		var count = 0;
		TweenMax.to(mis, 1.5, {
			startAt: {
				opacity: 1,
				xPercent: -50,
				yPercent: -50
			},
			bezier: {
				values: path,
				type: 'cubic',
				curviness: 1.5,
				autoRotate: true
			},
			ease: Power2.easeIn,
			onUpdate: function(){
				count++;
				if (count % 5 === 0){
					var x = x1 + mis._gsTransform.x;
					var y = y1 + mis._gsTransform.y;
					var svg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
					svg.setAttributeNS(null, 'height', 40);
					svg.setAttributeNS(null, 'width', 40);
					svg.setAttributeNS(null,"x",x);
					svg.setAttributeNS(null,"y",y);
					svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'images/smoke.png');
					DOM.mapAnimations.appendChild(svg);
					TweenMax.to(svg, .5, {
						startAt: {
							xPercent: -50,
							yPercent: -50,
							transformOrigin: '50% 50%',
							opacity: 0
						},
						opacity: 1,
						scale: 1.5,
						ease: Power3.easeOut,
						onComplete: function(){
							TweenMax.to(this.target, .5, {
								opacity: 0,
								scale: 2,
								ease: Linear.easeNone,
								onComplete: function(){
									this.target.parentNode.removeChild(this.target);
								}
							});
						}
					});
				}
			},
			onComplete: function(){
				this.target.parentNode.removeChild(this.target);
				animate.missileExplosion(defender);
			}
		});
	},
	missileExplosion: function(tile){
		var e1 = document.getElementById('unit' + tile),
			box = e1.getBBox(),
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
				circ.setAttributeNS(null,"fill",animate.randomColor());
				circ.setAttributeNS(null,"stroke",'#ffffaa');
				DOM.mapAnimations.appendChild(circ);
				
				var delay = i * .05;
				TweenMax.to(circ, .75, {
					delay: delay,
					attr: {
						r: 32
					},
					onComplete: function(){
						TweenMax.to(circ, .5, {
							attr: {
								r: 16
							},
							ease: Power1.easeIn,
							onComplete: function(){
								this.target.parentNode.removeChild(this.target);
							},
						});
					},
					ease: Power4.easeOut
				});
				TweenMax.to(circ, 1.25, {
					startAt:{
						opacity: 1
					},
					opacity: 0,
					onUpdate: function(){
						TweenMax.set(circ, {
							fill: animate.randomColor()
						});
					},
					ease: Power2.easeIn
				});
			})(Math);
		}
		animate.smoke(tile, x, y, 1);
	},
	nuke: function(tile){
		var e2 = document.getElementById('unit' + tile),
			box = e2.getBBox();
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
		var bomb = document.createElementNS("http://www.w3.org/2000/svg","image");
		bomb.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","images/nuke.png");
		bomb.setAttributeNS(null,"width",16);
		bomb.setAttributeNS(null,"height",12);
		bomb.setAttributeNS(null,"x",x-6);
		bomb.setAttributeNS(null,"y",y - g.screen.height);
		DOM.mapAnimations.appendChild(bomb);
		TweenMax.to(bomb, 1, {
			attr: {
				y: y
			},
			ease: Power1.easeIn,
			onComplete: function(){
				this.target.parentNode.removeChild(this.target);
			}
		});
		new Image('images/smoke.png');
		// start bomb explosion sequence
		TweenMax.to(g, 1, {
			onComplete: function(){
				audio.play('bomb9');
				TweenMax.to(DOM.screenFlash, .1, {
					startAt: {
						opacity: 1,
						background: '#ffffff'
					},
					opacity: 0,
					background: '#ff8800',
					ease: Expo.easeOut
				});
				// shake
				animate.screenShake(16, 10, .016, true);
				var circ = document.createElementNS("http://www.w3.org/2000/svg","circle");
				circ.setAttributeNS(null,"cx",x);
				circ.setAttributeNS(null,"cy",y);
				circ.setAttributeNS(null,"r",1);
				circ.setAttributeNS(null,"fill",'#ffaa00');
				circ.setAttributeNS(null,"stroke",'#ffffaa');
				DOM.mapAnimations.appendChild(circ);
				TweenMax.to(circ, 1.5, {
					startAt: {
						opacity: 1
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
				TweenMax.to(circ, 2.5, {
					onUpdate: function(){
						TweenMax.set(circ, {
							fill: animate.randomColor()
						});
					}
				});
				TweenMax.to(circ, 2.5, {
					opacity: 0,
					ease: Power4.easeIn,
					onComplete: function(){
						this.target.parentNode.removeChild(this.target);
					}
				});
				animate.smoke(tile, x, y);
			}
		});
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
				opacity: 1,
				transformOrigin: '50% 50%',
				xPercent: -50,
				yPercent: -50,
				scale: 0
			}, 
			ease: Power4.easeOut,
			scale: scale
		});
		TweenMax.to(smoke, 3, {
			opacity: 0,
			onComplete: function(){
				this.target.parentNode.removeChild(this.target);
			}
		});
		
	},
	screenShake: function(count, d, interval, fade){
		// number of shakes, distance of shaking, interval of shakes
		var foo=0;
		var M = Math;
		(function doit(count,d,interval){
			var d2 = d/2;
			if (fade){
				if (foo % 2 === 0){
					d--;
					if (d < 2){
						d = 2;
					}
				}
			}
			TweenMax.to(DOM.world, interval, {
				x: ~~(M.random()*(d)-d2),
				y: ~~(M.random()*(d)-d2),
				onComplete:function(){
					TweenMax.to(DOM.world, interval, {
						x: ~~(M.random()*(d)-d2),
						y: ~~(M.random()*(d)-d2),
						onComplete:function(){
							TweenMax.to(DOM.world, interval, {
								x: ~~(M.random()*(d)-d2),
								y: ~~(M.random()*(d)-d2),
								onComplete:function(){
									TweenMax.to(DOM.world, interval,{
										x: 0,
										y: 0,
										onComplete: function(){
											foo++;
											if(foo < count){ 
												doit(count,d,interval); 
											}
										}
									});
								}
							});
						}
					});
				}
			});
		})(count,d,interval);
	},
	water: function(){
		var delay = 130,
			e1 = document.getElementById('worldWater1'),
			e2 = document.getElementById('worldWater2'),
			e3 = document.getElementById('worldWater3'),
			e4 = document.getElementById('worldWater4');
		// animate water
		// up left
		TweenMax.to(e1, delay, {
			backgroundPosition: '-800px -800px',
			repeat: -1,
			ease: Linear.easeNone
		});
		// down right
		TweenMax.to(e2, delay, {
			startAt: {
				backgroundPosition: '400px 300px'
			},
			backgroundPosition: '1200px 1100px', 
			repeat: -1,
			ease: Linear.easeNone
		});
		// down left
		TweenMax.to(e3, delay, {
			startAt: {
				backgroundPosition: '200px 150px', 
			},
			backgroundPosition: '200px -650px', 
			repeat: -1,
			yoyo: true,
			ease: Linear.easeNone
		});
		// up right
		TweenMax.to(e4, delay, {
			startAt: {
				backgroundPosition: '600px 250px', 
			},
			backgroundPosition: '-200px 1050px', 
			repeat: -1,
			yoyo: true,
			ease: Linear.easeNone
		});
	},
	glowTile: function(oldTgt, newTgt){
		var e1 = document.getElementById('land' + oldTgt),
			e2 = document.getElementById('land' + newTgt);
		TweenMax.set(e1, {
			stroke: '#85daf2',
			filter: '',
			strokeWidth: 1
		});
		TweenMax.set(e2, {
			stroke: '#aaeeff',
			filter: 'url(#glow)',
			strokeWidth: 2
		});
		game.updateTopTile(newTgt);
	}
}