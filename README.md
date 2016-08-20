# Octava jquery-form wrapper

## Usage

### Include scripts

```html
<script src="https://code.jquery.com/jquery-3.1.0.min.js"></script> 
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.form/3.46/jquery.form.min.js"></script> 
<script src="octava-jquery-form/jquery-form.js"></script> 
```

```javascript
$(document).ready(function() {
    var options = {
            'labels': {
                'service_unavailable': 'Service unavailable',
                'session_expired': 'Session expired',
                'access_denied': 'Access denied'
            },
            autoEnableForm: true,
            enableFormDelay: 0,
            stopProgressDelay: 0,
            dataType: 'json'
        },
        $form = $('form[name="octava-jquery-form"]'),
        octavaForm = new window.octava.JqueryForm($form, options);

    octavaForm
        .onSubmit(function(response, $form, options, octavaForm) {
            console.log('onSubmit', arguments)
        })
        .onSuccess(function(response, octavaForm) {
            console.log('onSuccess', arguments);
        })
        .onRedirect(function(response, octavaForm) {
            console.log('onRedirect', arguments);
        })
        .onError(function(response, octavaForm) {
            console.log('onError', arguments);
        })
        .onBeforeFatalError(function(response, octavaForm) {
            console.log('onBeforeFatalError', arguments);
        })
        .onFatalError(function(response, octavaForm) {
            console.log('onFatalError', arguments);
        });
});
````


### Form works with server response:

```json
{
    "success": true,
    "message": "your message",
    "errors": [
        {
            "field": "field_id",
            "error": "text error"
        }
    ],
    "data": {},
    "redirect": "http://redirect.to"
}
```