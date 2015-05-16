require('dotenv').load();

var restify = require('restify');
var server = restify.createServer();
server.use(restify.CORS());

var google = require('googleapis');
var jwtClient = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_ID,
  null,
  process.env.GOOGLE_CERT,
  ['https://www.googleapis.com/auth/bigquery']);

var client = restify.createJsonClient('https://api.github.com');
var auth = '?client_id='+ process.env.GITHUB_CLIENT_ID +'&client_secret='+ process.env.GITHUB_CLIENT_SECRET;

var respond = function (data, res, next) {
	res.contentType = 'json';
    res.send(data);
    next();
};

server.get('/get/:owner/:repo', function (req, res, next) {
	jwtClient.authorize(function (err, tokens) {
		if (err) {
		    respond(err, res, next);
		    return;
		}

		var bigquery = google.bigquery({ version: 'v2', auth: jwtClient });

		bigquery.jobs.query({
			projectId: process.env.GOOGLE_PROJECT_ID,
			resource: {
				query: 'SELECT u.actor, d.stars '+
					'FROM [githubarchive:github.timeline] u '+
					'JOIN EACH ( '+
					  'SELECT repository_owner, COUNT(*) AS stars '+
					  'FROM [githubarchive:github.timeline] '+
					  'WHERE type="WatchEvent" '+
					  'GROUP BY repository_owner '+
					') d ON d.repository_owner = u.actor '+
					'WHERE '+
					  'u.type="WatchEvent" '+
					  'AND u.repository_owner = "'+ req.params.owner +'" '+
					  'AND u.repository_name = "'+ req.params.repo +'" '+
					'ORDER BY d.stars DESC '+
					'LIMIT 10'
			}
		}, function (err, response) {
			if (err) {
				respond(err, res, next);
				return;
			}

			if (!response.rows) {
				respond({
					code: 'error',
					message: 'This repo was not found, or it has no stars. Please, try another one.'
				}, res, next);
				return;
			}

			var results = {};
			var count = 0;
			for (var i = 0; i < response.rows.length; i++) {
				var row = response.rows[i];
				var name = row.f[0].v;

				results[name] = {
					name: name,
					stars: row.f[1].v
				};
				console.log(results);
				client.get('/users/'+ name + auth, function (err, req2, res2, user) {
					if (err) {
						respond(err, res, next);
						return;
					}
					console.log(user.login.toLowerCase());
					results[user.login.toLowerCase()].avatar = user.avatar_url;

					count++;

					if (count === response.rows.length) {
						respond(results, res, next);
					}
				});
			}
		});
	});
});

server.listen(process.env.PORT, function() {
    console.log('%s listening at %s', server.name, server.url);
});