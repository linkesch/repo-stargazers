require('dotenv').load();

var restify = require('restify');
var server = restify.createServer();
var client = restify.createJsonClient('https://api.github.com');
var auth = '&client_id='+ process.env.GITHUB_CLIENT_ID +'&client_secret='+ process.env.GITHUB_CLIENT_SECRET;
var results = {};
var count = 0;
var usersCount = 0;

var respond = function (data, res, next) {
	res.contentType = 'json';
    res.send(data);
    next();
};

var sortResultsAndRespond = function (data, res, next) {
	var arr = Object.keys(data).map(function (key) {
		return data[key];
	});

	arr.sort(function (a, b) {
		return b.stars - a.stars;
	});

	respond(arr, res, next);
};

var getRepos = function (user, req, res, next, page) {
	page = page || 1;

	client.get('/users/'+ user.login +'/repos?per_page=100&page='+ page +'&'+ auth, function (err3, req3, res3, repos) {
		if (err3) {
	    	respond(err3, res, next);
	    } else {
	    	results[user.id].repos = repos.length;
	    	Object.keys(repos).forEach(function (j) {
	    		results[user.id].stars += repos[j].stargazers_count;
	    	});

	    	count++;

	    	if (repos.length === 100) {
				getRepos(user, req, res, next, page+1);
			}

	    	if (count === usersCount) {
	    		sortResultsAndRespond(results, res, next);
	    	}
	    }
	});
};

var getStargazers = function (req, res, next, page) {
	page = page || 1;

	client.get('/repos/'+ req.params.owner +'/'+ req.params.repo +'/stargazers?per_page=100&page='+ page +'&'+ auth, function (err2, req2, res2, users) {
	    if (err2) {
	    	respond(err2, res, next);
	    } else {
	    	usersCount += users.length;
			Object.keys(users).forEach(function (i) {
				var user = users[i];

				results[user.id] = {
					id: user.id,
					login: user.login,
					html_url: user.html_url,
					avatar_url: user.avatar_url,
					repos: 0,
					stars: 0
				};
			});

			if (users.length === 100) {
				getStargazers(req, res, next, page+1);
			} else {
				Object.keys(results).forEach(function (i) {
					getRepos(results[i], req, res, next);
				});
			}
		}
	});
};

server.get('/get/:owner/:repo', function (req, res, next) {
	getStargazers(req, res, next);
});

server.listen(3000, function() {
    console.log('%s listening at %s', server.name, server.url);
});