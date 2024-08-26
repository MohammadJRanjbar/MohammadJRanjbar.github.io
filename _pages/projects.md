---
layout: archive
title: projects
permalink: /projects/
author_profile: true
---

### My stats

{% if site.data.repositories.github_users %}
<div class="repositories d-flex flex-wrap justify-content-between align-items-center">
  <!-- For medium and larger screens, arrange items in a row -->
  <div class="d-md-flex">
    {% for user in site.data.repositories.github_users %}
      {% include repository/repo_user.html username=user %}
    {% endfor %}
  </div>

  <!-- Adjust the layout for smaller screens -->
  <div class="d-md-none">
    {% for repo in site.data.repositories.github_repos %}
      {% include repository/repo.html repository=repo %}
    {% endfor %}
  </div>
</div>


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

