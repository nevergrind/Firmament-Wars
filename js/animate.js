
var animate = {
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
	explosion: function(tile, playSound){
		var e1 = document.getElementById('land' + tile),
			box = e1.getBBox();
		var sfx = ~~(Math.random()*9);
		var delay = [.5, .5, .33, .33, .33, .33, .8, .33, .66, .4];
		if (playSound){
			audio.play('machine' + sfx);
		}
		
		for (var i=0; i<50; i++){
			(function(Math){
				var circ = document.createElementNS("http://www.w3.org/2000/svg","circle");
				var x = box.x + (Math.random() * (box.width * .8)) + box.width * .1;
				var y = box.y + (Math.random() * (box.height * .8)) + box.height * .1;
				circ.setAttributeNS(null,"cx",x);
				circ.setAttributeNS(null,"cy",y);
				circ.setAttributeNS(null,"r",1);
				circ.setAttributeNS(null,"fill",'none');
				circ.setAttributeNS(null,"stroke",animate.randomColor());
				circ.setAttributeNS(null,"strokeWidth",'1');
				DOM.world.appendChild(circ);
				
				TweenMax.to(circ, .075, {
					delay: Math.random() * delay[sfx],
					startAt:{
						opacity: 1
					},
					strokeWidth: 5,
					onComplete: function(){
						TweenMax.to(this.target, .125, {
							strokeWidth: 0,
							attr: {
								r: 9
							},
							onComplete: function(){
								this.target.parentNode.removeChild(this.target);
							}
						});
					}
				});
			})(Math);
		}
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
			y: '-=20',
			ease: Linear.easeNone
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
	artillery: function(tile, playSound){
		var e1 = document.getElementById('land' + tile),
			box = e1.getBBox();
		if (playSound){
			var a = [5, 6, 8];
			var sfx = ~~(Math.random() * 3);
			audio.play('grenade' + a[sfx]);
		}
		for (var i=0; i<15; i++){
			(function(Math){
				var circ = document.createElementNS("http://www.w3.org/2000/svg","circle");
				var x = box.x + (Math.random() * (box.width * .8)) + box.width * .1;
				var y = box.y + (Math.random() * (box.height * .8)) + box.height * .1;
				circ.setAttributeNS(null,"cx",x);
				circ.setAttributeNS(null,"cy",y);
				circ.setAttributeNS(null,"r",1);
				circ.setAttributeNS(null,"fill",'none');
				circ.setAttributeNS(null,"stroke",animate.randomColor());
				circ.setAttributeNS(null,"strokeWidth",'1');
				DOM.mapAnimations.appendChild(circ);
				
				if (Math.random() > .3){
					TweenMax.to(circ, .1, {
						delay: Math.random() * .125,
						startAt:{
							opacity: 1
						},
						strokeWidth: 15,
						onComplete: function(){
							TweenMax.to(this.target, .25, {
								strokeWidth: 0,
								attr: {
									r: 21
								},
								onComplete: function(){
									this.target.parentNode.removeChild(this.target);
								}
							});
						}
					});
				} else {
					TweenMax.to(circ, Math.random()*.2+.1, {
						startAt: {
							opacity: 1,
							fill: animate.randomColor(),
							strokeWidth:0,
							attr: {
								r: 8
							}
						},
						opacity: 0,
						ease: Power1.easeIn,
						onComplete: function(){
							this.target.parentNode.removeChild(this.target);
						}
					});
				}
			})(Math);
		}
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
		for (var i=0; i<7; i++){
			(function(Math){
				var circ = document.createElementNS("http://www.w3.org/2000/svg","circle");
				var x = box.x + Math.random() * 60 - 30;
				var y = box.y + Math.random() * 60 - 30;
				circ.setAttributeNS(null,"cx",x);
				circ.setAttributeNS(null,"cy",y);
				circ.setAttributeNS(null,"r",1);
				circ.setAttributeNS(null,"fill",'none');
				circ.setAttributeNS(null,"stroke",animate.randomColor());
				circ.setAttributeNS(null,"strokeWidth",'1');
				DOM.mapAnimations.appendChild(circ);
				
				TweenMax.to(circ, .1, {
					delay: Math.random() * .25,
					startAt:{
						opacity: 1
					},
					strokeWidth: 25,
					onComplete: function(){
						TweenMax.to(this.target, .25, {
							strokeWidth: 0,
							attr: {
								r: 35
							},
							onComplete: function(){
								this.target.parentNode.removeChild(this.target);
							}
						});
					}
				});
			})(Math);
		}
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
		new Image('images/fireball.png');
		// start bomb explosion sequence
		TweenMax.to(g, 1, {
			onComplete: function(){
				updateTileDefense(tile);
				audio.play('bomb9');
				TweenMax.to(DOM.screenFlash, 1.5, {
					startAt: {
						transformOrigin: '50% 50%',
						opacity: 1,
						background: '#ffffff'
					},
					opacity: 0,
					background: '#ff8800',
					ease: Expo.easeOut
				});
				// shake
				animate.screenShake(16, 10, .016, true);
				// fireball
				var fireball = document.createElementNS("http://www.w3.org/2000/svg","image");
				fireball.setAttributeNS(null,"width",256);
				fireball.setAttributeNS(null,"height",256);
				fireball.setAttributeNS(null,"x",x);
				fireball.setAttributeNS(null,"y",y);
				fireball.setAttributeNS(null,"opacity",0);
				fireball.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","images/fireball.png");
				DOM.mapAnimations.appendChild(fireball);
				TweenMax.to(fireball, 3, {
					startAt: {
						xPercent: -50,
						yPercent: -50,
						transformOrigin: '50% 50%',
						scale: .1
					},
					rotation: 2160,
					ease: Linear.easeNone
				});
				TweenMax.to(fireball, .75, {
					scale: 1,
					opacity: 1
				});
				TweenMax.to(fireball, 1, {
					delay: 2,
					scale: .25,
					opacity: 0,
					onComplete: function(){
						if (fireball !== null){
							fireball.parentNode.removeChild(fireball);
						}
					}
				});
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
	}
}