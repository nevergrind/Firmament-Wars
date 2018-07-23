<?php
	// viewbox must match sizeX, sizeY
	$mapData = [];
	$mapData['AlphaEarth'] = (object) array(
		'name' => 'Alpha Earth',
		'key' => 'AlphaEarth',
		'tiles' => 143,
		'maxPlayers' => 8,
		'startTiles' => [135, 4, 65, 81, 100, 13, 73, 21],
		'sizeX' => 5299,
		'sizeY' => 2627,
		'tileNames' => array(
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
		)
	);
	$mapData['China'] = (object) [
		'name' => 'China',
		'key' => 'China',
		'tiles' => 126,
		'maxPlayers' => 6,
		'startTiles' => [94,110,119,125,51,16],
		'sizeX' => 4473,
		'sizeY' => 2525,
		'tileNames' => array(
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
		)
	];
	$mapData['EarthOmega'] = (object) array(
		'name' => 'Earth Omega',
		'key' => 'EarthOmega',
		'tiles' => 78,
		'maxPlayers' => 6,
		'startTiles' => [72, 5, 47, 77, 66, 8],
		'sizeX' => 4000,
		'sizeY' => 1900,
		'tileNames' => array(
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
		)
	);
	$mapData['EarthAlpha'] = (object) array(
		'name' => 'Earth Alpha',
		'key' => 'EarthAlpha',
		'tiles' => 83,
		'maxPlayers' => 8,
		'startTiles' => [40, 44, 58, 51, 5, 52, 63, 62],
		'sizeX' => 2800,
		'sizeY' => 1500,
		'tileNames' => array(
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
		)
	);
	$mapData['EuropeMena'] = (object) array(
		'name' => 'Europe Mena',
		'key' => 'EuropeMena',
		'tiles' => 137,
		'maxPlayers' => 8,
		'startTiles' => [40,56,134,31,107,86,114,96],
		'sizeX' => 5130,
		'sizeY' => 4132,
		'tileNames' => array(
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
		)
	);
	$mapData['FlatEarth'] = (object) array(
		'name' => 'Flat Earth',
		'key' => 'FlatEarth',
		'tiles' => 135,
		'maxPlayers' => 8,
		'startTiles' => [133,19,39,134,56,74,85,128],
		'sizeX' => 4623,
		'sizeY' => 4487,
		'tileNames' => array(
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
		)
	);
	$mapData['Germany'] = (object) array(
		'name' => 'Germany',
		'key' => 'Germany',
		'tiles' => 150,
		'maxPlayers' => 8,
		'startTiles' => [24, 6, 116, 75, 137, 66, 130, 43],
		'sizeX' => 3791,
		'sizeY' => 2939,
		'tileNames' => array(
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
		)
	);
	$mapData['France'] = (object) array(
		'name' => 'France',
		'key' => 'France',
		'tiles' => 81,
		'maxPlayers' => 8,
		'startTiles' => [34, 42, 38, 67, 78, 30, 63, 11],
		'sizeX' => 2720,
		'sizeY' => 1992,
		'tileNames' => array(
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
		)
	);
	$mapData['Italy'] = (object) array(
		'name' => 'Italy',
		'key' => 'Italy',
		'tiles' => 81,
		'maxPlayers' => 8,
		'startTiles' => [45, 39, 13, 29, 6, 9, 72, 73],
		'sizeX' => 2720,
		'sizeY' => 2406,
		'tileNames' => array(
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
		)
	);
	$mapData['Japan'] = (object) array(
		'name' => 'Japan',
		'key' => 'Japan',
		'tiles' => 47,
		'maxPlayers' => 2,
		'startTiles' => [11, 29],
		'sizeX' => 4081,
		'sizeY' => 3859,
		'tileNames' => array(
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
		)
	);
	$mapData['Turkey'] = (object) array(
		'name' => 'Turkey',
		'key' => 'Turkey',
		'tiles' => 75,
		'maxPlayers' => 4,
		'startTiles' => [56,40,65,9],
		'sizeX' => 3050,
		'sizeY' => 1480,
		'tileNames' => array(
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
		)
	);
	$mapData['UnitedKingdom'] = (object) array(
		'name' => 'United Kingdom',
		'key' => 'UnitedKingdom',
		'tiles' => 69,
		'maxPlayers' => 6,
		'startTiles' => [35, 52, 45, 62, 33, 38],
		'sizeX' => 2720,
		'sizeY' => 2600,
		'tileNames' => array(
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
		)
	);
	$mapData['UnitedStates'] = (object) array(
		'name' => 'United States',
		'key' => 'UnitedStates',
		'tiles' => 48,
		'maxPlayers' => 2,
		'startTiles' => [7, 28, 46],
		'sizeX' => 2720,
		'sizeY' => 1791,
		'tileNames' => array(
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
		)
	);
	$mapData['TEMPLATE'] = (object) [
		'name' => 'TEMPLATE',
		'key' => 'TEMPLATE',
		'tiles' => 99,
		'maxPlayers' => 8,
		'startTiles' => [0,1,2,3,4,5,6,7],
		'sizeX' => 2320,
		'sizeY' => 1280,
		'tileNames' => array(
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', //0
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX',
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', //10
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX',
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', //20
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX',
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', //30
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX',
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', //40
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX',
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', //50
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX',
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', //60
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX',
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', //70
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX',
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', //80
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX',
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', //90
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX',
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', //100
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX',
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', //110
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX',
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', //120
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX',
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', //130
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX',
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', //140
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX',
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', //150
		)
	];