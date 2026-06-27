async function githubRequest(path, token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`https://api.github.com${path}`, { headers });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API request failed (${response.status}): ${body}`);
  }

  return response.json();
}

async function fetchUserEvents(username, token) {
  return githubRequest(`/users/${username}/events/public`, token);
}

async function fetchUserRepositories(username, token, pages = 3) {
  const repositories = [];

  for (let page = 1; page <= pages; page += 1) {
    const batch = await githubRequest(
      `/users/${username}/repos?per_page=100&page=${page}&sort=updated`,
      token
    );

    if (!batch.length) break;
    repositories.push(...batch);
  }

  return repositories;
}

module.exports = {
  fetchUserEvents,
  fetchUserRepositories,
  githubRequest,
};
