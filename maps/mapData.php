<?php
	// viewbox must match sizeX, sizeY
	$mapData = [];
	$mapData['EarthAlpha'] = (object) array(
		'name' => 'Earth Alpha',
		'key' => 'EarthAlpha',
		'tiles' => 83,
		'maxPlayers' => 8,
		'startTiles' => [40, 44, 58, 51, 5, 52, 63, 62],
		'sizeX' => 2000,
		'sizeY' => 1100,
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
	$mapData['FlatEarth'] = (object) array(
		'name' => 'Flat Earth',
		'key' => 'FlatEarth',
		'tiles' => 78,
		'maxPlayers' => 8,
		'startTiles' => [13, 14, 52, 23, 54, 47, 36, 59],
		'sizeX' => 1920,
		'sizeY' => 1920,
		'tileNames' => array(
			'Santiago', 'Montevideo', 'Salvador', 'Sao Paolo', 'Amazon', //0
			'Georgetown', 'Los Angeles', 'Mexico City', 'Lima', 'Seattle', 
			'Chicago', 'New York', 'Bogota', 'Patagonia', 'Havana', //10
			'Anchorage', 'Edmonton', 'Iceland', 'Thule Air Base', 'Montreal', 
			'Irkutsk', 'Tomsk', 'Ural', 'Stockholm', 'Moscow', // 20
			'Warsaw', 'Madrid', 'Rabat', 'Bamako', 'Abuja', 
			'Kinshasa', 'Luanda', 'Johannesburg', 'Mogadishu', 'Addis Ababa', //30
			'Cairo', "Sana'a", 'Mecca', 'Tehran', 'Kabul', 
			'Singapore', 'Bangkok', 'Kamchatka', 'Ankara', 'Nairobi', // 40
			'Harare', 'Yakutsk', 'Antananorivo', 'Jerusalem', 'Athens', 
			'Berlin', 'Paris', 'London', 'Shanghai', 'Tokyo', //50
			'Hong Kong', 'Manila', 'Jakarta', 'Port Moresby', 'Wellington',
			'Perth', 'Sydney', 'Adelaide', 'Gibson Desert', 'Mumbai', // 60
			'Tbilisi', 'Tashkent', 'New Delhi', 'Kathmandu', 'Chongqing', 
			'Ulaanbaatar', 'Urumqi', 'Tibet', 'Tripoli', 'Algiers', // 70
			'Bangui', 'Lusaka', 'Gaborone'
		)
	);
	$mapData['UnitedStates'] = (object) array(
		'name' => 'United States',
		'key' => 'UnitedStates',
		'tiles' => 48,
		'maxPlayers' => 4,
		'startTiles' => [7, 1, 28, 46], 
		'sizeX' => 1920,
		'sizeY' => 1391,
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
	$mapData['France'] = (object) array(
		'name' => 'France',
		'key' => 'France',
		'tiles' => 81,
		'maxPlayers' => 8,
		'startTiles' => [19, 42, 38, 67, 78, 30, 63, 11],
		'sizeX' => 1920,
		'sizeY' => 1592,
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
		'sizeX' => 1920,
		'sizeY' => 2006,
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
		'maxPlayers' => 6,
		'startTiles' => [29, 11, 3, 16, 31, 14], 
		'sizeX' => 1920,
		'sizeY' => 1920,
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
		'maxPlayers' => 7,
		'startTiles' => [48,10,74,36,60,9,65],
		'sizeX' => 2250,
		'sizeY' => 1080,
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
		'tiles' => 70,
		'maxPlayers' => 7,
		'startTiles' => [0, 1, 2, 3, 4, 5, 6],
		'sizeX' => 1920,
		'sizeY' => 2200,
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
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX'
		)
	);
	$mapData['TEMPLATE'] = (object) array(
		'name' => 'TEMPLATE',
		'key' => 'TEMPLATE',
		'tiles' => 99,
		'maxPlayers' => 2,
		'startTiles' => [0, 1],
		'sizeX' => 1920,
		'sizeY' => 1080,
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
			'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX', 'XXXXXXXX'
		)
	);