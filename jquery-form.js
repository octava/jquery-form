/**
 * Base Octava object
 */
var octava = (function (scope) {
    if (undefined === scope.octava) {
        scope.octava = {};
    }
    return scope.octava;
})(this);

/**
 * Jquery Form Wrapper
 */
(function (octava) {
    octava.JqueryForm = function ($form, userOptions) {
        var self = this,
            submitCallback,
            successCallback,
            redirectCallback,
            errorCallback,
            beforeFatalErrorCallback,
            fatalErrorCallback,
            disabledInputs = [];

        this.onSubmit = function (submitFunc) {
            submitCallback = submitFunc;
            return this;
        };

        this.onSuccess = function (successFunc) {
            successCallback = successFunc;
            return this;
        };

        this.onRedirect = function (redirectFunc) {
            redirectCallback = redirectFunc;
            return this;
        };

        this.onError = function (errorFunc) {
            errorCallback = errorFunc;
            return this;
        };

        this.onBeforeFatalError = function (beforeFatalErrorFunc) {
            beforeFatalErrorCallback = beforeFatalErrorFunc;
            return this;
        };

        this.onFatalError = function (fatalErrorFunc) {
            fatalErrorCallback = fatalErrorFunc;
            return this;
        };

        this.showErrors = function (response) {
            for (var i = 0; i < response.errors.length; i++) {
                this.showElementError(response.errors[i]['field'], response.errors[i]['error']);
            }
        };

        this.showMessage = function (response) {
            if (response.message) {
                var $error = $(this.getMessage(response.message));
                $error.prependTo($form);
            }
        };

        this.scrollToError = function () {
            var $error = $form.find('.octava-jquery-form-error');
            if ($error.length > 0) {
                $('html, body').animate({
                    scrollTop: $error.parent().offset().top - 10
                }, 500);
            }
        };

        this.getMessage = function (message) {
            return '<span class="octava-jquery-form-message">' + message + '</span>';
        };

        this.getError = function (error) {
            return '<span class="octava-jquery-form-error">' + error + '</span>';
        };

        this.getForm = function() {
            return $form;
        };

        this.showElementError = function (fieldId, error) {
            var $input = $form.find('[id="' + fieldId + '"]');

            $input.after(this.getError(error));
        };

        this.reloadCaptcha = function () {
            $form.find('[data-captcha]').each(function () {
                var $this = $(this),
                    src = $this.attr('src'),
                    a = src.split(/\?/, 2);
                src = a[0] + '?' + (new Date()).getTime();
                $this.attr('src', src);
                $this.parent().find('input').val('');
            });
        };

        this.clearErrors = function () {
            $form.find('.octava-jquery-form-error,.octava-jquery-form-message').remove();
            $form.find('.octava-jquery-form-element-error').removeClass('octava-jquery-form-element-error');
        };

        this.disableForm = function () {
            $form.find('input,select,textarea,button').each(function () {
                var $input = $(this);
                if (!$input.is(':disabled')) {
                    $input.attr('disabled', 'disabled');
                    disabledInputs.push($input);
                }
            });
        };

        this.enableForm = function () {
            for (var i = 0; i < disabledInputs.length; i++) {
                disabledInputs[i].removeAttr('disabled');
            }
            disabledInputs = [];
        };

        this.startProgress = function () {
        };

        this.stopProgress = function () {
        };

        var labels = {
                'service_unavailable': 'Service unavailable',
                'session_expired': 'Session expired',
                'access_denied': 'Access denied'
            },
            options = {
                autoEnableForm: true,
                enableFormDelay: 0,
                stopProgressDelay: 0,
                labels: labels,
                success: function (response) {
                    if (true === response.success) {
                        if ($.isFunction(successCallback)) {
                            if (false === successCallback(response, self)) {
                                return;
                            }
                        }
                        if (response.redirect) {
                            if ($.isFunction(redirectCallback)) {
                                if (false === redirectCallback(response, self)) {
                                    return;
                                }
                            } else {
                                location.href = response.redirect;
                                return;
                            }
                        }
                        setTimeout(self.stopProgress, this.stopProgressDelay);
                        setTimeout(self.enableForm, this.enableFormDelay);
                        self.showMessage(response);
                    } else if (false === response.success) {
                        if ($.isFunction(errorCallback)) {
                            if (false === errorCallback(response, self)) {
                                return;
                            }
                        }
                        setTimeout(self.stopProgress, this.stopProgressDelay);
                        setTimeout(self.enableForm, this.enableFormDelay);
                        self.showMessage(response);
                        self.showErrors(response);
                        self.scrollToError();
                    } else {
                        if ($.isFunction(fatalErrorCallback)) {
                            if (false === fatalErrorCallback(response, self)) {
                                return;
                            }
                        }
                        setTimeout(self.stopProgress, this.stopProgressDelay);
                        setTimeout(self.enableForm, this.enableFormDelay);
                        self.showMessage({error: labels.service_unavailable});
                        self.scrollToError();
                    }
                    self.reloadCaptcha();
                },
                error: function (response) {
                    if ($.isFunction(beforeFatalErrorCallback)) {
                        if (false === beforeFatalErrorCallback(response)) {
                            return;
                        }
                    } else {
                        if (401 == response.status) {
                            alert(labels.session_expired);
                            location.reload();
                            return;
                        } else if (403 == response.status) {
                            self.showMessage({error: labels.access_denied});
                        }
                    }

                    if ($.isFunction(fatalErrorCallback)) {
                        if (false === fatalErrorCallback(response, self)) {
                            return;
                        }
                    }
                    setTimeout(self.stopProgress, this.stopProgressDelay);
                    setTimeout(self.enableForm, this.enableFormDelay);
                    self.showMessage({error: labels.service_unavailable});
                    self.scrollToError();
                    self.reloadCaptcha();
                },
                beforeSubmit: function (response, $form, options) {
                    if ($.isFunction(submitCallback)) {
                        if (false === submitCallback(response, $form, options, self)) {
                            return;
                        }
                    }
                    self.clearErrors();
                    self.disableForm();
                    self.startProgress();
                },
                dataType: 'json'
            };

        userOptions = (null !== userOptions && typeof(userOptions) == 'object') ? userOptions : {};
        $.extend(options, userOptions);
        $form.ajaxForm(options);
    };
})(octava);