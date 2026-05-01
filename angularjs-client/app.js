(function () {
  'use strict';

  angular.module('eduApp', []).controller('PlacesCtrl', PlacesCtrl);

  PlacesCtrl.$inject = ['$http', '$scope'];
  function PlacesCtrl($http, $scope) {
    var vm = this;

    vm.apiBase = window.EDUCATION_API_BASE || 'http://localhost:5001/api';
    vm.places = [];
    vm.filteredPlaces = [];
    vm.citySuggestions = [];
    vm.cityQuery = '';
    vm.loading = false;
    vm.error = null;
    vm.errorDetail = null;

    vm.$onInit = function () {
      void loadPlaces();
    };

    /**
     * טעינת פנימיות מה-API — async/await מול $http (תואם דרישת המטלה).
     */
    async function loadPlaces() {
      vm.loading = true;
      vm.error = null;
      vm.errorDetail = null;
      try {
        var res = await $http.get(vm.apiBase + '/EducationPlaces');
        $scope.$applyAsync(function () {
          vm.places = res.data || [];
          vm.citySuggestions = uniqueCities(vm.places);
          applyCityFilter();
        });
      } catch (err) {
        $scope.$applyAsync(function () {
          vm.places = [];
          vm.filteredPlaces = [];
          vm.citySuggestions = [];
          vm.error = friendlyErrorTitle(err);
          vm.errorDetail = friendlyErrorDetail(err);
        });
      } finally {
        $scope.$applyAsync(function () {
          vm.loading = false;
        });
      }
    }

    vm.retry = function () {
      void loadPlaces();
    };

    /** סינון בצד הלקוח לפי עיר (מחרוזת מהשדה / AutoComplete) — ללא קריאת HTTP */
    vm.onCityQueryChange = function () {
      applyCityFilter();
    };

    vm.clearCityFilter = function () {
      vm.cityQuery = '';
      applyCityFilter();
    };

    function uniqueCities(places) {
      var set = {};
      angular.forEach(places, function (p) {
        if (p.city) set[p.city] = true;
      });
      return Object.keys(set).sort();
    }

    function applyCityFilter() {
      var q = (vm.cityQuery || '').toLowerCase().trim();
      if (!q) {
        vm.filteredPlaces = vm.places.slice();
        return;
      }
      vm.filteredPlaces = vm.places.filter(function (p) {
        return p.city && p.city.toLowerCase().indexOf(q) !== -1;
      });
    }

    function friendlyErrorTitle(err) {
      if (!err) return 'שגיאה לא ידועה';
      if (err.status === 0) return 'לא ניתן להתחבר לשרת';
      if (err.status >= 500) return 'שגיאת שרת (ניסי שוב מאוחר יותר)';
      if (err.status === 404) return 'המשאב לא נמצא';
      return 'אירעה שגיאה בטעינת הנתונים';
    }

    function friendlyErrorDetail(err) {
      if (err && err.data && err.data.message) return String(err.data.message);
      if (err && err.status) return 'HTTP ' + err.status;
      if (err && err.statusText) return err.statusText;
      return '';
    }
  }
})();
