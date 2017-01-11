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
	randomColor: function(){
		var x = ~~(Math.random()*6),
			c = '#ffffff';
		if (x === 0){
			c = '#88aaff';
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
		var box = DOM['unit' + tile].getBBox(),
			o = {
				x: box.x,
				y: box.y
			}
		return o;
	},
	upgrade: function(tile){
		audio.play('build');
		var box = DOM['unit' + tile].getBBox();
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
					alpha: 1,
					scale: 0
				},
				scale: i*.1,
				alpha: 0,
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
				alpha: 1,
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
		var e = DOM['unit' + i];
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
	gunfire: function(atkTile, defTile, playSound){
		var box1 = DOM['unit' + atkTile].getBBox(),
			box2 = DOM['unit' + defTile].getBBox();
		var sfx = ~~(Math.random()*9);
		var delay = [.5, .5, .33, .33, .33, .33, .8, .33, .66, .4];
		if (playSound){
			audio.play('machine' + sfx);
		}
		var shots = 30,
			w1 = 50,
			h1 = 50,
			w2 = w1/2,
			h2 = h1/2 - 10;
		for (var i=0; i<shots; i++){
			(function(Math){
				var path = document.createElementNS("http://www.w3.org/2000/svg","path"),
					x2 = box2.x + (Math.random() * w1) - w2;
					y2 = box2.y + (Math.random() * h1) - h2;
				path.setAttributeNS(null,"stroke",animate.randomColor());
				path.setAttributeNS(null,"stroke-width",2);
				DOM.world.appendChild(path);
				TweenMax.to(path, .07, {
					delay: (i / shots) * delay[sfx],
					startAt: {
						attr: {
							d: "M " + box1.x +","+ box1.y + ' ' + x2 +","+ y2
						},
						drawSVG: '0'
					},
					drawSVG: '62% 100%',
					onComplete: function(){
						this.target.parentNode.removeChild(this.target);
					},
					ease: Linear.easeNone
				});
			})(Math);
		}
	},
	cannons: function(atkTile, defTile, playSound){
		var box1 = DOM['land' + atkTile].getBBox(),
			box2 = DOM['land' + defTile].getBBox(),
			box3 = DOM['unit' + defTile].getBBox();
		if (game.tiles[atkTile].player === my.player){
			var a = [5, 6, 8];
			var sfx = ~~(Math.random() * 3);
			audio.play('grenade' + a[sfx]);
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
				circ.setAttributeNS(null,"stroke",'#ffddaa');
				circ.setAttributeNS(null,"strokeWidth",1);
				DOM.mapAnimations.appendChild(circ);
				
				TweenMax.to(circ, .08, {
					delay: i * .007,
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
						var d1 = Math.random()*.3 + .3,
							d2 = d1/2,
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
				if (count % 4 === 0){
					// smoke trail
					var x = x1 + mis._gsTransform.x;
					var y = y1 + mis._gsTransform.y;
					var svg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
					svg.setAttributeNS(null, 'height', 40);
					svg.setAttributeNS(null, 'width', 40);
					svg.setAttributeNS(null, 'opacity', 1);
					svg.setAttributeNS(null, "x", mis.getAttribute('cx'));
					svg.setAttributeNS(null, "y", mis.getAttribute('cy'));
					svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'images/smoke.png');
					DOM.mapAnimations.appendChild(svg);
					TweenMax.to(svg, .5, {
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
				animate.missileExplosion(defender);
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
	missileExplosion: function(tile){
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
						alpha: 1
					},
					alpha: 0,
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
				circ.setAttributeNS(null,"fill",color[game.player[game.tiles[attacker].player].playerColor]);
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
					fill: "hsl(+=20%, +=100%, +=30%)",
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
		var globeDelay = 1;
		// animate stars
		var stars = [
			document.getElementById('firmamentWarsStars1'),
			document.getElementById('firmamentWarsStars2'),
			document.getElementById('firmamentWarsStars3')
		];
		
		TweenMax.to(stars[0], 150, {
			backgroundPosition: '-800px 0px', 
			repeat: -1,
			ease: linear
		});
		TweenMax.to(stars[1], 100, {
			startAt: {
				backgroundPosition: '250px 250px', 
			},
			backgroundPosition: '-1050px 250px', 
			repeat: -1,
			ease: linear
		});
		TweenMax.to(stars[2], 60, {
			startAt: {
				backgroundPosition: '600px 500px', 
			},
			backgroundPosition: '-200px 500px', 
			repeat: -1,
			ease: linear
		});
		// logo
		var fwLogo = document.getElementById('firmamentWarsLogo');
		TweenMax.to(fwLogo, globeDelay, {
			startAt: {
				transformPerspective: 1600,
				transformOrigin: '50% 50% -1600',
				rotationY: 180,
				scale: .2,
				visibility: 'visible',
				alpha: 0,
				yPercent: -50,
				y: '-50%'
			},
			rotationY: 0,
			scale: 1,
			alpha: 1,
			ease: Quad.easeInOut
		});
		
		TweenMax.to('#titleMain', .5, {
			delay: globeDelay,
			startAt: {
				visibility: 'visible'
			},
			alpha: 1,
			onComplete: function(){
				$("#title-chat-input").focus();
			},
			ease: Quad.easeIn
		});
		// globe
		var globe = document.getElementById('titleGlobe');
		TweenMax.to(globe, globeDelay, {
			y: '10%'
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
	water: function(){
		/*
		var delay = 100,
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
		*/
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