/**
 * Education Service - AngularJS 1.x
 * Handles API communication with async/await pattern
 */
(function() {
    'use strict';
    
    angular.module('educationApp')
    .service('educationService', ['$http', '$q', '$timeout', function($http, $q, $timeout) {
        
        var self = this;
        var API_BASE = window.EDUCATION_API_BASE || 'http://localhost:5001/api';
        
        // Debounce function for search
        var debounce = function(func, wait) {
            var timeout;
            return function() {
                var context = this;
                var args = arguments;
                var later = function() {
                    timeout = null;
                    func.apply(context, args);
                };
                $timeout.cancel(timeout);
                timeout = $timeout(later, wait);
            };
        };
        
        /**
         * Fetch all education places with statistics
         * Uses modern async/await pattern with AngularJS $http
         */
        self.getEducationPlaces = function() {
            return $http.get(API_BASE + '/EducationPlaces')
                .then(function(response) {
                    console.log('Education places loaded:', response.data);
                    return response.data;
                })
                .catch(function(error) {
                    console.error('Error loading education places:', error);
                    throw self.formatError(error);
                });
        };
        
        /**
         * Get education place by ID
         */
        self.getEducationPlaceById = function(id) {
            return $http.get(API_BASE + '/EducationPlaces/' + id)
                .then(function(response) {
                    return response.data;
                })
                .catch(function(error) {
                    console.error('Error loading education place:', error);
                    throw self.formatError(error);
                });
        };
        
        /**
         * Create new education place
         */
        self.createEducationPlace = function(placeData) {
            return $http.post(API_BASE + '/EducationPlaces', placeData)
                .then(function(response) {
                    return response.data;
                })
                .catch(function(error) {
                    console.error('Error creating education place:', error);
                    throw self.formatError(error);
                });
        };
        
        /**
         * Update education place
         */
        self.updateEducationPlace = function(id, placeData) {
            return $http.put(API_BASE + '/EducationPlaces/' + id, placeData)
                .then(function(response) {
                    return response.data;
                })
                .catch(function(error) {
                    console.error('Error updating education place:', error);
                    throw self.formatError(error);
                });
        };
        
        /**
         * Delete education place
         */
        self.deleteEducationPlace = function(id) {
            return $http.delete(API_BASE + '/EducationPlaces/' + id)
                .then(function(response) {
                    return response.data;
                })
                .catch(function(error) {
                    console.error('Error deleting education place:', error);
                    throw self.formatError(error);
                });
        };
        
        /**
         * Get all students
         */
        self.getStudents = function(educationPlaceId) {
            var url = API_BASE + '/Students';
            if (educationPlaceId) {
                url += '?educationPlaceId=' + educationPlaceId;
            }
            
            return $http.get(url)
                .then(function(response) {
                    return response.data;
                })
                .catch(function(error) {
                    console.error('Error loading students:', error);
                    throw self.formatError(error);
                });
        };
        
        /**
         * Create or update student (UPSERT)
         */
        self.upsertStudent = function(studentData) {
            return $http.post(API_BASE + '/Students/upsert', studentData)
                .then(function(response) {
                    return response.data;
                })
                .catch(function(error) {
                    console.error('Error upserting student:', error);
                    throw self.formatError(error);
                });
        };
        
        /**
         * Format error messages for user-friendly display
         */
        self.formatError = function(error) {
            var message = 'אירעה שגיאה לא ידועה';
            
            if (error && error.data) {
                if (error.data.message) {
                    message = error.data.message;
                } else if (error.data.Message) {
                    message = error.data.Message;
                }
            } else if (error && error.statusText) {
                message = 'שגיאת שרת: ' + error.statusText;
            } else if (error && error.message) {
                message = error.message;
            }
            
            // Add HTTP status if available
            if (error && error.status) {
                message += ' (קוד: ' + error.status + ')';
            }
            
            return new Error(message);
        };
        
        /**
         * Debounced search function
         */
        self.debouncedSearch = debounce(function(searchTerm, callback) {
            // For client-side filtering, we don't need to call the API
            // This is just to demonstrate the debounce pattern
            callback();
        }, 300);
        
        /**
         * Health check for API availability
         */
        self.healthCheck = function() {
            return $http.get(API_BASE + '/EducationPlaces')
                .then(function() {
                    return true;
                })
                .catch(function() {
                    return false;
                });
        };
        
    }]);
    
})();
