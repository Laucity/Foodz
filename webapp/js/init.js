(function($){
    $(function(){

        $('.button-collapse').sideNav();

    }); // end of document ready
})(jQuery); // end of jQuery name space

Vue.component('navbar', {
    template: `

      <nav class="white" role="navigation">
        <div class="nav-wrapper container">
          <a id="logo-container" href="#" class="brand-logo">Pulp</a>
          <ul class="right hide-on-med-and-down">
            <li><a id="contact-link" href="#">Settings</a></li>
          </ul>


          <ul id="nav-mobile" class="side-nav">
            <li><a id="contact-link-side" href="#">Settings</a></li>
          </ul>
          <a href="#" data-activates="nav-mobile" class="button-collapse"><i class="material-icons">menu</i></a>
        </div>
      </nav>
    `
})

Vue.component('preference', {
    template: `

      <div id='preferences' class="col s4">

        <br>
        <h5>I want</h5>
        <div id='wlist' class="chips chips-wlist"></div>

        <h5>I don't want</h5>
        <div id='blist' class="chips chips-blist"></div>

        <br>

        <!-- PRICE -->
        <div id='price'>
          <p>
            <input type="checkbox" id="1" checked="checked" />
            <label for="1">$</label>
          </p>
          <p>
            <input type="checkbox" id="2" checked="checked" />
            <label for="2">$$</label>
          </p>
          <p>
            <input type="checkbox" id="3" checked="checked" />
            <label for="3">$$$</label>
          </p>
          <p>
            <input type="checkbox" id="4" checked="checked" />
            <label for="4">$$$$</label>
          </p>
        </div>

        <br>

        <!-- WALKING DISTANCE -->
        <div class="switch">
          <label>
            
            <input id="walk" type="checkbox">
            <span class="lever"></span>
            Within walking distance
          </label>
        </div>
      
      </div>

    `
})

Vue.component('card', {
    template: `

    <div class="card small">
        <div class="card-image">
            <img :src="image_url">
            <span class="card-title"></span>
        </div>
        <div class="card-content">
            <p>{{ name }}</p>
        </div>
        <div class="card-action">
            <a href="#">{{ rating }}</a>
        </div>
    </div>

    `,

    data: () => {
        return {
            image_url: "https://s3-media2.fl.yelpcdn.com/bphoto/XwiV9HD8LRciCYCANDsUbA/o.jpg",
            name: "OMG RESTAURANT",
            rating: 3
        }
    }
})

Vue.component('results', {
    template: `

      <div class="col s4">
        <card></card>
      
      </div>

    `
})

Vue.component('main-view', {
    template: `

    <div class="container">
        <div class="row">
            <preference></preference>
            <results></results>
        </div>
    </div>

    `
})

Vue.component('app', {
    template: `
  
    <div>
      <navbar></navbar>
      <main-view></main-view>
    </div>
  
    `
})

// create a root instance
new Vue({
  el: '#root'
})

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
        'price': ["1","2","3","4"],
        'radius': 1000
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

    $('#walk').change(function () {
        query.radius = 900;
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