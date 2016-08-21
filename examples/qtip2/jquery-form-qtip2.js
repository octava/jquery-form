/**
 * Jquery Form Wrapper with qtip2
 */
(function (octava) {
    octava.JqueryFormQtip2 = function ($form, options) {
        options = (null !== options && typeof(options) == 'object') ? options : {};
        var self = new octava.JqueryForm($form, options);

        self.showMessage = function (response) {
            var html = [];
            console.log(response)
            if (true === response.success) {
                if (response.message) {
                    if (response.message) {
                        html = [
                            '<div class="alert alert-success octava-jquery-form-message">',
                            '<ul class="list-unstyled">',
                            '<li><span class="glyphicon glyphicon-info-sign"></span> ' + response.message + '</li>',
                            '</ul></div>'
                        ];
                        $form.prepend(html.join(''));
                    }
                }
            } else {
                var messages = [];
                for (var i in response.errors) if (response.errors.hasOwnProperty(i)) {
                    if (!response.errors[i].field) {
                        messages.push(response.errors[i].error);
                    }
                }
                if (messages.length > 0 || response.message) {
                    html = [
                        '<div class="alert alert-danger octava-jquery-form-message">',
                        '<ul class="list-unstyled">'
                    ];
                    if (response.message) {
                        html.push('<li><span class="glyphicon glyphicon-info-sign"></span> ' + response.message + '</li>');
                    }
                    for (i = 0; i < messages.length; i++) {
                        html.push('<li><span class="glyphicon glyphicon-exclamation-sign"></span> ' + messages[i] + '</li>');
                    }
                    html.push('</ul></div>');
                    $form.prepend(html.join(''));
                }
            }
        };

        self.showElementError = function (fieldName, error) {
            var $input = $form.find('[id="' + fieldName + '"]');

            $input.each(function () {
                showCustomError($(this), error);
            });
        };

        function showCustomError($element, error) {
            $element.qtip({
                content: {
                    text: error
                },
                position: {
                    my: 'bottom left',
                    at: 'top left',
                    adjust: {
                        x: 10
                    }
                },
                show: {
                    event: 'focus mouseenter',
                    ready: true
                },
                hide: {
                    event: 'unfocus mouseout blur'
                },
                style: {
                    classes: 'qtip-default qtip qtip-custom qtip-shadow qtip-rounded',
                    tip: {
                        corner: true,
                        mimic: 'center',
                        height: 8,
                        width: 10,
                        offset: 3
                    }
                }
            });
            $element.addClass('octava-jquery-form-element-error');

            $element
                .off('focusin.formValidationError')
                .on('focusin.formValidationError', function () {
                    var $element = $(this);
                    $element.removeClass('octava-jquery-form-element-error');
                    $element.qtip('toggle', false);
                });
        }

        self.clearErrors = function () {
            $form.find('.octava-jquery-form-error, .octava-jquery-form-message').remove();
            var $elements = $form.find('.octava-jquery-form-element-error');
            $elements.removeClass('octava-jquery-form-element-error');
            $elements.qtip('toggle', false);
        };

        self.startProgress = function () {
            var $button = $form.find('button[type=submit]:eq(0)'),
                content = $button.html();
            $button.html('<i class="fa fa-spinner fa-spin" aria-hidden="true"></i><div class="js-prev-content" style="display: none">' + content + '</div>');
        };

        self.stopProgress = function () {
            var $button = $form.find('button[type=submit]:eq(0)'),
                content = $button.find('.js-prev-content').html();
            $button.html(content);
        };

        self.constructor = arguments.callee;
        return self;
    };
})(octava);