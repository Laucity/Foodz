(function($){
    $(function(){

        $('.button-collapse').sideNav();

    }); // end of document ready
})(jQuery); // end of jQuery name space

// Functions
function queryServer(query) {
    let server_url = 'http://127.0.0.1:5000/query';

    console.log(query);
    // send query
    $.get(server_url, {query: JSON.stringify(query)}, function (response, status) {
        if (status === "success") {

            // update result cards
            v.businesses = response.businesses;

        } else {
            console.log("FAILED SERVER REQUEST");
        }
        console.log(response);

    }, 'json');
}

function sendPreference(business, score) {
    let pref_url = 'http://127.0.0.1:5000/pref/preference';

    console.log(business)
    // send preference
    $.get(pref_url, {business: JSON.stringify(business), score: score}, function (response, status) {
        if (status === "success") {
            console.log("SENT SUCCESSFULLY")

        } else {
            console.log("FAILED POST REQUEST");
        }
        console.log(response);
    }, 'json');
}

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

Vue.component('carousel', {
    template: `

    <div class="carousel carousel-slider center height-250" data-indicators="true">
        <div class="carousel-fixed-item center">
          <a class="btn waves-effect green white-text darken-text-2" v-on:click="likeRestaurant">Like</a>
        </div>

        <div class="carousel-item">
            <img :src="business.image_url">
        </div>
        

        <div class="carousel-item" v-for="i in business.extra_details.photos.length-1">
            <img :src="business.extra_details.photos[i]">
        </div>


    </div>
    `,
    props: ['business', 'index'],
    methods: {
        likeRestaurant: function() {
            let index = this.$options.propsData.index;
            let liked_business = v.businesses[index];
            sendPreference(liked_business, 1);
            console.log("LIKED");
        }
    }
})

Vue.component('modal', {
    template: `

    <div :id=" 'modal' + index.toString() " class="modal">
        <div class="modal-content">
            <h4>{{ business.name }}</h4>
            <p>A bunch of text</p>
            <carousel
                v-bind:business="business"
                v-bind:index="index">
            </carousel>
        </div>
        <div class="modal-footer">
            <a href="#!" class="modal-action modal-close waves-effect waves-green btn-flat">Done</a>
        </div>
    </div>
    `,
    props: ['business', 'index']
})

Vue.component('card', {

    template: `

    <div class="card small">
        <div class="card-image img-full">
            <img :src="business.image_url">
            <div class="shader"></div>
            <span class="card-title zero-top">{{ business.name }}</span>
        </div>
        <div class="card-action">
            <a href="#">{{ business.rating }}</a>
            <div class="right">
                <a href='#!' class='btn' v-on:click="infoRestaurant">Info</a>
                <a href='#!' class='btn' v-on:click="rejectRestaurant">No</a>
            </div>
        </div>
        <modal 
            v-bind:business="business"
            v-bind:index="index">
        </modal>
    </div>
    `,
    props: ['business', 'index'],
    mounted: function () {
        $('.modal').modal({
            dismissible: true, // can be closed by clicking outside the modal
            opacity: .5, // Opacity of modal background
            inDuration: 300, // Transition in duration
            outDuration: 200, // Transition out duration
            startingTop: '4%', // Starting top style attribute
            endingTop: '10%', // Ending top style attribute
            ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
                console.log(modal, trigger);
            },
            complete: function() { 
                console.log('completed modal');
            } // Callback for Modal close
        });

        $('.carousel.carousel-slider').carousel({fullWidth: true});
    },
    methods: {
        rejectRestaurant: function() {

            let index = this.$options.propsData.index
            
            // save one we delete
            let rejected = v.businesses[index]

            if (v.businesses.length > 4) {
                // get the new business
                let newBusiness = v.businesses.splice(4, 1)[0];

                // replace the business
                v.businesses[index] = newBusiness


            } else {
                // remove the business
                v.businesses.splice(index, 1);
            }

            // send the rejected business to the server as preference a data point
            console.log("REJECTED")
            sendPreference(rejected, -1);
        },

        infoRestaurant: function() {

            let index = this.$options.propsData.index
            let modal_id = "#modal" + index.toString();

            $(modal_id).modal('open');
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