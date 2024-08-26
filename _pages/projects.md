---
layout: archive
title: projects
permalink: /projects/
author_profile: true
nav: true
nav_order: 3
---

### My stats

{% if site.data.repositories.github_users %}
<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% for user in site.data.repositories.github_users %}
    {% include repository/repo_user.html username=user %}
  {% endfor %}
</div>
{% endif %}

---

### Some repositories I have contributed to

{% if site.data.repositories.github_repos %}
  {% assign total_repos = site.data.repositories.github_repos | size %}
  {% assign half_repos = total_repos | divided_by: 2 | floor %}

  <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px;">
    
    <!-- First Column -->
    <div style="flex: 1; min-width: 300px; padding: 10px;">
      {% for repo in site.data.repositories.github_repos | slice: 0, 4 %}
        {% include repository/repo.html repository=repo %}
      {% endfor %}
    </div>
    
    <!-- Second Column -->
    <div style="flex: 1; min-width: 300px; padding: 10px;">
      {% for repo in site.data.repositories.github_repos | slice: 4, 8 %}
        {% include repository/repo.html repository=repo %}
      {% endfor %}
    </div>
    
  </div>
{% endif %}




