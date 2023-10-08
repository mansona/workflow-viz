import Route from '@ember/routing/route';

export default class ViewRoute extends Route {
  async model(params) {
    const { org, repo, id } = params;
    const cacheKey = `${org}/${repo}/${id}`;

    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const jobs = [];

    let page = 1;

    let result;
    let json;

    async function getJobs() {
      result = await fetch(
        `https://api.github.com/repos/${org}/${repo}/actions/runs/${id}/jobs?per_page=100&&page=${page}`,
      );
      json = await result.json();
      jobs.push(...json.jobs);
      page++;
    }

    do {
      await getJobs();
    } while (jobs.length < json.total_count);

    const trimmedJobs = jobs.map((j) => {
      return {
        started_at: j.started_at,
        completed_at: j.completed_at,
        name: j.name,
      };
    });

    try {
      localStorage.setItem(cacheKey, JSON.stringify(trimmedJobs));
    } catch {
      // don't fail the app for not being able to save cache
    }

    return trimmedJobs;
  }
}
