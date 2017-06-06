(function($){
    $(function(){

        $('.button-collapse').sideNav();

    }); // end of document ready
})(jQuery); // end of jQuery name space

String.prototype.supplant = function (o) {
    return this.replace(/{([^{}]*)}/g,
        function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
    );
};

function buildCard(dict) {
    var template = "<div class=\"card small\"><div class=\"card-image\"><img src=\"{image_url}\"><span class=\"card-title\"></span></div><div class=\"card-content\"><p>{name}</p></div><div class=\"card-action\"><a href=\"#\">Make a Reservation</a></div></div>";
    return template.supplant(dict);
}

function queryServer(q) {
    var server_url = 'http://127.0.0.1:5000/query';
    // send query
    $.get(server_url, {query: JSON.stringify(q)}, function (response, status) {
        if (status === "success") {
            console.log(response);

            var businesses = response.businesses;

            $("#food_col_1").empty();
            $("#food_col_2").empty();

            $("#food_col_1").append(buildCard(businesses[0]));
            $("#food_col_1").append(buildCard(businesses[1]));
            $("#food_col_2").append(buildCard(businesses[3]));
            $("#food_col_2").append(buildCard(businesses[2]));


        } else {
            console.log("FAILED SERVER REQUEST")
            console.log(response);
        }
    }, 'json');
}

$(document).ready(function() {
	
    Materialize.updateTextFields();

    var query = {
        'lat': 37.868654,
        'long': -122.259153,
        'like': [],
        'dislike': [],
        'open_now': false,
        'price': ["1","2","3","4"]
    };


    function savePosition(position) {
        query.lat = position.coords.latitude;
        query.long = position.coords.longitude;
    }
    navigator.geolocation.getCurrentPosition(savePosition);

    console.log("BOY");
    queryServer(query);

    var cuisine_options = {
        'thai': null,
        'chinese': null,
        'japanese': null,
        'indian': null,
        'fusion': null,
        'burmese': null,
        'italian': null,
        'french': null,
    };

    $('.chips-wlist').material_chip({
        autocompleteOptions: {
            placeholder: 'Enter a food/cuisine you like',
            data: cuisine_options,
            limit: 3,
            minLength: 1
        }
    });

    $('.chips-blist').material_chip({
        autocompleteOptions: {
            placeholder: 'Enter a food/cuisine you aren\'t feeling',
            data: cuisine_options,
            limit: Infinity,
            minLength: 1
        }
    });

    $('.chips-wlist').on('chip.add', function(e, chip){
        console.log("ADDED LIKE");
        console.log(chip);
        query.like.push(chip.tag);
        console.log(query);
        queryServer(query);
    });

    $('.chips-wlist').on('chip.delete', function(e, chip){
        query.like.splice(query.like.indexOf(chip.tag), 1);
        queryServer(query);
    });

    $('.chips-blist').on('chip.add', function(e, chip){
        query.dislike.push(chip.tag);
        queryServer(query);
    });

    $('.chips-blist').on('chip.delete', function(e, chip){
        query.dislike.splice(query.dislike.indexOf(chip.tag), 1);
        queryServer(query);
    });

    $('#price').change(function(e) {
        if (e.originalEvent.target.checked) {
            query.price.push(e.originalEvent.target.id);
        } else {
            query.price.splice(query.price.indexOf(e.originalEvent.target.id), 1);
        }
        console.log(e.originalEvent.target.checked);
        console.log(query);

        queryServer(query);
    });


});