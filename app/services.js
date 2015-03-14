app.factory('User', function ($http, $q, $timeout, config) {
	var g = config.google;
	var defaults = {
		scopes: 'email https://www.googleapis.com/auth/plus.me',
	}
	
	var User = function(scopes){
		var my = this;
			my.loading = false;
				
		var tools = {
			reset: function(scopes){
				my.data 		= {}
				my.objectId 	= null
				my.sessionToken = null
				my.gAuth 		= null
				my.pAuth		= null
				my.roles 		= []
				my.profile 		= {}
				my.defer 		= $q.defer()
				
				if(scopes)
					my.data.scopes = scopes
				else
					my.data.scopes = defaults.scopes
			},
			init: function(scopes){
				var deferred = $q.defer();
				if(my.profile.length)
					deferred.resolve(my)
				else if(my.loading)
					my.defer.promise.then(function(my){
						deferred.resolve(my);	
					})
				else
					tools.google.init().then(function(gAuth){
						tools.parse.auth(gAuth).then(function(parseUser){
							var profile = tools.google.profile();
							var roles 	= tools.parse.roles.list();
							$q.all([profile, roles]).then(function() {
								my.defer.resolve(my);
								deferred.resolve(my)
							});
						})
					})
				return deferred.promise;
			},
			login: function(scopes){
				var deferred = $q.defer();
				
				if(my.profile.length)
					deferred.resolve(my)
				else if(my.loading)
					my.defer.promise.then(function(user){
						deferred.resolve(user);	
					})
				else
					tools.google.auth().then(function(gAuth){
						tools.parse.auth(gAuth).then(function(parseUser){
							var profile = tools.google.profile();
							var roles 	= tools.parse.roles.list();
							$q.all([profile, roles]).then(function() {
								my.defer.resolve(my);
								deferred.resolve(my)
							});
						})
					})
				return deferred.promise;
			},
			logout: function(){
				gapi.auth.signOut();
				tools.reset();
			},
			is: function(roleName) {
				if (my.roles)
					for (var i = 0; i < my.roles.length; i++)
						if (my.roles[i].name == roleName)
							return true;
				return false;
			},
			google: {
				init: function(){
					var deferred = $q.defer();
					gapi.auth.authorize({
						client_id: config.google.client_id, 
						scope: my.data.scopes, 
						immediate: true
					}, function(gAuth){
						my.gAuth = gAuth;
						deferred.resolve(gAuth)
					});
					return deferred.promise;
				},
				plus: function(){
					return gapi.client.load('plus', 'v1');
				},
				scopes: function(scopes){
					if(scopes)
						my.data.scopes += ' '+scopes;
					return tools.google.init();
				},
				auth: function(){
					var deferred = $q.defer();
					gapi.auth.authorize({
						client_id: config.google.client_id, 
						scope: my.data.scopes, 
						immediate: false
					}, function(gAuth){
						my.gAuth = gAuth;
						deferred.resolve(gAuth)
					});
					return deferred.promise;
				},
				profile: function(){
					var deferred = $q.defer();
					$http.get('https://www.googleapis.com/plus/v1/people/me?access_token='+my.gAuth.access_token).success(function(profile){
	 					my.profile = profile;
		 				deferred.resolve(profile);
	 				});
					return deferred.promise;
				}
			},
			parse: {
				auth: function(gAuth){
					var deferred = $q.defer();
					$http.post('https://api.parse.com/1/functions/googleAuth', gAuth).success(function(data) {
						my.pAuth 			= data.result;
						my.objectId 		= data.result.user.objectId;
						my.sessionToken 	= data.result.token;
						Parse.User.become(my.sessionToken)
						$http.defaults.headers.common['X-Parse-Session-Token'] = my.sessionToken;
						deferred.resolve(data);
					}).error(function(error){
						deferred.reject(error);
						tools.logout();
					})
		 			return deferred.promise;
				},
				roles: {
					list: function() {
						var deferred = $q.defer();
						if (my.roles.length) {
							deferred.resolve(my.roles)
						}
						else {
							var roleQry = 'where={"users":{"__type":"Pointer","className":"_User","objectId":"' + my.objectId + '"}}'
							$http.get('https://api.parse.com/1/classes/_Role?' + roleQry).success(function(data) {
								my.roles = data.results;
								deferred.resolve(data.results);
							}).error(function(data) {
								deferred.reject(data);
							});
						}
						return deferred.promise;
					},
					toggle: function(roleId) {
						if (typeof(roleId) != 'string')
							roleId = roleId.objectId;

						var operation = 'AddRelation';
						for (var i = 0; i < my.roles.length; i++)
							if (my.roles[i].objectId == roleId)
								operation = 'RemoveRelation';

						var request = {
							users: {
								__op: operation,
								objects: [{
									__type: "Pointer",
									className: "_User",
									objectId: my.objectId
								}]
							}
						}
						$http.put('https://api.parse.com/1/classes/_Role/' + roleId, request).success(function(data) {
							console.log('Role toggled.');
						}).error(function(error) {
							console.error(error);
						})
					}
				}
			}
		}
		
		this.tools 	= tools;
		this.is 	= tools.is;
		tools.reset(scopes);
	}
	return User;
});





app.factory('SpreadSheet', function ($http, $q) {
	var SpreadSheet = function(spreadsheetId){
		var ss 			= this;
		this.id 		= spreadsheetId;
		this.ref		= null;
		this.title 		= null;
		this.author		= [];
		this.link 		= [];
		this.data 		= [];
		this.setId 		= function(id){
			this.id = id;
		}
		this.load 		= function(id){
			var deferred = $q.defer();
			if(id)
				this.setId(id);
			this.ref = 'https://spreadsheets.google.com/feeds/list/'+this.id+'/od6/public/values?alt=json-in-script&callback=JSON_CALLBACK';
			$http.jsonp(this.ref).success(function(data){
				ss.title 	= data.feed.title.$t;
				ss.link 	= data.feed.link;
				ss.data 	= data.feed.entry;
				for(var i=0; i<data.feed.author.length; i++)
					ss.author.push({
						name: 	data.feed.author[i].name.$t,
						email: 	data.feed.author[i].email.$t
					})

				deferred.resolve(ss);
			});
			
			return deferred.promise;
		}
		this.columns = function(){
			var columns = [];
			var object = this.data[0];
			for (var property in object) {
				if (object.hasOwnProperty(property) && property.indexOf('gsx$') == 0) {
					columns.push(property.slice(4))
				}
			}
			return columns;
		}
		this.toTable = function(){
			var columns = this.columns();
			var table = [];
			for(var r=0; r<this.data.length; r++){
				table[r]=[];
				for(var c=0; c<columns.length; c++){
					table[r][c] = this.data[r]['gsx$'+columns[c]].$t
				}
			}
			return table;
		},
		this.toJson = function(row){
			var columns = this.columns();
			if(row != undefined){
				var item = {}
				for(var c=0; c<columns.length; c++){
					item[columns[c]] = this.data[row]['gsx$'+columns[c]].$t
				}
				return item;
			}else{
				var list = [];
				for(var r=0; r<this.data.length; r++){
					list[r]={};
					for(var c=0; c<columns.length; c++){
						list[r][columns[c]] = this.data[r]['gsx$'+columns[c]].$t
					}
				}
				return list;
			}
		}
	}

	it.SpreadSheet = SpreadSheet;
	return SpreadSheet;
});