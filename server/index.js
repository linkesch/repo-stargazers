require('dotenv').load();

var restify = require('restify');
var server = restify.createServer();
var google = require('googleapis');
var jwtClient = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_ID,
  'key.pem',
  null,
  ['https://www.googleapis.com/auth/bigquery']);

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
					'ORDER BY d.stars DESC'
			}
		}, function (err, response) {
			if (err) {
				respond(err, res, next);
				return;
			}

			var results = {};
			for (var i = 0; i < response.rows.length; i++) {
				var row = response.rows[i];
				results[row.f[0].v] = row.f[1].v;
			}

			respond(results, res, next);
		});
	});
});

server.listen(3000, function() {
    console.log('%s listening at %s', server.name, server.url);
});