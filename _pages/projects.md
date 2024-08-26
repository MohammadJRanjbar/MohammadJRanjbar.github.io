---
layout: archive
title: projects
permalink: /projects/
author_profile: true
description: Pulling latest stats from GitHub.
nav: true
nav_order: 3
---

### My stats

{% if site.data.repositories.github_users %}
<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% assign unique_users = site.data.repositories.github_users | uniq %}
  {% for user in unique_users %}
    {% include repository/repo_user.html username=user %}
  {% endfor %}
</div>
{% endif %}

---

### Some repositories I have contributed to

{% if site.data.repositories.github_repos %}
<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% assign unique_repos = site.data.repositories.github_repos | uniq %}
  {% for repo in unique_repos %}
    {% include repository/repo.html repository=repo %}
  {% endfor %}
</div>
{% endif %}

