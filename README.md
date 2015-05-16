# Who starred my repo?

Find out who are **top 10 most important users** who starred your GitHub repo.

Maybe you're just curious, maybe you're looking for some help from experienced programmers using your repo. Maybe your repo has hundreds of stars, but you'll find out that none of the users is anybody influential. Maybe, on the other hand, you'll find out that your not so popular repo is starred by somebody like [Sindre Sorhus](https://github.com/sindresorhus) or [Addy Osmani](https://github.com/addyosmani).

## How it works

This simple app looks who starred your repo and counts how many stars have their own repos. All this data is taken from [GitHub Archive project](https://www.githubarchive.org/) which might not be 100% accurate, but it is enough to provide us with rought idea who are the most important users starring your repo.

## Technical details

The app has two parts: a frontend hosted here on GitHub and a backend hosted on [Heroku](https://www.heroku.com).

The frontend simply sends a request to the backend and displays results. The backend uses [Google BigQuery](https://developers.google.com/bigquery/) to query [GitHub Archive](https://www.githubarchive.org/) data and to find top 10 users who starred the selected repo.

Finally, [GitHub API](https://developer.github.com/v3/) is used to get an avatar for each user.

## Pure GitHub API approach

There is also *_github-api.js* file which demonstrates pure GitHub API approach without GitHub Archive. This is on one side more accurate, but on the other side it's much slower. But bigger problem than speed is GitHub's rate limit which is set to 5000 requests per hour. Which would be exceeded on the first analysis of any more popular repo.

## License

MIT