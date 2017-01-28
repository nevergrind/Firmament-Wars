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
		'startTiles' => [9, 10, 13, 48, 53, 19, 32, 41],
		'sizeX' => 1600,
		'sizeY' => 1600,
		'tileNames' => array(
			'Santiago', 'Montevideo', 'Salvador', 'Sao Paolo', 'Amazon', 
			'Georgetown', 'San Francisco', 'Mexico City', 'Lima', 'Patagonia', 
			'Havana', 'Anchorage', 'Edmonton', 'Iceland', 'Thule Air Base', 
			'New York', 'Irkutsk', 'Ural', 'Moscow', 'Stockholm', 
			'Addis Ababa', 'Warsaw', 'Madrid', 'Rabat', 'Bamako', // 20
			'Abuja', 'Kinshasa', 'Luanda', 'Johannesburg', 'Mogadishu', 
			'Cairo', 'Oman', 'Sana\'a', 'Mecca', 'Tehran', 
			'Kabul', 'Singapore', 'Bangkok', 'Kamchatka', 'Seattle', 
			'Yakutsk', 'Antananorivo', 'Jerusalem', 'Athens', 'Berlin', // 40
			'Paris', 'London', 'Shanghai', 'Tokyo', 'Hong Kong', 
			'Manila', 'Jakarta', 'Port Moresby', 'Wellington', 'Perth', 
			'Sydney', 'Adelaide', 'Gibson Desert', 'Mumbai', 'Tashkent',
			'New Delhi', 'Kathmandu', 'Chongqing', 'Ulaanbaatar', 'Urumqi', // 60
			'Tibet', 'Tripoli', 'Algiers', 'Bangui', 'Gaborone', 
			'Lusaka', 'Tbilisi', 'Harare', 'Nairobi', 'Ankara', // 70
			'Bogota', 'Chicago', 'Washington'
		)
	);
	$mapData['UnitedStates'] = (object) array(
		'name' => 'United States',
		'key' => 'UnitedStates',
		'tiles' => 44,
		'maxPlayers' => 4,
		'startTiles' => [42, 25, 1, 7], 
		'sizeX' => 1491,
		'sizeY' => 1080,
		'tileNames' => array(
			'Massachusetts', 'Minnesota', 'Montana', 'North Dakota', 'Idaho', 
			'Washington', 'Arizona', 'California', 'Colorado', 'Nevada', 
			'New Mexico', 'Oregon', 'Utah', 'Wyoming', 'Arkansas', // 10
			'Iowa', 'Kansas', 'Missouri', 'Nebraska', 'Oklahoma', 
			'South Dakota', 'Louisiana', 'Texas', 'New Hampshire', 'Alabama', // 20
			'Florida', 'Georgia', 'Mississippi', 'South Carolina', 'Illinois', 
			'Indiana', 'Kentucky', 'North Carolina', 'Ohio', 'Tennessee', // 30
			'Virginia', 'Wisconsin', 'West Virginia', 'Maryland', 'New Jersey', 
			'New York', 'Pennsylvania', 'Maine', 'Michigan' // 40
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
			'Lyon', 'Charleville-Mézières', 'Toulouse', 'Châlons-en-Champagne', 'Narbonne', 
			'Saint-Flour', 'Haguenau', 'Marseille', 'Caen', 'Égletons', //10
			'Angoulême', 'Rochefort', 'Melun', 'Limoges', 'Ajaccio', 
			'Langres', 'Saint-Brieuc', 'La Souterraine', 'Cholet', 'Bergerac', //20
			'Besançon', 'Valence', 'Paris', 'Lisieux', 'Versailles', 
			'Brest', 'Nimes', 'Orthez', 'Bordeaux', 'Bastia', //30
			'Saint-Étienne', 'Bar-le-Duc', 'Langres', 'Thonon-les-Bains', 'Bellac', 
			'Briançon', 'Larrau', 'Montpellier', 'St-Malo', 'Châteauroux', //40
			'Tours', 'Grenoble', 'Champagnole', 'Sabres', 'Chartres', 
			'Lyon', 'Nantes', 'Évry', 'Montauban', 'Agen', //50
			'Le Puy', 'Angers', 'Saulces-Monclin', 'Gorron', 'Metz', 
			'Verdun', 'Lorient', 'Auxerre', 'Calais', 'Montdidier', //60
			'Évreux', 'Vichy', 'Bayonne', 'Perpignan', 'Dijon', 
			'Alençon', 'Meaux', 'Le Havre', 'Amiens', 'Rodez', //70
			'Mulhouse', 'Cannes', 'La Roche-sur-Yon', 'Poitiers', 'Nancy', 
			'Nangis' //80
		)
	);
	$mapData['Italy'] = (object) array(
		'name' => 'Italy',
		'key' => 'Italy',
		'tiles' => 81,
		'maxPlayers' => 8,
		'startTiles' => [0, 1, 2, 3, 4, 5, 6, 7],
		'sizeX' => 1920,
		'sizeY' => 2006,
		'tileNames' => array(
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //0
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //10
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //20
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //30
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //40
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //50
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //60
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //70
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //80
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //90
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax'
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
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //0
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //10
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //20
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //30
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //40
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //50
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //60
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //70
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //80
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', //90
			'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax', 'Oyonnax'
		)
	);