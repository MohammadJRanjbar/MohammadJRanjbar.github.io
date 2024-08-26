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

  <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
    
    <!-- First Column -->
    <div style="flex: 1; min-width: 300px;">
      <h3>First Column (0 to {{ half_repos }})</h3>
      {% for repo in site.data.repositories.github_repos | slice: 0, half_repos %}
        {% include repository/repo.html repository=repo %}
      {% endfor %}
    </div>
    
    <!-- Second Column -->
    <div style="flex: 1; min-width: 300px;">
      <h3>Second Column ({{ half_repos }} to {{ total_repos }})</h3>
      {% for repo in site.data.repositories.github_repos | slice: half_repos, total_repos %}
        {% include repository/repo.html repository=repo %}
      {% endfor %}
    </div>
    
  </div>

  <!-- Debugging Information -->
  <div style="margin-top: 20px;">
    <h3>Debugging Information:</h3>
    <p>Total Repositories: {{ total_repos }}</p>
    <p>Half Repositories: {{ half_repos }}</p>
  </div>
{% endif %}





