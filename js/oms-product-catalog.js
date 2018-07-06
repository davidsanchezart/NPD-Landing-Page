
    (function ($) {
        Drupal.behaviors.oms_product_catalog = {
            attach : function(context, settings) {

                /* ======================================== */
                /* Window Ready
                /* ======================================== */
                
                $(window).load(function() {

                    // - If a product listing page, with an exposed form ...
                    if ( $('.view-product-facets').length > 0 ) {
                    
                        // if the page has no prods available..
                        initCheckToResetPrdoucts();

                        // Inits the change of the sorting to trigger the hidden sorting dropdowns
                        initProdCatSorting();
                        
                        // Resets all fitlers
                        initProdCatResetFilters();

                    }

                    // SHIPPINGSTATE dropdown on the cart
                    initCartShippingDropdown();
                    
                    // Inits the ship to state popup
                    init_ship_to_state();

                });

                /* ======================================== */
                /* Document Ready
                /* ======================================== */

                $(document).ready(function() {

                    // for the admin to delete the ship state cookie
                    if (window.location.hash == '#deletecookies') {
                        delete_cookie('SHIPPINGSTATE');
                        delete_cookie('is_legal');
                    }

                    // Product Catalog
                    // - If a product listing page, with an exposed form ...
                    if ( $('.view-product-facets').length > 0 ) {

                        // Adds class if a product catalog page
                        //$('body').addClass('product-catalog');

                        // Updates the "-Any-" option in the filter by dropdowns
                        initProdCatFilterAnyText();

                        // Jumps to listing after reset is selected
                        //initResetJumpTo();

                    }
                    
                    // Initialize the select product action on the detail page.
                    init_product_select();
                    
                    // Adds reset link after a selection has been made
                    initTogglesResetLink();
                        
                    // Quickshop
                    // - Displays quickshop on product rollover
                    initDisplayQuickShop();
                    
                    // Shipping Estimate Qty Left Message
                    // - Moves the hidden qty left total to the msg header area
                    initShippingEstQtyLeftMsg();

                    // Disables line item radio's that are not in stock
                    initSoldOutProductOptions();

                });

                /* ======================================== */
                /* Window Resize
                /* ======================================== */

                $(window).resize(function($e) {

                    // on resize

                });


                /* ======================================== */
                /* shipping to state popup functions
                /* ======================================== */

                /**
                 * Popuplates and updates the SHIPPINGSTATE cookie on the cart before the user checks out.
                 *
                 * @author Jessica L. <jessica@orbitmedia.com>
                 */
                function initCartShippingDropdown()
                {

                    // populates the #cartShippingSelect div on the page--cart.tpl.php file
                    // of the state options from the hidden popup
                    var selectHTML = $('.form-item-field-shipping-states-tid-selective').html();
                    $('#cartShippingSelect').html(selectHTML);

                    // dynamically adds pickup at winery option to state dropdown
                    var $state_select = $('#cartShippingSelect select');
                    $state_select.prepend($('<option/>', { 
                        value: 'WC',
                        text : 'Pickup At Winery' 
                    }));
                    $state_select.find('option[value="All"]').remove();

                    // populates the disclaimer txt
                    var disclaimerTXT = $('.disclaimerCol').html();
                    $('#cartShippingSelectDisclaimer').html(disclaimerTXT);
                    
                    // auto selects the shipping state dropdown
                    var state_id = $.cookie('SHIPPINGSTATEID');
                    $('#cartShippingSelect select').val(state_id);
                    $('#edit-field-shipping-states-tid-selective').val(state_id).trigger('change');

                    // on state change on the cart, then update the shippingstate cookie
                    $('body').on('change', '#cartShippingSelect select', function() {
                    
                        // sets SHIPPINGSTATE cookies
                        var $this = $(this);
                        var state = $this.children('option:selected').text();
                        var id = $this.children('option:selected').val();
                        set_shippingstate_cookie(state, id);

                        // auto selects the shipping est. form below
                        if ($.isNumeric(id)) {
                            $('body .form-item-field-shipping-states-tid-selective select').val(id).trigger('change');
                        }
                        
                    });

                }

                /**
                 * Actions on page load for the shipping to state popup.
                 * This popup gets called when the user first adds a product to the cart,
                 * it checks for a set jquery cookie, and if no cookie is set then displays the popup.
                 * The popup will be populated by a state dropdown via views "shipping estimate form > Ship To States".
                 * If the "All" option is selected the "views-footer" div gets hidden, which holds the Continue button.
                 */
                function init_ship_to_state()
                {

                    // find and replace filter dropdown with their label text
                    initShipToStateAnyText();

                    // adds class to wrapper to show/hide continue btn bases on
                    // selected state
                    initShipToSelectedStateContinue();


                    var shipToBtn = '#shipToContinue';
                    var $shipToBtn = $(shipToBtn);
                    var stateSelect = '#edit-field-shipping-states-tid-selective';
                    var pickupAtWineryBtn = '#pickupAtWineryBtn';
                    var $pickupAtWineryBtn = $(pickupAtWineryBtn);

                    // User adds product to cart
                    $('form.commerce-add-to-cart').submit(function(e) {

                       var state_cookie = $.cookie('SHIPPINGSTATE');

                       if ( state_cookie == "All" || typeof state_cookie == 'undefined') {

                           var formid = $(this).attr('id');
                           $('#shipToPopup').attr('data-type', 'add-to-cart-form').attr('data-type-id', formid);

                           $('#terlatoOverlay, #shipToPopup').show();

                           return false;
                        }

                    });

                    // User selects a state, adds mask to prevent user from clicking the continue btn to soon
                    $(document).on('change', stateSelect, function(e) {
                      $('.view-shipping-estimate-form').mask('loading...');
                    });

                    // User clicks on the "Continue" button
                    $('body').on('click', shipToBtn, function() {
                    
                        var $view = $(this).parents('.view');

                        //var state = $(this).find('#edit-field-shipping-states-tid-selective option:selected').text();
                        
                        var state = $view.find('select#edit-field-shipping-states-tid-selective option:selected').text();
                        var id    = $view.find('select#edit-field-shipping-states-tid-selective option:selected').val();
                        
                        set_shippingstate_cookie(state, id);
                        
                        var formid = $('#shipToPopup').attr('data-type-id');
                        $('form#' + formid).submit();

                    });
                    
                    // User clicks on the "Pick Up at Ewinery" button
                    $('body').on('click', pickupAtWineryBtn, function() {

                        set_shippingstate_cookie('WC', '');
                        
                        var formid = $('#shipToPopup').attr('data-type-id');
                        $('form#' + formid).submit();
                    });

                    // Inits close on the shiptopopup
                    $('#shipToPopup').on('click', '.overlay-close', function() {
                        $('#shipToPopup, #terlatoOverlay').hide();
                    });

                }

                /**
                 * Function that actually sets the shippingstate cookie.
                 *
                 * @param string  name  The full name of the state to set cookie for.
                 */
                function set_shippingstate_cookie(state, id)
                {
                    if (id == "WC") {
                        state = "WC";
                    }
                    
                    // if it's not pick up in store, WC - then find the states abbreviation.
                    var abbr = state;
                    if (state != "WC") {
                        var abbr = convert_state(state, 'abbrev');
                    }
                    $.cookie('SHIPPINGSTATE', abbr, { expires: 365, path: '/', domain: '.terlatofamilyvineyards.com' });
                    $.cookie('SHIPPINGSTATEID', id, { expires: 365, path: '/', domain: '.terlatofamilyvineyards.com' });
                }

                /**
                 * For the admin when testing to delete the site cookie.
                 *
                 * @param string  name  The name of the js cookie to delete.
                 */
                function delete_cookie( name ) {
                    currDomain = document.domain;
                    $.cookie(name, '', { expires: -365, path: '/', domain: currDomain });
                }

                /**
                 * Checks for the selected state on inital call and after each state change.
                 */
                function initShipToSelectedStateContinue()
                {

                    var state = $('.view-display-id-ship_to_states #edit-field-shipping-states-tid-selective option:selected').val();
                    
                    updatesShipToWrapperofSelState(state);

                    // inits on select change by the user
                    $('body').on('change', 'select#edit-field-shipping-states-tid-selective', function() {

                        updatesShipToWrapperofSelState($(this).val());

                    });

                }

                /**
                 * Removes all classes from the wraper and replaces it with the selected state.
                 */
                function updatesShipToWrapperofSelState(state)
                {
                	$('#shipToContent').removeClass().addClass('state-' + state);
                }

                /**
                 * Graps the filter label and populates the "- Any -" option with that wordage.
                 */
                function initShipToStateAnyText()
                {

                    // find and replace filter dropdown with their label text..
                    var $choosestate = $('.view-display-id-ship_to_states .views-exposed-widget');
                    var label = $choosestate.find('label').text();
                    $choosestate.find('option[value="All"]').text('- ' + label + ' -');

                }

                /* ======================================== */
                /* /shipping to state popup functions
                /* ======================================== */


                /* ======================================== */
                /* portfolio facet functions
                /* ======================================== */

                /**
                 * Fixes the remembering last selection bug,
                 * when you select a filter then go to a page w/o
                 * that filter then it'll say no products found,
                 * and you have no idea why.
                 *
                 * This will check if any products exist, and if not,
                 * then resubmit filter form, to view all.
                 *
                 * @author Jessica <jessica@orbitmedia.com>
                 */
                function initCheckToResetPrdoucts()
                {
                    if ( $('#productListingsHolder .view-empty').length > 0 ) {
                        productCatSubmit();
                    }
                }

                /**
                 * Scrolls to listing views after user selected the reset link.
                 */
                function initResetJumpTo()
                {
                    if ( $.urlParam('reset') == 1 && document.location.hash != '#reset') {
                        document.location.hash = '#reset';
                        $('html, body').animate({
                            scrollTop: $("#contentBottom").offset().top
                        }, 2000);
                    }
                }

                /**
                 * Grabs the value of the get param
                 */
                 $.urlParam = function(name){
                    var results = new RegExp('[\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
                    if (results) return results[1] || 0;
                }

                /**
                 * Replaces the filter dropdowns with the text from their labels.
                 * Formats as: - Any {label} -
                 */
                function initProdCatFilterAnyText()
                {
                    $('.view-product-facets .views-exposed-widget').each(function() {
                        
                        var $this = $(this);
                        
                        // find and replace filter dropdowns with their label text..
                        var label = $this.find('label').text();
                        var any = $this.find('option[value="All"]').text('- ' + label + ' -');
                        
                        /* FORM SUBMIT ON CHANGE */
                        $this.find('.views-widget select').change(function() {
                            productCatSubmit();
                        });
                        
                    });
                }

                /**
                 * Moves the sorting selects to below the header area
                 */
                function initProdCatSorting()
                {
                
                    // Inits the change of the visible select and calls the hidden/working select..
                    //$('.sortingHolder').on('change', 'select#combinedSort', function() {
                    $('#interiorContentWrapper').on('change', '.sortingHolder select', function() {

                        var value = $(this).val();
                        var values = value.split(':');

                        $("select#edit-sort-by").val(values[0]).change();
                        $("select#edit-sort-order").val(values[1]).change();

                        /* FORM SUBMIT */
                        productCatSubmit();
                    });
                }

                /**
                 * Submits the form, on select change.
                 */
                function productCatSubmit()
                {

                    // masking..
                    $('.view-product-facets').mask('loading..');

                    // submits form
                    $('#edit-submit-product-facets').click();

                }

                /**
                 * Inits the reset filter click, to reset the filters back to all and submit form
                 * for the product catalog page.
                 */
                function initProdCatResetFilters()
                {
                    $('#interiorContentWrapper').on('click', '.reset-filters', function() {

                        // goes through each select value..
                        $('.views-exposed-form .views-widget select.form-select').each(function() {
                            $(this).val('All');
                        });
                        
                        productCatSubmit();
                        
                        return false;

                    });
                }

                /**
                 * Checks to see if any of the filters have been selected,
                 * if so, then show the reset link.
                 */
                function initTogglesResetLink()
                {
                	var each_value = '';
                    var has_selection = false;

                    // goes through each select value..
                    $('.views-exposed-form .views-widget select.form-select').each(function() {

                        each_value = $(this).val();
                        if (each_value != 'All') {
                            has_selection = true;
                            return false;
                        }

                    });

                    // checks to see if there has been a selection,
                    // then shows or hides reset filter link.
                    var $resetlink = $('a.reset-filters, a.reset-filter');
                    if (has_selection == true) {
                        $resetlink.css('display', 'block');
                    } else {
                        $resetlink.hide();
                    }
                }

                /* ======================================== */
                /* /portfolio facet functions
                /* ======================================== */

                /**
                 * Adds disabled class on the radio/label row
                 * if the product option is set to "not in stock".
                 * This is decided by the message that gets applied to the option in..
                 * @see oms_terlato.php > oms_terlato_render_add_to_cart_label().
                 */
                function initSoldOutProductOptions()
                {
                	if ( $('.commerce-add-to-cart').length > 0 ) {
                	   
                	   $('.commerce-add-to-cart .form-item-product-id').each(function(e) {
                	       var $this = $(this);
                	       var label = $this.children('label').html();
                	       if (label.indexOf("soldoutMsg") >= 0) {
                	           $this.children('input:radio').attr('disabled', true);
                	           $this.addClass('disabledOption');
                	       }
                	   });
                	}
                }

                /**
                 * Animates the prouct quickshop on rollover
                 */
                function initDisplayQuickShop()
                {
                	$('.view-product-listing .views-row, .field-name-field-related-products .field-item').hover(
                        function() {
                            $(this).find('.quickshop').fadeIn(200);
                        },
                        function() {
                            $(this).find('.quickshop').fadeOut(100);
                        }
                    );
                    
                    $('.quickshopClose').click(function() {
                        $(this).parent().fadeOut(100);
                    });
                    
                    $('.productCategoryImage, .productTitle').click(function() {
                        var $quickshop = $(this).siblings('.quickshop');
                        if ($quickshop.length > 0) {
                            $quickshop.fadeIn(200);
                            return false;
                        }
                    });
                }
                
                function initLoadMoreAjax()
                {
                    $("form.commerce-add-to-cart").each(function(){
                      $(this).attr("action",window.location.pathname);
                    });
                }

                /**
                 * Moves the hidden qty to the shipping est qty left message.
                 * 
                 * Checks if qty is 1 or greater, then displays the message,
                 * else hides the message from appearing.
                 */
                function initShippingEstQtyLeftMsg()
                {
                    if ( $('#shippingQtyLeft').length > 0 ) {
                        var shippingQtyLeft = $('#shippingQtyLeft').text();
                        $('.shippingQtyLeftDisplay').text(shippingQtyLeft);
                        $('.shipping-qty-message').show();
                    }
                }

                /**
                 * Redirects to the selected product option.
                 *
                 * @return null
                 * @author Jessica L.
                 */
                function init_product_select()
                {
                    if ( $('select#groupedProducts').length > 0 ) {
                        $('select#groupedProducts').change(function() {
                            var goToUrl = $(this).val();
                            window.location = '/' + goToUrl;
                        });
                    }
                }
                
                
                function convert_state(name, to) {
                    var name = name.toUpperCase();
                    var states = new Array(                         {'name':'Alabama', 'abbrev':'AL'},          {'name':'Alaska', 'abbrev':'AK'},
                        {'name':'Arizona', 'abbrev':'AZ'},          {'name':'Arkansas', 'abbrev':'AR'},         {'name':'California', 'abbrev':'CA'},
                        {'name':'Colorado', 'abbrev':'CO'},         {'name':'Connecticut', 'abbrev':'CT'},      {'name':'Delaware', 'abbrev':'DE'},
                        {'name':'Florida', 'abbrev':'FL'},          {'name':'Georgia', 'abbrev':'GA'},          {'name':'Hawaii', 'abbrev':'HI'},
                        {'name':'Idaho', 'abbrev':'ID'},            {'name':'Illinois', 'abbrev':'IL'},         {'name':'Indiana', 'abbrev':'IN'},
                        {'name':'Iowa', 'abbrev':'IA'},             {'name':'Kansas', 'abbrev':'KS'},           {'name':'Kentucky', 'abbrev':'KY'},
                        {'name':'Louisiana', 'abbrev':'LA'},        {'name':'Maine', 'abbrev':'ME'},            {'name':'Maryland', 'abbrev':'MD'},
                        {'name':'Massachusetts', 'abbrev':'MA'},    {'name':'Michigan', 'abbrev':'MI'},         {'name':'Minnesota', 'abbrev':'MN'},
                        {'name':'Mississippi', 'abbrev':'MS'},      {'name':'Missouri', 'abbrev':'MO'},         {'name':'Montana', 'abbrev':'MT'},
                        {'name':'Nebraska', 'abbrev':'NE'},         {'name':'Nevada', 'abbrev':'NV'},           {'name':'New Hampshire', 'abbrev':'NH'},
                        {'name':'New Jersey', 'abbrev':'NJ'},       {'name':'New Mexico', 'abbrev':'NM'},       {'name':'New York', 'abbrev':'NY'},
                        {'name':'North Carolina', 'abbrev':'NC'},   {'name':'North Dakota', 'abbrev':'ND'},     {'name':'Ohio', 'abbrev':'OH'},
                        {'name':'Oklahoma', 'abbrev':'OK'},         {'name':'Oregon', 'abbrev':'OR'},           {'name':'Pennsylvania', 'abbrev':'PA'},
                        {'name':'Rhode Island', 'abbrev':'RI'},     {'name':'South Carolina', 'abbrev':'SC'},   {'name':'South Dakota', 'abbrev':'SD'},
                        {'name':'Tennessee', 'abbrev':'TN'},        {'name':'Texas', 'abbrev':'TX'},            {'name':'Utah', 'abbrev':'UT'},
                        {'name':'Vermont', 'abbrev':'VT'},          {'name':'Virginia', 'abbrev':'VA'},         {'name':'Washington', 'abbrev':'WA'},
                        {'name':'West Virginia', 'abbrev':'WV'},    {'name':'Wisconsin', 'abbrev':'WI'},        {'name':'Wyoming', 'abbrev':'WY'}
                        );
                    var returnthis = false;
                    $.each(states, function(index, value){
                        if (to == 'name') {
                            if (value.abbrev == name){
                                returnthis = value.name;
                                return false;
                            }
                        } else if (to == 'abbrev') {
                            if (value.name.toUpperCase() == name){
                                returnthis = value.abbrev;
                                return false;
                            }
                        }
                    });
                    return returnthis;
                }

            }
        
        };
    }(jQuery));
