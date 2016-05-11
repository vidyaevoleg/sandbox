var planets = [
    { name : 'sun', radius : 0, color : 'yellow', period : 0, size : 60 },
    { name : 'mercury', radius : 50, texture: 'mercury', period : 0.002, size : 3 },
    { name : 'venera', radius : 80, texture: 'venera', period : 0.001, size : 4 },
    { name : 'earth', radius : 110, texture: 'earth', period : 0.001, size : 5, moons : [
        { name : 'moon-earth', radius : 10, color : 'white', period : 0.02, size : 3 }
    ]},
    { name : 'mars', radius : 150, texture : 'mars', period : 0.001, size : 3 },
    { name : 'jupiter', radius : 200, texture: 'jupiter', period : 0.0009, size : 10, moons_count: 60},
    { name : 'saturn', radius : 240, texture: 'saturn', period : 0.0005, size : 8, rings_count: 4},
    { name : 'uran', radius : 300,  texture: 'uran', period : 0.0003, size : 7, moons_count: 27 }
];

function generateData() {
    planets_count = planets.length;
    while (planets_count--) {

        planet = planets[planets_count];
        
        if (planet.moons_count) {
            addTo(planet, 'moons', planet.moons_count)
        }

        if (planet.rings_count) {
            addTo(planet, 'rings', planet.rings_count)
        }
    }

}

function addTo (_planet, object, count) {

    _planet[object] = [];

    while (count--) {
        ind = count;
        
        if (object == 'moons') {
            _planet[object].push(
                { 
                    name : 'moon-earth' + ind ,
                    radius : _planet.size + 0.02 * (ind + 10), 
                    color : 'white', 
                    period : 0.02, 
                    size : (ind + 1) * 0.05 
                }
            ) 
        } else if (object == 'rings') {
            _planet[object].push(
                {
                    name: 'ring-' + _planet.name + '-' + ind, 
                    delta_radius: 0.3 + 0.1 * ind, 
                    color: 'green'    
                }
            )
        }

        
    }

}


generateData();