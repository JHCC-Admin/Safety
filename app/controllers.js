app.controller('SiteCtrl', function($rootScope, $scope, $routeParams, $http, config, User){
	$scope.alerts = [];
	
	var visitor = $rootScope.visitor = new User();
	var tools = $rootScope.tools = {
		user: {
			logout: function(){
				visitor.tools.logout();
				$rootScope.user = null;
			},
			login: function(){
				visitor.tools.auth().then(function(user){
					$rootScope.user = user;
				}).catch(function(response){
					if(response && response.error)
						alert(response.error);
				})
			},
			addScope: function(scope){
				visitor.tools.google.scopes(scope)
			}
		},
		alert: function(style, message, persistant){
			$scope.alerts.push({style: style, message: message, persistant:persistant, time: new moment()})
		}
	}
	
	visitor.tools.init().then(function(user){
		$rootScope.user = user;
	})
	
	it.SiteCtrl = $scope;
});