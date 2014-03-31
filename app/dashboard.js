/*
 * Helpers and utils - not static 3rd party libraries
 */

/* istanbul ignore next */
require('lib/**/*');

/*
 * Model layer.
 * Ember.Object itself provides most of what
 * model layers elsewhere provide.
 */
/* istanbul ignore next */
require('models/core/core');
/* istanbul ignore next */
require('models/**/*');

/* istanbul ignore next */
require('auth');

/*
 * Views layer.
 * Ember accomplishes a lot in its templates and
 * Views are only necessary if you have view-specific
 * programming to do.
 */
/* istanbul ignore next */
require('views/_base');
/* istanbul ignore next */
require('views/**/*');

/*
 * Controller layer.
 * Controllers wrap objects and provide a place
 * to implement properties for display
 * whose value is computed from the content of the
 * controllers wrapped objects.
 */
/* istanbul ignore next */
require('controllers/_base');
/* istanbul ignore next */
require('controllers/mixins/**/*');
/* istanbul ignore next */
require('controllers/**/*');

/*
 * Components
 */
/* istanbul ignore next */
require('components/**/*');

/*
 * States (i.e. Routes)
 * Handles serialization of the application's current state
 * which results in view hierarchy updates. Responds to
 * actions.
 */
/* istanbul ignore next */
require('routes/router');
/* istanbul ignore next */
require('routes/auth_route');
/* istanbul ignore next */
require('routes/**/*');
