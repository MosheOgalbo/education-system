/**
 * Education Controller - AngularJS 1.x
 * Implements async/await pattern with proper error handling
 * Features: AutoComplete search, filtering, sorting, loading states
 */
(function() {
    'use strict';
    
    angular.module('educationApp')
    .controller('EducationController', ['$scope', 'educationService', '$timeout', '$q', function($scope, educationService, $timeout, $q) {
        
        var vm = this;
        
        // Data properties
        vm.allPlaces = [];
        vm.filteredPlaces = [];
        vm.citySuggestions = [];
        vm.uniqueCities = [];
        
        // UI State
        vm.loading = false;
        vm.error = null;
        vm.searchCity = '';
        vm.searchName = '';
        vm.selectedCityIndex = -1;
        
        // Sorting
        vm.sortField = 'name';
        vm.sortReverse = false;
        
        // Debounce timers
        var citySearchTimeout;
        var nameSearchTimeout;
        
        /**
         * Initialize controller
         * Uses modern async/await pattern with AngularJS
         */
        vm.init = function() {
            console.log('EducationController initialized');
            vm.loadEducationPlaces();
        };
        
        /**
         * Load education places from API
         * Implements proper async/await with error handling
         */
        vm.loadEducationPlaces = async function() {
            vm.loading = true;
            vm.error = null;
            
            try {
                // Use $q to convert promise to AngularJS digest cycle
                const places = await $q.when(educationService.getEducationPlaces());
                
                vm.allPlaces = places || [];
                vm.filteredPlaces = angular.copy(vm.allPlaces);
                
                // Extract unique cities for autocomplete
                vm.uniqueCities = [...new Set(vm.allPlaces.map(place => place.city))];
                
                // Calculate statistics
                vm.calculateStatistics();
                
                console.log('Successfully loaded', vm.allPlaces.length, 'education places');
                
            } catch (error) {
                console.error('Failed to load education places:', error);
                vm.error = error.message || 'אירעה שגיאה בטעינת הנתונים';
            } finally {
                vm.loading = false;
                // Ensure Angular digest cycle
                $scope.$applyAsync();
            }
        };
        
        /**
         * Calculate statistics for dashboard
         */
        vm.calculateStatistics = function() {
            vm.totalPlaces = vm.allPlaces.length;
            vm.totalActiveStudents = vm.allPlaces.reduce((sum, place) => sum + (place.activeStudentCount || 0), 0);
            
            const activeStudents = vm.allPlaces
                .filter(place => place.activeStudentCount > 0)
                .reduce((sum, place) => sum + (place.averageAge * place.activeStudentCount), 0);
            
            vm.averageAge = vm.totalActiveStudents > 0 ? activeStudents / vm.totalActiveStudents : 0;
        };
        
        /**
         * Handle city search with autocomplete
         * Implements debounce for performance
         */
        vm.onCitySearch = function() {
            // Cancel previous timeout
            if (citySearchTimeout) {
                $timeout.cancel(citySearchTimeout);
            }
            
            // Debounce search (150ms as required)
            citySearchTimeout = $timeout(function() {
                vm.performCitySearch();
            }, 150);
        };
        
        /**
         * Perform city search and update suggestions
         */
        vm.performCitySearch = function() {
            const searchTerm = (vm.searchCity || '').toLowerCase().trim();
            
            if (searchTerm.length === 0) {
                vm.citySuggestions = [];
                vm.applyFilters();
                return;
            }
            
            // Filter cities based on search term
            vm.citySuggestions = vm.uniqueCities
                .filter(city => city.toLowerCase().includes(searchTerm))
                .slice(0, 8); // Limit to 8 suggestions
            
            vm.selectedCityIndex = -1;
            vm.applyFilters();
        };
        
        /**
         * Handle name search with debounce
         */
        vm.onNameSearch = function() {
            if (nameSearchTimeout) {
                $timeout.cancel(nameSearchTimeout);
            }
            
            nameSearchTimeout = $timeout(function() {
                vm.applyFilters();
            }, 150);
        };
        
        /**
         * Handle keyboard navigation in autocomplete
         */
        vm.onCityKeydown = function(event) {
            if (!vm.citySuggestions || vm.citySuggestions.length === 0) {
                return;
            }
            
            switch (event.keyCode) {
                case 38: // Arrow Up
                    event.preventDefault();
                    vm.selectedCityIndex = Math.max(0, vm.selectedCityIndex - 1);
                    break;
                    
                case 40: // Arrow Down
                    event.preventDefault();
                    vm.selectedCityIndex = Math.min(vm.citySuggestions.length - 1, vm.selectedCityIndex + 1);
                    break;
                    
                case 13: // Enter
                    event.preventDefault();
                    if (vm.selectedCityIndex >= 0) {
                        vm.selectCity(vm.citySuggestions[vm.selectedCityIndex]);
                    }
                    break;
                    
                case 27: // Escape
                    vm.citySuggestions = [];
                    vm.selectedCityIndex = -1;
                    break;
            }
        };
        
        /**
         * Select city from autocomplete
         */
        vm.selectCity = function(city) {
            vm.searchCity = city;
            vm.citySuggestions = [];
            vm.selectedCityIndex = -1;
            vm.applyFilters();
        };
        
        /**
         * Apply all filters (client-side filtering)
         */
        vm.applyFilters = function() {
            vm.filteredPlaces = vm.allPlaces.filter(function(place) {
                // City filter
                const cityMatch = !vm.searchCity || 
                    place.city.toLowerCase().includes(vm.searchCity.toLowerCase());
                
                // Name filter
                const nameMatch = !vm.searchName || 
                    place.name.toLowerCase().includes(vm.searchName.toLowerCase());
                
                return cityMatch && nameMatch;
            });
            
            $scope.$applyAsync();
        };
        
        /**
         * Clear all filters
         */
        vm.clearFilters = function() {
            vm.searchCity = '';
            vm.searchName = '';
            vm.citySuggestions = [];
            vm.selectedCityIndex = -1;
            vm.applyFilters();
        };
        
        /**
         * Sort table by column
         */
        vm.sortBy = function(field) {
            if (vm.sortField === field) {
                vm.sortReverse = !vm.sortReverse;
            } else {
                vm.sortField = field;
                vm.sortReverse = false;
            }
        };
        
        /**
         * Retry loading data
         * User-friendly error recovery
         */
        vm.retry = function() {
            vm.error = null;
            vm.loadEducationPlaces();
        };
        
        /**
         * Get status badge class for place
         */
        vm.getStatusClass = function(place) {
            if (place.activeStudentCount > 0) {
                return 'bg-success';
            } else if (place.activeStudentCount === 0) {
                return 'bg-warning';
            }
            return 'bg-secondary';
        };
        
        /**
         * Get status text for place
         */
        vm.getStatusText = function(place) {
            if (place.activeStudentCount > 0) {
                return 'פעילה';
            } else if (place.activeStudentCount === 0) {
                return 'לא פעילה';
            }
            return 'לא ידוע';
        };
        
        /**
         * Format average age display
         */
        vm.formatAverageAge = function(age) {
            return age > 0 ? age.toFixed(1) : '—';
        };
        
        /**
         * Initialize on controller load
         */
        vm.init();
        
    }]);
    
})();
