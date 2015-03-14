app.lazy.controller('MainCtrl', function($rootScope, $scope, $routeParams, $http, $q, config, User){
	var tools = $scope.tools = {
		drive: {
			files: function(gAuth) {
				var config = {
					params: {
						'alt': 'json'
					},
					headers: {
						'Authorization': 'Bearer ' + gAuth.access_token,
						'GData-Version': '3.0'
					}
				};
				return $http.get('https://www.googleapis.com/drive/v2/files', config)
			}
		}
	}
	
	$rootScope.visitor.tools.google.scopes('https://www.googleapis.com/auth/drive').then(function(gAuth){
		tools.drive.files(gAuth).success(function(result){
			console.log('driveFIles', result);
			it.driveFiles = result;
		})
	})

	it.MainCtrl = $scope;
});