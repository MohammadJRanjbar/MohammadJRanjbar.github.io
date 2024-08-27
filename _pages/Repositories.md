---
layout: archive
title: Repositories
permalink: /repositories/
author_profile: true
nav: true
nav_order: 3
---

Pulling latest stats from GitHub.

---

GitHub Stats
====
{% if site.data.repositories.github_users %}
<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% for user in site.data.repositories.github_users %}
    {% include repository/repo_user.html username=user %}
  {% endfor %}
</div>
{% endif %}

---

Selected Course Repositories
====
{% if site.data.repositories.github_repos or site.data.repositories2.github_repos %}
<div style="display: flex; flex-wrap: wrap; justify-content: center;">

  <!-- First Column -->
  <div style="flex: 1 1 300px; padding: 10px;">
    {% for repo in site.data.repositories.github_repos %}
      {% include repository/repo.html repository=repo %}
    {% endfor %}
  </div>

  <!-- Second Column -->
  <div style="flex: 1 1 300px; padding: 10px;">
    {% for repo in site.data.repositories2.github_repos %}
      {% include repository/repo.html repository=repo %}
    {% endfor %}
  </div>

</div>
{% endif %}








