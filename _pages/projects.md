---
layout: archive
title: projects
permalink: /projects/
author_profile: true
nav: true
nav_order: 4
---

### My stats

{% if site.data.repositories.github_users %}
<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% assign unique_users = site.data.repositories.github_users | uniq %}
  {% for user in unique_users %}
    {% include repository/repo_user.html username=user %}
  {% endfor %}

{% endif %}
</div>

---

### Some repositories I have contributed to

{% if site.data.repositories.github_repos %}
<div class="repositories d-flex flex-wrap justify-content-between">
  <div class="column">
    {% assign unique_repos = site.data.repositories.github_repos | uniq %}
    {% assign half = unique_repos.size | divided_by: 2 %}
    {% for repo in unique_repos %}
      {% if forloop.index <= half %}
        {% include repository/repo.html repository=repo %}
      {% endif %}
    {% endfor %}
  </div>
  <div class="column">
    {% for repo in unique_repos %}
      {% if forloop.index > half %}
        {% include repository/repo.html repository=repo %}
      {% endif %}
    {% endfor %}
  </div>
</div>
{% endif %}


