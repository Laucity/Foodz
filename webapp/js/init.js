(function($){
    $(function(){

        $('.button-collapse').sideNav();
        $('.parallax').parallax();

    }); // end of document ready
})(jQuery); // end of jQuery name space

$(document).ready(function() {
	
    Materialize.updateTextFields();

});

var auto_options = {
            'Apple': null,
            'Microsoft': null,
            'Google': null
            };

var cuisine_options = {
    'Thai': null,
    'Chinese': null,
    'Japanese': null,
    'Indian': null,
    'Fusion': null,
    'Burmese': null,
    'Italian': null,
    'French': null,
};

$('.chips-wlist').material_chip({
    autocompleteOptions: {
        placeholder: 'Enter a food/cuising you like',
        data: auto_options,
        limit: Infinity,
        minLength: 1
    }
});

$('.chips-blist').material_chip({
    autocompleteOptions: {
        placeholder: 'Enter a food/cuising you aren\'t feeling',
        data: auto_options,
        limit: Infinity,
        minLength: 1
    }
});