// title.js
var title = {
	players: [],
	getLeaderboard: function(type){
		var e = document.getElementById('leaderboardBody');
		e.innerHTML = '';
		g.lock();
		$.ajax({
			url: app.url + 'php/leaderboard.php',
			data: {
				type: type
			}
		}).done(function(data) {
			e.innerHTML = data.str;
		}).always(g.unlock);
	},
	init: (function(){
		$(document).ready(function(){
			// console.info("Initializing title screen...");
			// prevents auto scroll while scrolling
			$("#titleChatLog").on('mousedown', function(){
				title.chatDrag = true;
			}).on('mouseup', function(){
				title.chatDrag = false;
			});
			$("#title-chat-input").on('focus', function(){
				title.chatOn = true;
			}).on('blur', function(){
				title.chatOn = false;
			});
			$(".createGameInput").on('focus', function(){
				title.createGameFocus = true;
			}).on('blur', function(){
				title.createGameFocus = false;
			});
			$("#login-container").on(ui.click, '.nw-link', function() {
				title.openWindow($(this).attr('href'));
			})
			/*$("#titleChatSend").on(ui.click, function(){
				title.sendMsg(true);
			});*/
			// initial refresh of games
			setTimeout(g.keepAlive, 180000);
		});
	})(),
	updateGame: function(data){
		if (data.type === 'updateToGame'){
			title.games.presence.hb(data);
		}
		else if (data.type === 'addGame'){
			title.games.presence.add(data);
		}
		else if (data.type === 'removeGame'){
			title.games.presence.remove(data);
		}
	},
	games: {
		presence: {
			list: {},
			hb: function(data) {
				data.timestamp = Date.now();
				console.log('%c titleGamesHeartbeat: '+ data.id, 'background: #f8f; color: #f00');
				if (typeof this.list[data.id] === 'undefined') {
					this.add(data);
				}
				else {
					this.update(data);
				}
				this.auditTry(data.timestamp);
			},
			add: function(data) {
				//data
				this.update(data);
				//dom
				var e = document.createElement('tr');
				e.id = 'game_' + data.id;
				e.className = 'shadow4 wars wars-'+ data.gameMode +' no-select';
				e.setAttribute('data-name', data.name);
				e.innerHTML =
					"<td class='warCells'>"+ data.name + "</td>\
					<td class='warCells'>" + data.map + "</td>\
					<td class='warCells'>" + data.gameMode + "</td>";
				DOM.gameTableBody.insertBefore(e, DOM.gameTableBody.childNodes[0]);

			},
			update: function(data) {
				console.info('update: ', data);
				if (data.players === data.max &&
					this.list[data.id].players < data.max) {
					// hide it!
					document.querySelector('#game_' + data.id).style.display = 'none';
				}
				if (typeof this.list[data.id] !== 'undefined' &&
					this.list[data.id].players === data.max &&
					data.players < data.max) {
					// show it!
					document.querySelector('#game_' + data.id).style.display = 'table-row';
				}
				this.list[data.id] = data;

			},
			remove: function(data) {
				console.log("remove: ", data.id)
				this.list[data.id] = void 0;
				var e = document.getElementById('game_' + data.id);
				if (e !== null){
					e.parentNode.removeChild(e);
				}
			},
			audit: function(now) {
				for (var key in this.list) {
					this.list[key] !== void 0 &&
						now - this.list[key].timestamp > 5000 &&
						this.remove({
							id: key
						});
				}
			},
			auditTry: _.throttle(function(data) {
				this.audit(data);
			}, 1000)
		},
	},
	mapData: {
		AlphaEarth: {
			name: 'Alpha Earth',
			tiles: 143,
			startTiles: [135, 4, 65, 81, 100, 13, 73, 21],
			sizeX: 5299,
			sizeY: 2627,
			names: [
				'Kabul', 'Luanda', 'Libreville', 'Muscat', 'Rio Gallegos', //0
				'Puerto Montt', 'Santiago', 'Athens', 'Istanbul', 'Gaziantep',
				'Tbilisi', 'Volgograd', 'Adelaide', 'Sydney', 'Darwin', //10
				'Perth', 'Brisbane', 'Zagreb', 'Dar es Salaam', 'Berlin',
				'Abidjan', 'Mumbai', 'New Delhi', 'Dhaka', 'Minsk', //20
				'Guatemala City', 'Asuncion', 'São Luís', 'Rio de Janeiro', 'Brasilia',
				'Fortaleza', 'Manaus', 'Kashgar', 'Ulaanbaatar', 'Kathmandu', //30
				'Wuwei', 'Shanghai', 'Hong Kong', 'Kunming', 'Chengdu',
				'Beijing', 'Changchun', 'Gaborone', 'Yaounde', 'Vancouver', //40
				'Calgary', 'Toronto', 'Manitoba', 'Quebec', "St. John's",
				'Yellowknife', 'Whitehorse', 'Iqaluit', 'Resolute', 'Rome', //50
				'Conakry', 'Kinshasa', 'Bogota', 'Addis Ababa', 'Algiers',
				'Lima', 'Quito', 'Cairo', 'Jerusalem', 'Helsinki', //60
				'London', 'Nuuk', 'Narsaq', 'Daneborg', 'Paramaribo',
				'Tehran', 'Baghdad', 'Reykjavik', 'Tokyo', 'Astana', //70
				'Aktau', 'Nairobi', 'Ashgabat', 'Hanoi', 'Seoul',
				'Tripoli', 'Cape Town', 'Bucharest', 'Antananarivo', 'Mexico City', //80
				'Ciudad Juarez', 'Bamako', 'Mandalay', 'Maputo', 'Windhoek',
				'Niamey', 'Abuja', 'Oslo', 'Svalbard', 'Wellington', //90
				'Karachi', 'Manila', 'Port Moresby', 'Warsaw', 'Madrid',
				'Mecca', 'Abu Dhabi', 'Riyadh', 'Medina', 'Yakutsk', //100
				'Kamchatka', 'Chita', 'Irkutsk', 'Moscow', 'St. Petersburg',
				'Novgorod', 'Novosibirsk', 'Novy Urengoy', 'Syktyvkar', 'Krasnoyarsk', //110
				'Abakan', 'Chatanga', 'Norilsk', 'Nordvik', 'Sklad',
				'Rabat', 'Khartoum', 'Stockholm', "N'Djamena", 'Bangkok', //120
				'Sorong', 'Jakarta', 'Kiev', 'Los Angeles', 'Seattle',
				'Austin', 'Atlanta', 'New York City', 'Denver', 'Chicago', //130
				'Juneau', 'Caracas', "Sana'a", 'Lusaka', 'Mogadishu',
				'Paris', 'Havana', 'Kuala Lumpur'
			],
			players: 8
		},
		China: {
			name: 'China',
			tiles: 126,
			startTiles: [94,110,119,125,51,16],
			sizeX: 4473,
			sizeY: 2525,
			names: [
				'Xiamen', 'Nanping', 'Shantou', 'Guazhou', 'Shanwei', //0
				'Shenzhen', 'Wenshan', 'Guangzhou', 'Guilin', 'Baise',
				'Yangjiang', 'Zhanjiang', 'Anshun', 'Qianxinan', 'Haikou', //10
				'Zhengzhou', 'Da Hinggan Ling', 'Harbin', 'Sunwu', 'Mudanjiang',
				'Qiqihar', 'Shuangyashan', 'Suihua', 'Yichun', 'Changsha', //20
				'Tongren', 'Jining', 'Fuyang', 'Huaihua', 'Qiandongnan',
				'Qiannan', 'Shaoguan', 'Hechi', 'Guiyang', 'Xuzhou', //30
				'Linyi', 'Nantong', 'Sanming', 'Laibin', 'Hefei',
				'Baicheng', 'Jilin', 'Changchun', 'Baishan', 'Yanbian', //40
				'Qinhuangdao', 'Fuxin', 'Dalian', 'Dandong', 'Wuwei',
				'Jiuquan', 'Bayan Nur', 'Chifeng', 'Baotou', 'Daonan', //50
				'Nenjiang', 'Hulun Buir', 'Tongliao', 'Hohhot', 'Hanzhong',
				'Ulanqab', 'Xilin Gol', 'Hinggan', 'Guangyuan', 'Dege', //60
				'Yushu', 'Amdo', 'Gyaring', 'Luobubozhen', 'Baima',
				'Golog', 'Mianyang', 'Zunyi', 'Yibin', 'Shiyan', //70
				'Ankang', 'Baoding', 'Yancheng', 'Qiangdao', 'Jinan',
				'Dongying', 'Zhumadian', 'Sanmenxia', 'Nanyang', 'Xiangyang', //80
				'Batang', 'Liupanshui', 'Liangshan', 'Bijie', 'Chongqing',
				'Aba', 'Zhaotong', 'Chengdu', 'Beijing', 'Altay', //90
				'Bayingol', 'Turpan', 'Dushanzi', 'Kumul', 'Aksu',
				'Hotan', 'Kashgar', 'Alashankou', 'Ürümqi', 'Qamdo', //100
				'Nagqu', 'Aru', 'Heishi', 'Nyingchi', 'Xigaze',
				'Zhongba', 'Sirenshou', 'Ngari', 'Dongruxiang', 'Lijiang', //110
				'Dehong', 'Deqen', 'Kunming', 'Honghe', 'Xishuangbanna',
				'Jiangcheng', 'Qujing', 'Hangzhou', 'Shanghai', 'Jinhua', //120
				'Ningbo'
			],
			players: 8
		},
		EarthOmega: {
			name: 'Earth Omega',
			tiles: 78,
			startTiles: [72, 5, 47, 77, 66, 8],
			sizeX: 4000,
			sizeY: 1900,
			names: [
				'Afghanistan', 'Angola', 'Gabon', 'Greece', 'Oman', //0
				'Argentina', 'Turkey', 'Romania', 'Australia', 'Austria',
				'Tanzania', 'Germany', 'Ghana', 'India', 'Belarus', //10
				'Panama', 'Bolivia', 'Brazil', 'Indonesia', 'Botswana',
				'Cameroon', 'Canada', 'Italy', 'China', 'Liberia', //20
				'Nigeria', 'Congo', 'Colombia', 'Cuba', 'Ethiopia',
				'Algeria', 'Peru', 'Egypt', 'Finland', 'United Kingdom', //30
				'Greenland', 'Guyana', 'Iran', 'Iraq', 'Iceland',
				'Israel', 'Japan', 'Kazakhastan', 'Uzbekistan', 'Cambodia', //40
				'Korea', 'Libya', 'South Africa', 'Morocco', 'Madagascar',
				'Mexico', 'Mali', 'Thailand', 'Mongolia', 'Mozambique', //50
				'Namibia', 'Niger', 'Norway', 'Svalbard', 'New Zealand',
				'Pakistan', 'Philippines', 'Papua New Guinea', 'Poland', 'Spain', //60
				'Paraguay', 'Saudi Arabia', 'Russia', 'Sudan', 'Sweden',
				'Chad', 'Ukraine', 'United States', 'Alaska', 'Venezuela', // 70
				'Yemen', 'Somalia', 'France'
			],
			players: 6
		},
		/*EarthAlpha: {
			name: 'Earth Alpha',
			tiles: 83,
			startTiles: [40, 44, 58, 51, 5, 52, 63, 62],
			sizeX: 2800,
			sizeY: 1500,
			names: [
				'Chicago', 'Pakistan', 'Namibia', 'Congo', 'Greece',
				'Oman', 'Patagonia', 'Buenos Aires', 'Turkey', 'Sydney',
				'Perth', 'Gibson Desert', 'Queensland', 'Germany', 'Persia',
				'Kenya', 'France', 'Italy', 'Mali', 'Sri Lanka',
				'India', 'Ontario', 'Estonia', 'Panama', 'Bolivia', // 20
				'Brazil', 'Rio de Janeiro', 'Guyana', 'Kyrgyzstan', 'Zimbabwe',
				'South Africa', 'Sudan', 'Quebec', 'Alberta', 'Nunavut',
				'British Colombia', 'Shanghai', 'Tibet', 'Beijing', 'Colombia',
				'Cuba', 'Poland', 'Ethiopia', 'Algeria', 'Peru', // 40
				'Egypt', 'Scandinavia', 'United Kingdom', 'Greenland', 'Yemen',
				'Babylon', 'Iceland', 'Japan', 'Kazakhstan', 'Thailand',
				'Libya', 'Morocco', 'Ukraine', 'Madagascar', 'Mexico',
				'Mongolia', 'Nigeria', 'Svalbard', 'New Zealand', 'Philippines', // 60
				'Indonesia', 'Alaska', 'Papua New Guinea', 'Spain', 'Saudi Arabia',
				'Norilsk', 'Tomsk', 'St. Petersburg','Moscow', 'Ural',
				'Yakutsk', 'Kamchatka', 'Irkutsk', 'Syberia', 'California',
				'New York', 'Florida', 'Texas' // 80
			],
			players: 8
		},*/
		EuropeMena: {
			name: 'Europe Mena',
			tiles: 137,
			startTiles: [40,56,134,31,107,86,114,96],
			sizeX: 5130,
			sizeY: 4132,
			names: [
				'Tirana', 'Yerevan', 'Baku', 'Vienna', 'Brussels', //0
				'Sofia', 'Sarajevo', 'Osijek', 'Zagreb', 'Smolensk',
				'Geneva', 'Prague', 'Bremen', 'Dresden', 'Stuttgart', //10
				'Munich', 'Cologne', 'Hanover', 'Berlin', 'Hamburg',
				'Copenhagen', 'Mazzer', 'Tinduf', 'Tinzaouten', 'Tamanrasset', //20
				'El Menia', 'Illizi', 'Touggourt', 'Oran', 'Algiers',
				'Suez', 'Cairo', 'Aswan', 'Luxor', 'Marsa Matruh', //30
				'Helsinki', 'Helsinki', 'Oulu', 'Dublin', 'Cardiff',
				'London', 'Edinburgh', 'Tbilisi', 'Athens', 'Thessaloniki', //40
				'Budapest', 'Kuwait City', 'Al Salman', 'Rutba', 'Kut',
				'Baghdad', 'Erbil', 'Reykjavik', 'Jerusalem', 'Syracuse', //50
				'Naples', 'Rome', 'Florence', 'Turin', 'Venice',
				'Amman', 'Beirut', 'Al Jaghbub', 'Benghazi', 'Wath', //60
				'Buzaymah', 'Tmassah', 'Ghat', 'Maradah', 'Sinawin',
				'Tripoli', 'Riga', 'Marrakesh', 'Rabat', 'Iasi', //70
				'Skopje', 'Amsterdam', 'Oslo', 'Kraków', 'Warsaw',
				'Szczecin', 'Lisbon', 'Porto', 'Bucharest', 'Timisoara', //80
				'Cluj-Napoca', 'Moscow', 'Grozny', 'Krasnodar', 'Volgograd',
				'Voronezh', 'Tambov', 'Yaroslavl', 'St. Petersburg', 'Murmansk', //90
				'Vilnius', 'Mecca', 'Medina', "Sana'a", 'Muscat',
				'Abu Dhabi', 'Riyadh', 'Tabuk', 'Belgrade', 'Košice', //100
				'Ljubljana', 'Gothenburg', 'Stockholm', 'Skellefteå', 'Damascus',
				'Tunis', 'Erzurum', 'Gaziantep', 'Izmir', 'Istanbul', //110
				'Konya', 'Ankara', 'Lutsk', 'Sevastopol', 'Odesa',
				'Donetsk', 'Kiev', 'Cagliari', 'Toulouse', 'Marseilles', //120
				'Nantes', 'Paris', 'Limoges', 'Lyon', 'Lille',
				'Bilbao', 'Barcelona', 'Seville', 'Murcia', 'Madrid', //130
				'Valencia', 'Vigo'
			],
			players: 8
		},
		FlatEarth: {
			name: 'Flat Earth',
			tiles: 135,
			startTiles: [133,19,39,134,56,74,85,128],
			sizeX: 4623,
			sizeY: 4487,
			names: [
				'Santiago', 'La Paz', 'Asuncion', 'Rio de Janiero', 'Salvador', //0
				'Brasília', 'São Luís', 'Lima', 'Paramaribo', 'Belém',
				'Manaus', 'Caracas', 'Bogotá', 'Panama', 'Guatemala', //10
				'Mexico City', 'Los Angeles', 'Austin', 'Atlanta', 'New York City',
				'Chicago', 'Winnipeg', 'Edmonton', 'Havana', 'Vancouver', //20
				'Yukon', 'Anchorage', 'Northwest Territories', 'Nunavut', 'Nuuk',
				'Daneborg', 'Qaanaaq', 'Resolute', 'Toronto', 'Reykjavik', //30
				'Auckland', 'Makassar', 'Jakarta', 'Manila', 'Tokyo',
				'Medan', 'Paris', 'Sofia', 'Bucharest', 'Sarajevo', //40
				'Warsaw', 'Vienna', 'Kiev', 'Belarus', 'Istanbul',
				'Gaziantep', 'Damascus', 'Tripoli', 'Rabat', 'Bamako', //50
				'Dakar', 'Abidjan', 'Ouagadougou', 'Niamey', 'Accra',
				'Lome', 'Abuja', 'Addis Ababa', "N'Djamena", 'Libreville', //60
				'Brazzaville', 'Luanda', 'Windhoek', 'Pretoria', 'Gaborone',
				'Maputo', 'Lusaka', 'Lubumbashi', 'Dar es Salaam', 'Nairobi', //70
				'Bangui', 'Kisangani', 'Kampala', 'Khartoum', 'Mogadishu',
				'Algiers', 'Tunis', 'Cairo', 'Jerusalem', "Sana'a", //80
				'Mecca', 'Medina', 'Riyadh', 'Doha', 'Abu Dhabi',
				'Phnom Penh', 'Hanoi', 'Mandalay', 'Dhaka', 'New Delhi', //90
				'Karachi', 'Kabul', 'Baghdad', 'Tehran', 'Tbilisi',
				'Ashgabat', 'Helsinki', 'Tashkent', 'Islamabad', 'Astana', //100
				'Ulaanbaatar', 'Ürümqi', 'Qinghai', 'Beijing', 'Hong Kong',
				'Shanghai', 'Seoul', 'Singapore', 'Ankara', 'Rome', //110
				'Madrid', 'Berlin', 'Stockholm', 'Antananarivo', 'Mumbai',
				'Moscow', 'Ural', 'Siberia', 'Yakutsk', 'Vladivostok', //120
				'Kamchatka', 'Yaounde', 'Athens', 'Perth', 'Brisbane',
				'Sydney', 'Jayapura', 'Port Moresby', 'Buenos Aires', 'London'
			],
			players: 8
		},
		France: {
			name: 'France',
			tiles: 81,
			startTiles: [34, 42, 38, 67, 78, 30, 63, 11],
			sizeX: 2720,
			sizeY: 1992,
			names: [
				'Oyonnax', 'Maubeuge', 'Nevers', 'Digne', 'Nice', //0
				'Lyon', 'Charleville-Mezieres', 'Toulouse', 'Chalons-en-Champagne', 'Narbonne',
				'Saint-Flour', 'Haguenau', 'Marseille', 'Caen', 'Egletons', //10
				'Angouleme', 'Rochefort', 'Melun', 'Limoges', 'Ajaccio',
				'Langres', 'Saint-Brieuc', 'La Souterraine', 'Cholet', 'Bergerac', //20
				'Besancon', 'Valence', 'Paris', 'Lisieux', 'Versailles',
				'Brest', 'Nimes', 'Orthez', 'Bordeaux', 'Bastia', //30
				'Saint-Etienne', 'Bar-le-Duc', 'Langres', 'Thonon-les-Bains', 'Bellac',
				'Briancon', 'Larrau', 'Montpellier', 'St-Malo', 'Chateauroux', //40
				'Tours', 'Grenoble', 'Champagnole', 'Sabres', 'Chartres',
				'Lyon', 'Nantes', 'Evry', 'Montauban', 'Agen', //50
				'Le Puy', 'Angers', 'Saulces-Monclin', 'Gorron', 'Metz',
				'Verdun', 'Lorient', 'Auxerre', 'Calais', 'Montdidier', //60
				'Evreux', 'Vichy', 'Bayonne', 'Perpignan', 'Dijon',
				'Alencon', 'Meaux', 'Le Havre', 'Amiens', 'Rodez', //70
				'Mulhouse', 'Cannes', 'La Roche-sur-Yon', 'Poitiers', 'Nancy',
				'Nangis' //80
			],
			players: 8
		},
		Germany: {
			name: 'Germany',
			tiles: 150,
			startTiles: [24, 6, 116, 75, 137, 66, 130, 43],
			sizeX: 3791,
			sizeY: 2939,
			names: [
				'Darmstadt', 'Ortenaukreis', 'Rems-Murr-Kreis', 'Neckar-Odenwald-Kreis', 'Konstanz',  //0
				'Freudenstadt', 'Lörrach', 'Schwarzwald-Baar-Kreis', 'Fürth', 'Cham',
				'Augsburg', 'Ostalbkreis', 'Bamberg', 'Erding', 'Landshut',  //10
				'Kronach', 'Ravensburg', 'Altötting', 'Ebersberg', 'Miesbach',
				'Wetteraukreis', 'Bayreuth', 'Erlangen-Höchstadt', 'Oberallgäu', 'Freyung-Grafenau',  //20
				'Eichstätt', 'Regen', 'Regensburg', 'Rhön-Grabfeld', 'Rosenheim',
				'Rottal-Inn', 'Neumarkt In Der Oberpfalz', 'Schwandorf', 'Haßberge', 'Starnberg',  //30
				'Straubing-Bogen', 'Wunsiedel', 'Berchtesgadener Land', 'Ulm', 'Unterallgäu',
				'Würzburg', 'Weißenburg-Gunzenhausen', 'Garmisch-Partenkirchen', 'Hof', 'Märkisch-Oderland',  //40
				'Barnim', 'Elbe-Elster', 'Oder-Spree', 'Ostprignitz-Ruppin', 'Potsdam-Mittelmark',
				'Prignitz', 'Cottbus', 'Teltow-Fläming', 'Uckermark', 'Bad-Kissingen',  //50
				'Rastatt', 'Lahn-Dill-Kreis', 'Vogelsbergkreis', 'Waldeck-Frankenberg', 'Werra-Meißner-Kreis',
				'Main-Kinzig-Kreis', 'Mecklenburgische-Seenplatte', 'Nordwestmecklenburg', 'Rostock', 'Ludwigslust-Parchim',  //60
				'Vorpommern-Greifswald', 'Vorpommern-Rügen', 'Cloppenburg', 'Cloppenburg', 'Cuxhaven',
				'Gifhorn', 'Emsland', 'Harburg', 'Hildesheim', 'Lüchow-Dannenberg',  //70
				'Leer', 'Hameln-Pyrmont', 'Oldenburg', 'Osterholz', 'Osterode am Harz',
				'Hannover Region', 'Rotenburg', 'Stade', 'Heidekreis', 'Uelzen',  //80
				'Osnabrück', 'Diepholz', 'Wesermarsch', 'Wittmund', 'Wolfenbüttel',
				'Borken', 'Euskirchen', 'Gütersloh', 'Hochsauerlandkreis', 'Schaumburg',  //90
				'Minden-Lübbecke', 'Märkischer Kreis', 'Höxter', 'Soest', 'Städteregion Aachen',
				'Steinfurt', 'Recklinghausen', 'Heinsberg', 'Warendorf', 'Kleve',  //100
				'Mettmann', 'Siegen-Wittgenstein', 'Eifelkreis Bitburg-Prüm', 'Birkenfeld', 'Alzey-Worms',
				'Mayen-Koblenz', 'Rhein-Hunsrück-Kreis', 'Südliche-Weinstraße', 'Bernkastel-Wittlich', 'Kreisverwaltung',  //110
				'Donnersbergkreis', 'Trier-Saarburg', 'Südwestpfalz', 'Altmarkkreis-Salzwedel', 'Kyffhäuserkreis',
				'Anhalt Bitterfeld', 'Harz', 'Jerichower Land', 'Saalekreis', 'Salzlandkreis',  //120
				'Börde', 'Stendal', 'Wittenberg', 'Bautzen', 'Erzgebirgskreis',
				'Görlitz', 'Meißen', 'Mittelsachsen', 'Nordsachsen', 'Sächsische Schweiz-Osterzgebirge',  //130
				'Vogtlandkreis', 'Dithmarschen', 'Nordfriesland', 'Ostholstein', 'Rendsburg-Eckernförde',
				'Schleswig-Flensburg', 'Steinburg', 'Pinneberg', 'Zwickau', 'Greiz',  //140
				'Saalfeld-Rudolstadt', 'Schmalkalden-Meiningen', 'Hildburghausen', 'Eichsfeld', 'Unstrut-Hainich-Kreis'
			],
			players: 8
		},
		Italy: {
			name: 'Italy',
			tiles: 81,
			startTiles: [45, 39, 13, 29, 6, 9, 72, 73],
			sizeX: 2720,
			sizeY: 2406,
			names: [
				'Bologna', 'Parma', 'Varzi', 'Chioggia', 'Ferrara', //0
				'Rimini', 'Pesaro', 'Genoa', 'Savona', 'Ventimiglia',
				'La Spezia', 'Carbonia', 'Oristano', 'Sassari', 'Olbia', //10
				'Nuoro', 'Arbatax', 'Cagliari', 'Grosseto', 'Livorno',
				'Viareggio', 'Florence', 'Bibbiena', 'Paganico', 'Policoro', //20
				'Potenza', 'Cosenza', 'Catanzaro', 'Reggio Calabria', 'Naples',
				'Benevento', 'Avellino', 'Pompeii', 'Termoli', 'Isernia', //30
				'Bari', 'Foggia', 'Barletta', 'Brindisi', 'Lecce',
				'Taranto', 'Marsala', 'Palermo', 'Messina', 'Catania', //40
				'Syracuse', 'Agrigento', 'Vasto', 'Pescara', 'Avezzano',
				'Latina', 'Rome', 'Tivoli', 'Terracina', 'Ancona', //50
				'Teramo', 'Montesilvano', "L'Aquila", 'Turin', 'Biella',
				'Premia', 'Varese', 'Allessandria', 'Cuneo', 'Aosta', //60
				'Clusone', 'Sondrio', 'Breno', 'Verona', 'Voghera',
				'Pavia', 'Milan', 'Como', 'Udine', 'Pordenone', //70
				'Bressanone', 'Bolzano', 'Venice', 'Vicenza', 'Treviso',
				'Belluno' //80
			],
			players: 8
		},
		Japan: {
			name: "Japan",
			tiles: 47,
			startTiles: [11, 29],
			sizeX: 4081,
			sizeY: 3859,
			names: [
				'Aichi', 'Akita', 'Aomori', 'Chiba', 'Ehime',
				'Fukui', 'Fukuoka', 'Fukushima', 'Gifu', 'Gunma',
				'Hyogo', 'Hokkaido', 'Hiroshima', 'Ibaraki', 'Ishikawa', // 10
				'Iwate', 'Kochi', 'Kogawa', 'Kumamoto', 'Kanagawa',
				'Kagoshima', 'Kyoto', 'Mie', 'Miyaki', 'Miyazaki', // 20
				'Niigata', 'Nagano', 'Nara', 'Nagasaki', 'Okinawa',
				'Osaka', 'Okayama', 'Oita', 'Saga', 'Shiga', // 30
				'Shimane', 'Saitama', 'Shizuoka', 'Tochigi', 'Tokyo',
				'Tokushima', 'Tottori', 'Toyama', 'Wakayama', 'Yamaguchi', // 40
				'Yamanashi', 'Yamagata'
			],
			players: 2
		},
		Turkey: {
			name: "Turkey",
			tiles: 75,
			startTiles: [56,40,65,9],
			sizeX: 3050,
			sizeY: 1480,
			names: [
				'Adana', 'Adiyaman', 'Afyonkarahisar', 'Agri', 'Aksaray', //0
				'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin',
				'Aydin', 'Balikesir', 'Bartin', 'Siirt', 'Bayburt', //10
				'Bilecik', 'Bingol', 'Bitlis', 'Bolu', 'Burdur',
				'Bursa', 'Canakkale', 'Cankiri', 'Corum', 'Denizli', //20
				'Diyarbakir', 'Sakarya', 'Edirne', 'Elazig', 'Erzincan',
				'Erzurum', 'Eskisehir', 'Gaziantep', 'Giresun', 'Gumushane', //30
				'Hakkari', 'Hatay', 'Mersin', 'Igdir', 'Isparta',
				'Istanbul', 'Izmir', 'Kahramanmaras', 'Karaman', 'Kars', //40
				'Kastamonu', 'Kayseri', 'Kirikkale', 'Kirklarelli', 'Kirsehir',
				'Kocaeli', 'Konya', 'Kutayah', 'Malatya', 'Manisa', //50
				'Mardin', 'Mugla', 'Mus', 'Nevsehir', 'Nigde',
				'Ordu', 'Rize', 'Samsun', 'Sanliurfa', 'Sinop', //60
				'Sirnak', 'Sivas', 'Tekirdag', 'Tokat', 'Trabzon',
				'Tunceli', 'Usak', 'Van', 'Yozgat', 'Zonguldak' //70
			],
			players: 4
		},
		UnitedKingdom: {
			name: "United Kingdom",
			tiles: 69,
			startTiles: [35, 52, 45, 62, 33, 38],
			sizeX: 2720,
			sizeY: 2600,
			names: [
				'Paisley', 'Stirling', 'Glasgow', 'Aberdeen', 'Dundee', //0
				'Edinburgh', 'Middlesbrough', 'Alnwick', 'Southampton', 'Northampton',
				'Cheltenham', 'Windsor', 'Luton', 'Bristol', 'Taunton', //10
				'Exeter', 'Weymouth', 'Peterborough', 'Leicester', 'Hull',
				'Scunthorpe', 'Sheffield', 'London', 'Grimsby', 'Belfast', //20
				'Colerane', 'Omagh', 'Armagh', 'Newcastle', 'Cookstown',
				'Ballymena', 'Swansea', 'Aberystwyth', 'Haverfordwest', 'Chester', //30
				'Falmouth', 'Newtown', 'Newport', 'Scarborough', 'Shrewsbury',
				'Preston', 'Rhyl', 'Holyhead', 'Colwyn Bay', 'Bangor', //40
				'Enniskillen', 'Dumfries', 'Carlisle', 'Chelmsford', 'Ipswich',
				'Norwich', 'Hastings', 'Canterbury', 'Inverness', 'Oban', //50
				'Brighton', 'Kettering', 'Coventry', 'West Berkshire', 'Guildford',
				'Bath', 'Nottingham', 'Stornoway', 'Liverpool', 'Worcester', //60
				'Oxford', 'Birmingham', 'Leeds', 'Doncaster'
			],
			players: 6
		},
		UnitedStates: {
			name: 'United States',
			tiles: 48,
			startTiles: [7, 46],
			sizeX: 2720,
			sizeY: 1791,
			names: [
				'Massachusetts', 'Minnesota', 'Montana', 'North Dakota', 'Idaho',
				'Washington', 'Arizona', 'California', 'Colorado', 'Nevada',
				'New Mexico', 'Oregon', 'Utah', 'Wyoming', 'Arkansas', // 10
				'Iowa', 'Kansas', 'Missouri', 'Nebraska', 'Oklahoma',
				'South Dakota', 'Louisiana', 'Texas', 'Connecticut', 'New Hampshire', // 20
				'Rhode Island', 'Vermont', 'Alabama', 'Florida', 'Georgia',
				'Mississippi', 'South Carolina', 'Illinois', 'Indiana', 'Kentucky', // 30
				'North Carolina', 'Ohio', 'Tennessee', 'Virginia', 'Wisconsin',
				'West Virginia', 'Delaware', 'Maryland', 'New Jersey', 'New York', // 40
				'Pennsylvania', 'Maine', 'Michigan'
			],
			players: 2
		}
	},
	chatDrag: false,
	chatOn: false,
	scrollBottom: function(){
		if (!title.chatDrag){
			DOM.titleChatLog.scrollTop = DOM.titleChatLog.scrollHeight;
		}
	},
	chat: function (data){
		if (g.view === 'title' && data.message){
			while (DOM.titleChatLog.childNodes.length > 500) {
				DOM.titleChatLog.removeChild(DOM.titleChatLog.firstChild);
			}
			if (data.type === 'inserted-image'){
				(function repeat(count){
					if (++count < 10){
						title.scrollBottom();
						setTimeout(repeat, 200, count);
					}
				})(0);
			}
			var z = document.createElement('div'); 
			if (data.type){
				z.className = data.type;
			}
			z.innerHTML = data.message;
			DOM.titleChatLog.appendChild(z);
			title.scrollBottom();
			/*
			if (!data.skip){
				g.sendNotification(data);
			}
			*/
		}
	},
	friendGet: function(){
		// friend list
		g.friends = [];
		$.ajax({
			type: 'GET',
			url: app.url + 'php/friendGet.php',
		}).done(function(data){
			title.friendGetCallback(data.friends);
		});
	},
	friendGetCallback: function(data) {
		data.forEach(function(friend){
			g.friends.push(friend);
		});
	},
	toggleFriend: function(account){
		account = account.trim();
		if (account !== my.account){
			console.info('toggle: ', account, account.length);
			$.ajax({
				url: app.url + 'php/friendToggle.php',
				data: {
					account: account
				}
			}).done(function(data){
				if (data.action === 'fail'){
					g.chat('You cannot have more than 20 friends!');
				} else if (data.action === 'remove'){
					g.chat('Removed '+ account +' from your friend list');
					title.friendGet();
				} else if (data.action === 'add'){
					g.chat('Added '+ account +' to your friend list');
					title.friendGet();
				}
			});
		} else {
			// cannot add yourself
			g.chat("You can't be friends with yourself!", 'chat-muted');
		}
	},
	listIgnore: function(){
		var len = g.ignore.length;
		g.chat('<div>Ignore List ('+ len +')</div>');
		for (var i=0; i<len; i++){
			var str = '<div><span class="chat-muted titlePlayerAccount">' + g.ignore[i] +'</span></div>';
			g.chat(str);
		}
	},
	addIgnore: function(account){
		account = account.toLowerCase().trim();
		g.chat('<div>Ignoring '+ account +'</div>');
		if (g.ignore.indexOf(account) === -1 && account){
			if (g.ignore.length < 20){
				if (account !== my.account){
					g.ignore.push(account);
					localStorage.setItem('ignore', JSON.stringify(g.ignore));
					g.chat('Now ignoring account: ' + account, 'chat-muted');
				} else {
					g.chat("<div>You can't ignore yourself!</div><img src='"+ app.url +"images/chat/random/autism.jpg'>", 'chat-muted');
				}
			} else {
				g.chat('You cannot ignore more than 20 accounts!', 'chat-muted');
			}
		} else {
			g.chat('Already ignoring ' + account +'!', 'chat-muted');
		}
	},
	removeIgnore: function(account){
		account = account.toLowerCase().trim();
		if (account && g.ignore.indexOf(account) > -1){
			// found account
			var index = g.ignore.indexOf(account);
			g.ignore.splice(index, 1);
			localStorage.setItem('ignore', JSON.stringify(g.ignore));
			g.chat('Stopped ignoring account: ' + account, 'chat-muted');
		} else {
			g.chat(account + ' is not on your ignore list.', 'chat-muted');
		}
	},
	presence: {
		list: {},
		setHeader: function() {
			if (g.view === 'title') {
				document.getElementById('titleChatHeaderChannel').textContent =
					my.channel + ' ('+ this.getListLength() + ')';
			}
		},
		getListLength: function() {
			var count = 0;
			for (var key in this.list) {
				if (this.list[key] !== void 0) {
					count++;
				}
			}
			return count;
		},
		hb: function(data) {
			data.timestamp = Date.now();
			console.log('%c titleHeartbeat: '+ data.account, 'background: #0f0; color: #f00');
			if (typeof this.list[data.account] === 'undefined') {
				this.add(data);
			}
			else {
				this.update(data);
			}
			this.auditTry(data.timestamp);
			title.games.presence.auditTry(data.timestamp);
		},
		add: function(data) {
			//data
			this.update(data);
			//dom
			var e = document.getElementById('titlePlayer' + data.account);
			if (e !== null){
				e.parentNode.removeChild(e);
			}
			e = document.createElement('div');
			e.className = "titlePlayer";
			e.id = "titlePlayer" + data.account;
			e.innerHTML =
				'<img id="titlePlayerFlag_'+ data.account +'" class="flag" src="images/flags/'+ data.flag +'">' +
				'<span class="chat-rating">['+ data.rating +']</span> '+
				'<span class="titlePlayerAccount">'+ data.account +'</span>';
			DOM.titleChatBody.appendChild(e);
			this.setHeader();

		},
		update: function(data) {
			this.list[data.account] = data;
		},
		remove: function(account) {
			console.log("remove: ", account)
			this.list[account] = void 0;
			var z = document.getElementById('titlePlayer' + account);
			if (z !== null){
				z.parentNode.removeChild(z);
			}
			this.setHeader();
		},
		reset: function() {
			this.list = {};
			this.setHeader();
		},
		audit: function(now) {
			for (var key in this.list) {
				this.list[key] !== void 0 &&
					now - this.list[key].timestamp > 5000 &&
					this.remove(key);
			}
		},
		auditTry: _.throttle(function(data) {
			this.audit(data);
		}, 1000)
	},
	sendWhisper: function(msg, splitter){
		// account
		var msg = msg.split(splitter),
			msg = msg[1].split(" "),
			account = msg.shift();
		console.info('sendWhisper', account, msg[0]);
		$.ajax({
			url: app.url + 'php/insertWhisper.php',
			data: {
				account: account,
				flag: my.flag,
				playerColor: my.playerColor,
				message: msg[0],
				action: 'send'
			}
		});
	},
	lastWhisper: {
		account: '',
		message: '',
		timestamp: 0
	},
	receiveWhisper: function(data){
		// console.info('receiveWhisper ', data);
		if (g.ignore.indexOf(data.account) === -1) {
			if (g.view === 'title') {
				title.chat(data);
			}
			else if (g.view === 'lobby') {
				lobby.chat(data);
			}
			else {
				game.chat(data);
			}
		}
	},
	changeChannel: function(msg, splitter){
		var arr = msg.split(splitter);
		socket.setChannel(arr[1]);
	},
	who: function(msg){
		var a = msg.split("/who ");
		$.ajax({
			url: app.url + 'php/whoUser.php',
			data: {
				account: a[1]
			}
		}).done(function(data){
			function getRibbonStr(){
				var str = '';
				if (data.ribbons !== undefined){
					data.ribbons.reverse();
					var i = 0,
						len = data.ribbons.length,
						z;

					if (len){
						str += '<div class="ribbon-wrap">';
						for (; i<len; i++){
							z = data.ribbons[i];
							str += '<img class="pointer ribbon" data-ribbon="'+ z +'" src="images/ribbons/ribbon'+ z +'.jpg">';
						}
						str += '</div>';
					}
				}
				return str;
			}
			
			var str = 
			'<div class="who-wrap">'+
				'<div class="who-wrap-left">';
				// left col
				str += data.str;
				if (data.account !== my.account && g.friends.indexOf(data.account) === -1){
					str += '<button style="pointer-events: initial" class="addFriend btn btn-xs fwBlue" data-account="'+ data.account +'">Add Friend</button>';
				}
			str += 
				'</div>'+
				'<div class="who-wrap-right">';
				// right col
				str += getRibbonStr() +
				'</div>'+
			'</div>';
			g.chat(str);
		}).fail(function(){
			g.chat('No data found.');
		});
	},
	help: function(){
		var a = [
			'<div class="chat-warning">Chat Commands:</div>',
			'<div>#channel: join channel</div>',
			'<div>@account: whisper user</div>',
			'<div>/ignore account: ignore account</div>',
			'<div>/unignore account: stop ignoring account</div>',
			'<div>/friend account: add/remove friend</div>',
			'<div>/who account: check account info (or click account name)</div>'
		];
		a.forEach(function(v) {
			title.chat({
				message: v,
				type: 'chat-muted'
			});
		});
	},
	broadcast: function(msg){
		$.ajax({
			url: app.url + 'php/insertBroadcast.php',
			data: {
				message: msg
			}
		});
	},
	closeApp: function(){
		$.ajax({
			type: 'GET',
			url: app.url + 'php/close-app.php'
		}).done(function() {
			console.info('close-app');
		});
	},
	url: function(url){
		$.ajax({
			url: app.url + 'php/insertUrl.php',
			data: {
				url: url
			}
		});
	},
	img: function(url){
		$.ajax({
			url: app.url + 'php/insertImg.php',
			data: {
				url: url
			}
		});
	},
	video: function(url){
		$.ajax({
			url: app.url + 'php/insertVideo.php',
			data: {
				url: url
			}
		});
	},
	fwpaid: function(msg){
		$.ajax({
			url: app.url + 'php/fwpaid.php',
			data: {
				message: msg
			}
		});
	},
	addRibbon: function(account, ribbon){
		$.ajax({
			url: app.url + 'php/fw-add-ribbon.php',
			data: {
				account: account,
				ribbon: ribbon
			}
		});
	},
	sendMsg: function(bypass){
		var msg = $DOM.titleChatInput.val().trim();
		// bypass via ENTER or chat has focus
		if (bypass || title.chatOn){
			if (msg){
				// is it a command?
				if (msg === '/friend'){
					title.listFriends();
				}
				else if (msg.indexOf('/friend ') === 0){
					title.toggleFriend(msg.slice(8));
				}
				else if (msg.indexOf('/unignore ') === 0){
					var account = msg.slice(10);
					title.removeIgnore(account);
				}
				else if (msg === '/ignore'){
					title.listIgnore();
				}
				else if (msg.indexOf('/ignore ') === 0){
					var account = msg.slice(8);
					title.addIgnore(account);
				}
				else if (msg.indexOf('/join ') === 0){
					title.changeChannel(msg, '/join ');
				}
				else if (msg.indexOf('#') === 0){
					title.changeChannel(msg, '#');
				}
				else if (msg.indexOf('/j ') === 0){
					title.changeChannel(msg, '/j ');
				}
				else if (msg.indexOf('@') === 0){
					title.sendWhisper(msg , '@');
				}
				else if (msg.indexOf('/who ') === 0){
					title.who(msg);
				}
				else if (msg.indexOf('/broadcast ') === 0){
					title.broadcast(msg);
				}
				else if (msg.indexOf('/closeApp') === 0){
					title.closeApp();
				}
				else if (msg.indexOf('/url ') === 0){
					title.url(msg);
				}
				else if (msg.indexOf('/img ') === 0){
					title.img(msg);
				}
				else if (msg.indexOf('/video ') === 0){
					title.video(msg);
				}
				else if (msg.indexOf('/fw-paid ') === 0){
					var account = msg.slice(8);
					title.fwpaid(account);
				}
				else if (msg.indexOf('/fw-add-ribbon ') === 0){
					var a = msg.split(" "),
						account = a[1],
						ribbon = a[2];
					title.addRibbon(account, ribbon);
				}
				else {
					if (msg.charAt(0) === '/' && msg.indexOf('/me') !== 0 || msg === '/me'){
						// skip
					}
					else {
						$.ajax({
							url: app.url + 'php/insertTitleChat.php',
							data: {
								message: msg
							}
						});
					}
				}
			}
			$DOM.titleChatInput.val('');
		}
	},
	listFriendsThrottle: 0,
	listFriends: function(){
		if (Date.now() - title.listFriendsThrottle < 5000) return;
		title.listFriendsThrottle = Date.now();
		var len = g.friends.length;
		g.chat('<div>Checking friends list...</div>');
		if (g.friends.length){
			$.ajax({
				url: app.url + 'php/friendStatus.php',
				data: {
					friends: g.friends
				}
			}).done(function(data){
				var str = '<div>Friend List ('+ len +')</div>';
				g.chat(str);
				for (var i=0; i<len; i++){
					var str = '',
						index = data.players.indexOf(g.friends[i]);
					if (index > -1){
						// online
						str += '<div><span class="chat-online titlePlayerAccount">' + g.friends[i] + '</span>';
						if (typeof data.locations[index] === 'number'){
							str += ' playing in game: ' + data.locations[index];
						} else {
							str += ' in chat channel: ';
							if (g.view === 'title'){
								// enable clicking to change channel
								str += '<span class="chat-online chat-join">' + data.locations[index] + '</span>';
							} else {
								// not in a game ?
								str += data.locations[index];
							}
						}
						console.info("ONLINE: ", str);
						str += '</div>';
						g.chat(str);
					} else {
						// offline
						console.info("OFFLINE: ");
						g.chat('<div><span class="chat-muted titlePlayerAccount">' + g.friends[i] +'</span></div>');
					}
				}
			});
		} else {
			g.chat("<div>You don't have any friends! Use /friend account to add a new friend.</div>", 'chat-muted');
		}
		$("#title-chat-input").focus();
	},
	showBackdrop: function(e){
		TweenMax.to('#titleViewBackdrop', .3, {
			startAt: {
				visibility: 'visible',
				alpha: 0
			},
			alpha: 1,
			onComplete: function(){
				if (e !== undefined){
					e.focus();
				}
			}
		});
		g.isModalOpen = true;
		var filter = {
			blur: 0
		};
		TweenMax.to(filter, .3, {
			blur: 3,
			onUpdate: function() {
				animate.blur('#mainWrap, #gameWrap', filter.blur);
			}
		});
	},
	toggleModal: function() {
		if (g.isModalOpen) {
			title.closeModal();
		}
		else {
			title.showModal();
		}
	},
	showModal: function() {
		TweenMax.to("#optionsModal", g.modalSpeed, {
			startAt: {
				visibility: 'visible',
				y: 0,
				alpha: 0
			},
			y: 30,
			alpha: 1
		});
		title.showBackdrop();
		var filter = {
			blur: 0
		};
		TweenMax.to(filter, .3, {
			blur: 3,
			onUpdate: function() {
				animate.blur('#mainWrap, #gameWrap', filter.blur);
			}
		});
	},
	closeModal: function(){
		TweenMax.set('.title-modals, #titleViewBackdrop', {
			alpha: 0,
			visibility: 'hidden'
		});
		g.isModalOpen = false;
		var filter = {
			blur: 3
		};
		TweenMax.to(filter, .3, {
			blur: 0,
			onUpdate: function() {
				animate.blur('#mainWrap, #gameWrap', filter.blur);
			}
		});
	},
	exitGame: function() {
		// exit from app
		title.closeGame();
		nw.App.closeAllWindows();
	},
	closeGame: function() {
		if (app.isApp) {
			var gui = require('nw.gui');
			// do things I should do before leaving the game
			my.account && socket.removePlayer(my.account);
			if (g.view === 'lobby') {
				exitGame();
			}
			else if (g.view === 'game') {
				surrender();
			}
		}
	},
	addCpu: 0,
	createGameFocus: false,
	createGame: function(){
		var name = $("#gameName").val().slice(0, 32),
			pw = $("#gamePassword").val(),
			max = $("#gamePlayers").val() * 1,
			speed = g.speed;
			
		if (!g.rankedMode && (max < 2 || max > 8 || max % 1 !== 0)){
			g.msg(lang[my.lang].notEnoughPlayers, 1);
		}
		else {
			title.createGameService(
				name,
				pw,
				title.mapData[g.map.key].name,
				max,
				g.rankedMode,
				g.teamMode,
				speed
			);
		}
	},
	openWindow: function(href) {
		if (app.isApp) {
			/*var gui = require('nw.gui'),
				win = gui.Window.open(href, {
					position: 'center',
					width: 1280,
					height: 720
				});*/
		}
	},
	configureNation: function() {
		TweenMax.to('#configureNation', g.modalSpeed, {
			startAt: {
				visibility: 'visible',
				y: 0,
				alpha: 0
			},
			y: 30,
			alpha: 1,
			onComplete: function() {
				title.setFlagDropdown();
			}
		});
		title.showBackdrop();
	},
	setFlagDropdown: function(id, random) {
		// populate dropdown
		id = id || 'flagDropdown';
		var s = "";
		if (random) {
			s += '<li class="flex-row flagSelect">'+
					'<a class="flex-1 no-select" data-flag="Random">'+ lang[my.lang].random +'</a>'+
				'</li>';
		}
		for (var key in g.flagData){
			s += "<li class='dropdown-header shadow4'>" + g.flagData[key].group + "</li>";
			g.flagData[key].name.forEach(function(e){
				s += "<li class='flex-row flagSelect'>" +
						"<img class='flag' src='images/flags/"+ e + ui.getFlagExt(e) +"'>" +
						"<a class='flex-1 no-select flag-name' data-flag='"+ e +"'>" + e + "</a>" +
					"</li>";
			});
		}
		$('#'+ id).html(s);
	},
	createGameService: function(name, pw, map, max, rankedMode, teamMode, speed){
		g.lock(1);
		g.rankedMode = rankedMode;
		g.teamMode = teamMode;
		// g.speed = speed;
		$.ajax({
			url: app.url + 'php/createGame.php',
			data: {
				name: name,
				pw: pw,
				map: map,
				max: max,
				rating: rankedMode,
				teamMode: teamMode,
				speed: speed
			}
		}).done(function(data) {
			console.info("Created Game: ", data);
			socket.publish.title.remove(my.account);
			my.player = data.player;
			my.playerColor = data.playerColor;
			my.team = data.team;
			game.id = data.gameId;
			game.name = data.gameName;
			game.mode = data.gameMode;
			game.password = data.password;
			// console.info("Creating: ", data);
			lobby.init(data);
			lobby.join(); // create
			socket.joinGame();
			lobby.styleStartGame();
		}).fail(function(e){
			g.msg(e.statusText);
		}).always(function() {
			g.unlock(1);
		});
	},
	joinGame: function(){
		g.name = $("#joinGame").val();
		if (!g.name){
			g.msg(lang[my.lang].gameNameNotValid, 1.5);
			$("#joinGame").focus().select();
			return;
		}
		g.password = $("#joinGamePassword").val();
		g.lock();
		audio.play('click');
		$.ajax({
			url: app.url + 'php/joinGame.php',
			data: {
				name: g.name,
				password: g.password
			}
		}).done(function(data){
			title.joinGameCallback(data);
		}).fail(function(data){
			console.info(data);
			g.msg(data.statusText, 1.5);
		}).always(function(){
			g.unlock();
		});
	},
	joinGameCallback: function(data){
		socket.publish.title.remove(my.account);
		// console.info(data);
		my.player = data.player;
		my.playerColor = data.player;
		g.teamMode = data.teamMode;
		g.rankedMode = data.rankedMode;
		my.team = data.team;
		game.id = data.id;
		game.name = data.gameName;
		g.map = data.mapData;
		// g.speed = data.speed;
		console.info('joinGameCallback', data);
		lobby.init(data);
		lobby.join(); // normal join
		//$("#titleMenu, #titleChat").remove();
		socket.joinGame();
	},
	submitNationName: function(){
		var x = $("#updateNationName").val();
		g.lock();
		audio.play('click');
		$.ajax({
			url: app.url + 'php/updateNationName.php',
			data: {
				name: x
			}
		}).done(function(name) {
			g.msg(lang[my.lang].newNationName + name);
			$("#updateNationName").val(name);
		}).fail(function(e){
			g.msg(e.statusText);
		}).always(function(){
			g.unlock();
		});
	}
};
(function(){
	var str = '';
	for (var key in title.mapData){
		str += "<li><a class='mapSelect' href='#'>" + title.mapData[key].name + "</a></li>";
	}
	var e1 = document.getElementById('mapDropdown');
	if (e1 !== null){
		e1.innerHTML = str;
	}
	if (isLoggedIn){
		$('[title]').tooltip({
			animation: false
		});
	}
})();