/**
 * AngularJS 1.x Application Module
 * Education System Client - Hands-On Implementation
 */
(function() {
    'use strict';
    
    // Main application module
    angular.module('educationApp', [
        'ngRoute'
    ])
    .config(['$httpProvider', function($httpProvider) {
        // Configure HTTP settings
        $httpProvider.defaults.timeout = 10000; // 10 seconds timeout
        
        // Add CORS headers if needed
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        
        // Request interceptor for error handling
        $httpProvider.interceptors.push(['$q', function($q) {
            return {
                'responseError': function(rejection) {
                    console.error('HTTP Error:', rejection);
                    return $q.reject(rejection);
                }
            };
        }]);
    }])
    .run(['$rootScope', function($rootScope) {
        // Global error handler
        $rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
            console.error('Route change error:', rejection);
        });
    }]);
    
})();
