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
            <img :src="business.image_url">
            <span class="card-title"></span>
        </div>
        <div class="card-content">
            <p>{{ business.name }}</p>
        </div>
        <div class="card-action">
            <a href="#">{{ business.rating }}</a>
            <div class="right">
                <a href='#' class='btn' v-on:click="acceptRestaurant">Yes</a>
                <a href='#' class='btn' v-on:click="rejectRestaurant">No</a>
            </div>
        </div>
    </div>

    `,
    props: ['business', 'index'],
    methods: {
        rejectRestaurant: function() {

            let index = this.$options.propsData.index
            
            console.log(this);
            console.log(this.$options.propsData);

            if (v.businesses.length > 4) {
                // save one we delete or something var rejected = v.businesses[index]
                let newBusiness = v.businesses.splice(4, 1)[0];
                v.businesses[index] = newBusiness
            } else {
                v.businesses.splice(index, 1);
            }

        },
        acceptRestaurant: function() {
            console.log(this);
            console.log("accept");
        }
    }

})




Vue.component('results', {
    template: `

    <div>
        <div class="col s4" v-for="i in Math.min(businesses.length, 4)">
            <card
                v-bind:business="businesses[i-1]"
                v-bind:index="i-1">
            </card>
        </div>
    </div>
    `,
    props: ['businesses']
})

Vue.component('main-view', {
    template: `

    <div class="container">
        <div class="row">
            <preference></preference>
            <results v-bind:businesses="businesses"></results>
        </div>
    </div>

    `,
    props: ['businesses']
})

Vue.component('app', {
    template: `
  
    <div>
      <navbar></navbar>
      <main-view v-bind:businesses="businesses"></main-view>
    </div>
  
    `,
    props: ['businesses']
})

// create a root instance

const v = new Vue({
    el: '#root',
    data: {
        businesses: []
    },
})

function queryServer(q) {
    var server_url = 'http://127.0.0.1:5000/query';

    console.log(q);
    // send query
    $.get(server_url, {query: JSON.stringify(q)}, function (response, status) {
        if (status === "success") {
            console.log(response);

            // update result cards
            v.businesses = response.businesses;

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
        query.like.push(chip.tag);
        queryServer(query);
    });

    $('.chips-wlist').on('chip.delete', function(e, chip){
        query.like.splice(query.like.indexOf(chip.tag), 1);
        queryServer(query);
        // add filter on v.businesses
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
        queryServer(query);
    });


});