
var app = angular.module('fileUploadApp', ['angular-files-drop']);
app.controller('fileUploadController', function ($scope, $http) {
    $scope.name = 'TEST';
    $scope.add = function () {
    }
    $scope.onFilesDropped = function ($files, $event) {
        console.log('$files', $files)
        console.log('$event', $event)

        $scope.previews = $files
    }
})
//angular.bootstrap(document, ['fileUploadApp'])