
    // Using the closure to map jQuery to $.
    (function ($) {

        // Store our functions as properties of Drupal.behaviors.
        Drupal.behaviors.orbit_theme = {
            attach: function (context, settings) {

                $(document).ready(function() {

                    // Initialize the Bootstrap mobile menu.
                    init_bootstrap_mobile_menu('#topWrapper nav ul');

                    // Checks on page load for a hash term on the blog listing page.
                    init_blog_term_hash();

                    // Scrolls to shipping block on detail page..
                    init_scrollto_shipping();

                    // Inits moves events calendar for mobile
                    init_move_events_calendar();

                    // Updates the "-Any-" option in the filter by dropdowns
                    // Product catalog is in oms-product-catalog.js
                    initListingFilterAnyText();

                    // After filtering scroll the user to the filters..
                    initFilteredJumpTo();

                    // User clicks reset filter link
                    initResetLink();

                    isLegalCookie();
                    
                    initNewsletterFormNames();

                });

            }
        };

        /**
         * Updates the name's on the newsletter signup form.
         *
         * These names need to be in place to work with eWinerys system.
         * 
         * @see https://bitbucket-assetroot.s3.amazonaws.com/orbitmedia/rutherford-hill/1434052982.43/31/ewinery-newsletter-signup-code.txt?Signature=n70XjqOxSOHjOTEptSOrqykXTew%3D&Expires=1434559027&AWSAccessKeyId=0EMWEFSGA12Z1HF1TZ82
         * @author Jessica <jessica@orbitmedia.com>
         */
        function initNewsletterFormNames()
        {
            if ( $('#webform-client-form-3220').length > 0 ) {
                var $form = $('#webform-client-form-3220');
                $form.find('input#edit-submitted-first-name').attr('name', 'FirstName');
                $form.find('input#edit-submitted-last-name').attr('name', 'LastName');
                $form.find('input#edit-submitted-email-address').attr('name', 'Email');
                $form.find('input#edit-submitted-zip-code').attr('name', 'ZipCode');
                $form.find('select#edit-submitted-state').attr('name', 'State');
            }
        }

        /**
         * Checks to see if the user is over 21, from initial popup on page load.
         * Sets cookie and then prevents the popup from occuring again.
         *
         * @author Andi <andi@orbitmedia.com>
         */
        function isLegalCookie()
        {
            url = window.location.href;
            $('#ageGate .yes').click(function(){
                currDomain = document.domain;
                $.cookie('is_legal', 'yes', { expires: 365, path: '/', domain: currDomain });
            });
            if ($.cookie('is_legal') != "yes") {
                $('#ageGate').modal({
                    show: true,
                    keyboard: false
                });
            }
        }


        /**
         * Scrolls to listing views after user selected the reset link.
         */
        function initFilteredJumpTo()
        {
            if ($.urlParam('tid') > 0) {
                $('html, body').animate({
                    scrollTop: $(".view-filters").offset().top
                }, 2000);
            }
        }

        /**
         * Trigger events for show and hide mobile calendar for the events listing pages.
         *
         * @return null
         * @author Jessica L.
         */
        function init_move_events_calendar()
        {

            // inits clicking on the show mobile calendar link
            $('#right').on('click', '#showCalendarLink', function() {

                var offset = $(this).offset();

                var $calendar = $('section#block-events-calendar-events-datepicker');

                $calendar.addClass('mobilenessCalendar').css('top', (offset.top-100) +'px');

                $('#stOverlay').show();

            });


            // inits close calendar event
            $('body.page-events, body.page-events-by-day').on('click', '#stOverlay', function() {
                $('#stOverlay').hide();
                $('section#block-events-calendar-events-datepicker').removeClass('mobilenessCalendar');
            });
        }

        /**
         * Inits scroll to on the product detail page to the shipping estimate form on bottom
         *
         * @return null
         * @author Jessica L.
         */
        function init_scrollto_shipping()
        {
        	$(".productDetailLink a").click(function() {
                $('html, body').animate({
                    scrollTop: $("#wineShippingWrapper").offset().top
                }, 2000);
            });
        }

        /**
         * Takes term hash in blog URL to populate and change category select option.
         * - then re-populates the results.
         *
         * @author Jessica L.
         */
        function init_blog_term_hash()
        {
            // checks if blog listings page..
            if ( $('#block-views-blog-listing-block').length > 0 ) {

                if (window.location.hash) {

                    // strips # out of hash
                    var hash = window.location.hash;
                    hash = hash.substr(1);

                    // finds term option with that hash
                    var optionVal = '';
                    $('select#edit-tid option').each(function() {

                        // the option name, stripped and full for compairing
                        var optionName = $(this).text().toLowerCase();
                        var optionNameDashes = optionName.replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');

                        // checks the option name against the hash
                        if (optionName == hash.toLowerCase() || optionNameDashes == hash.toLowerCase()) {
                            optionVal = $(this).val();
                            return false;
                        }

                    });

                    // changes the value of the select and go!
                    if (optionVal != '') {
                        $("select#edit-tid").val(optionVal).change();
                    }

                    // removes hash - so module doesn't run again and again and again
                    window.location.hash = '';

                }


            }
        }

        /**
         * Replaces the filter dropdowns with the text from their labels.
         * Formats as: - Any {label} -
         */

        function initListingFilterAnyText()
        {
            $('.view-blog-listing form .views-exposed-widget').each(function() {

                // find and replace filter dropdowns with special text..
                var any = $(this).find('option[value="All"]').text('- All Post Categories -');
                
                /* FORM SUBMIT ON CHANGE */
                $(this).find('select').change(function() {
                    $('.view-blog-listing').mask('loading...');
                });

            });

            $('.view-recipe-listing form .views-exposed-widget').each(function() {

                // find and replace filter dropdowns with special text..
                var any = $(this).find('option[value="All"]').text('- All Seasons -');
                
                /* FORM SUBMIT ON CHANGE */
                $(this).find('select').change(function() {
                    $('.view-recipe-listing').mask('loading...');
                });

            });
            
            $('.view-display-id-events .views-exposed-widget, .view-display-id-events_by_date .views-exposed-widget').each(function() {

                // find and replace filter dropdowns with special text..
                var any = $(this).find('option[value="All"]').text('- All Post Categories -');
                
                /* FORM SUBMIT ON CHANGE */
                $(this).find('select').change(function() {
                    $('.view-display-id-events, .view-display-id-events_by_date').mask('loading...');
                });

            });
        }

        /**
         * Inits the reset filter click, to reset the filters back to all and submit form
         * for this listing page.
         * DOES NOT WORK FOR PRODUCT CATALOG PAGES -- THATS IN oms-product-catalog.js.
         */
        function initResetLink()
        {
            $('#interiorContentWrapper').on('click', '.reset-filter', function() {

                // goes through each select value..
                $('.views-exposed-form .views-widget select.form-select').each(function() {
                    $(this).val('All').change();
                });
                
                return false;

            });
        }

        /**
         * Disable the Bootstrap dropdown functionality that comes with the
         * parent theme on a menu-by-menu basis.
         *
         * @return void
         * @author Jimmy K. <jimmy@orbitmedia.com>
         */

        function disable_bootstrap_dropdown($selector)
        {

            // Get the element using the selector.
            $element = $($selector);

            // Remove all `dropdown` classes from children LI elements.
            $('li', $element).removeClass('dropdown');

            // Remove all elements with `caret` classes.
            $('.caret', $element).remove();

            // Remove all `data`-related attributes from link elements.
            $('a', $element)
                .removeAttr('data-target')
                .removeAttr('data-toggle')
                .removeClass('dropdown-toggle')
            ;

        }

        /**
         * Initialize the Bootstrap mobile menu.
         *
         * @param $selector The top-most UL to traverse.
         *
         * @return void
         * @author Jimmy K. <jimmy@orbitmedia.com>
         * @author Brian Bass <brian@orbitmedia.com>
         * @author Erin Byrne <erin@orbitmedia.com>
         */

        function init_bootstrap_mobile_menu($selector)
        {

            /* ======================================== */
            /* JIMMY 07/30/14:
            /* ADD DROPDOWN CLASSES AND CARET TO CHILD ELEMENTS.
            /* ======================================== */

            $($selector).each(function() {

                // Add the "nav" class to the ul.
                $(this).addClass('nav');

                $('> li', $(this)).each(function() {

                    if ($('> ul', $(this)).length > 0) {
                        // Add the "dropdown" class so Bootstrap knows it's a dropdown.
                        $(this).addClass('dropdown');
                        // Add the "dropdown-menu" class so Bootstrap knows which child to open.
                        $('> ul', $(this)).addClass('dropdown-menu');
                        // Add the caret so users have something to click.
                        $('> a', $(this)).first().after('<a class="dropdown-toggle" data-toggle="dropdown" data-target="#"><b class="caret"></b></a>');
                    }

                });

            });

            /* ======================================== */
            /* JIMMY: 08/01/14:
            /* SET ACTIVE-TRAIL CLASS FOR PARENT LI ELEMENTS.
            /* ======================================== */

            $('a.active', $selector).each(function() {
                // Add the "active-trail" class for each parent li.
                $(this).parents('li')
                    .addClass('active-trail')
                    .addClass('open')
                ;
            });

            /* ======================================== */
            /* ERIN & BRIAN 02/24/2014:
            /* PRESERVE OPEN DROPDOWNS ON BOOTSTRAP 3.1.1
            /* ======================================== */

            jQuery('[data-toggle=dropdown], [data-toggle=collapse]').on('click',  function(){
                jQuery(document).data('bs-nav-closable', true);
                jQuery(".open").not(jQuery(this).parent()).addClass("toggle-lock");

                setTimeout(function() {
                  jQuery(".toggle-lock").addClass("open");
                  jQuery(".open").removeClass("toggle-lock");
                  jQuery(document).data('bs-nav-closable', false);
                  return false;
                }, 0);

            });

            jQuery(document).data('bs-nav-closable', false);

            jQuery(document).on({
                "shown.bs.dropdown": function() { jQuery(this).data('bs-nav-closable', false); },
                "click":             function() { jQuery(this).data('bs-nav-closable', false); },
                "hide.bs.dropdown":  function() { return jQuery(this).data('bs-nav-closable'); }
            });

        }

    }(jQuery));
