app.factory('config', function ($http, $q) {
	var config = {
		secureUrl: 		'https://jhcc-main-project.appspot.com',
		parse: {
			appId: 		'wUbwQqQYtigl4udNWS9dKs71mjzTMu4hiNhiNUuV',
			clientKey: 	'u26JNcq97t8EcpbrOYhCiSWUxAmtKig6JyNNaFsV',
			jsKey: 		'ecPjf8BtHjQqvc36eGeSyzA5EKoXskljunNhn1jM',
			netKey: 	'AHyULFaqmyPtJF326e6tVmhS2EGrIGbEHSVTE5pF',
			restKey: 	'A47wOi4BqSZlr3XcFKimuRijTsO7K9gjXxeFvQYU'
		},
		google: {
			auth_uri: "https://accounts.google.com/o/oauth2/auth",
			client_secret: "JkoAr146jvywyeurbVLU2XtH",
			token_uri: "https://accounts.google.com/o/oauth2/token",
			client_email: "693915073881-8lq8g0q78rhabgmmhf86prf34gcaeeff@developer.gserviceaccount.com",
			redirect_uris: ["https://safety-jhcc-admin.c9.io/oauth2callback"],
			client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/693915073881-8lq8g0q78rhabgmmhf86prf34gcaeeff@developer.gserviceaccount.com",
			client_id: "693915073881-8lq8g0q78rhabgmmhf86prf34gcaeeff.apps.googleusercontent.com",
			auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
			javascript_origins: ["https://safety-jhcc-admin.c9.io"]
		}
	}
	
	Parse.initialize(config.parse.appId, config.parse.jsKey);
	$http.defaults.headers.common['X-Parse-Application-Id'] = config.parse.appId;
	$http.defaults.headers.common['X-Parse-REST-API-Key'] = config.parse.restKey;
	$http.defaults.headers.common['Content-Type'] = 'application/json';
	
	return config;
});