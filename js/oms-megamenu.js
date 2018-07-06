
    (function ($) {
        Drupal.behaviors.oms_terlato_megamenu = {
            attach : function(context, settings) {

                /*
                 * Check if the window is sized to the specified Bootstrap breakpoint.
                 *
                 * @param string $alias The Bootstrap breakpoint [xs, sm, md, etc]
                 * @return boolean
                 * @see https://gist.github.com/maciej-gurban/9998047
                 */

                function isBreakpoint($alias)
                {
                    return $('.device-' + $alias).is(':visible');
                }

                /* ======================================== */
                /* Document Ready
                /* ======================================== */

                $(document).ready(function() {
                    
                    // Inits the bind on the main menu hover
                    if (isBreakpoint('md') || isBreakpoint('lg')) {
                        initMainMenuHover();
                    }

                });

                /* ======================================== */
                /* Window Resize
                /* ======================================== */

                $(window).resize(function($e) {

                    // on resize

                });
                
                
                
                
                
                /**
                 * Triggers rollover show dropdown-menu
                 */
                function initMainMenuHover()
                {

                    //var $link = $('#oms_megamenu li.dropdown');
                    var $link = $('#oms_megamenu li');
                    var $flyout = $('#omsMegaFlyout');
                    var onLink = false;

                    // Hovering over the link
                    // - populates the flyout with dropdown menu of this link
                    // - opens up the flyout
                    $link.on('hover', function() {
                        onLink = true;
                        var megaMenuLinks = $(this).find('div.megamenu ul').html();
                        if (megaMenuLinks != null) {
                            var countClass = $(this).find('span.colsCount').html();
                            $('#megaFlyoutContent').html('<ul class="item_count_'+ countClass +'">'+ megaMenuLinks +'</ul>');
                            $flyout.slideDown('fast').addClass('activeAndIn');
                        }
                    });
                    
                    // Leaving the Link
                    // - checks to see if on the flyout or not to keep flyout open
                    $link.on('mouseout', function() {
                        onLink = false;
                        $flyout.removeClass('activeAndIn');
                        setTimeout(function() {
                            if ( $flyout.hasClass('activeAndIn') == false ) {
                                $flyout.slideUp('fast');
                            }
                        }, 500);
                    });
                    
                    // Hovering over the flyout
                    // - closes flyout upon leaving it
                    $flyout.hover(
                        function() {
                            $(this).addClass('activeAndIn');
                        },
                        function() {
                            $(this).removeClass('activeAndIn');
                            
                            setTimeout(function() {
                                if (onLink == false) {
                                    $flyout.slideUp('fast');
                                }
                            }, 20);
                            
                        }
                    );
                }
                
                

            }
        };
    }(jQuery));
