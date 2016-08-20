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
                    if (response.success === true) {
                        if ($.isFunction(successCallback)) {
                            if (!successCallback(response, self)) {
                                return;
                            }
                        }
                        if (response.redirect) {
                            if ($.isFunction(redirectCallback)) {
                                if (!redirectCallback(response, self)) {
                                    return;
                                }
                            } else {
                                location.href = response.redirect;
                                return;
                            }
                        }
                        setTimeout(self.stopProgress, this.stopProgressDelay);
                        setTimeout(self.enableForm, this.enableFormDelay);
                    } else if (response.success === false) {
                        if ($.isFunction(errorCallback)) {
                            if (!errorCallback(response, self)) {
                                return;
                            }
                        }
                        self.stopProgress();
                        self.enableForm();
                        self.showMessage(response);
                        self.showErrors(response);
                        self.scrollToError();
                    } else {
                        if ($.isFunction(fatalErrorCallback)) {
                            if (!fatalErrorCallback(response, self)) {
                                return;
                            }
                        }
                        self.stopProgress();
                        self.enableForm();
                        self.showMessage({error: labels.service_unavailable});
                        self.scrollToError();
                    }
                    self.reloadCaptcha();
                },
                error: function (response) {
                    if ($.isFunction(beforeFatalErrorCallback)) {
                        if (!beforeFatalErrorCallback(response)) {
                            return;
                        }
                    } else {
                        if (response.status == 401) {
                            alert(labels.session_expired);
                            location.reload();
                            return;
                        } else if (response.status == 403) {
                            self.showMessage({error: labels.access_denied});
                        }
                    }

                    if ($.isFunction(fatalErrorCallback)) {
                        if (!fatalErrorCallback(response, self)) {
                            return;
                        }
                    }
                    self.stopProgress();
                    self.enableForm();
                    self.showMessage({error: labels.service_unavailable});
                    self.scrollToError();
                    self.reloadCaptcha();
                },
                beforeSubmit: function (responce, $form, options) {
                    if ($.isFunction(submitCallback)) {
                        if (!submitCallback(responce, $form, options, self)) {
                            return;
                        }
                    }
                    self.clearErrors();
                    self.disableForm();
                    self.startProgress();
                },
                dataType: 'json'
            };

        userOptions = (userOptions !== null && typeof(userOptions) == 'object') ? userOptions : {};
        $.extend(options, userOptions);
        $form.ajaxForm(options);
    };
})(octava);