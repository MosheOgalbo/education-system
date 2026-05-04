/**
 * מודול AngularJS 1.x — לקוח Legacy להדגמת Hands-On (מקביל ללקוח Angular המודרני).
 * נשמר סגנון IIFE + 'use strict' כמקובל ב-AngularJS ישן.
 */
(function() {
    'use strict';
    
    // מודול ראשי: ניווט מבוסס ngRoute (פשוט יחסית לדמו קטן).
    angular.module('educationApp', [
        'ngRoute'
    ])
    .config(['$httpProvider', function($httpProvider) {
        // Timeout קשיח — מונע תליה אינסופית אם השרת לא מגיב (חוויית משתמש צפויה).
        $httpProvider.defaults.timeout = 10000;
        
        // שימוש ב-XHR חוצה-דומיין היכן שנדרש; הסרת X-Requested-With עוזרת לחלק מתצורות CORS ישנות.
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        
        // Interceptor בסיסי — לוג לקונסול; בפרודקשן הייתי מפנה למסך שגיאה אחיד כמו ב-Angular החדש.
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
        // טיפול בשגיאות ניווט (קישור שבור / ריזולבר נכשל).
        $rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
            console.error('Route change error:', rejection);
        });
    }]);
    
})();
