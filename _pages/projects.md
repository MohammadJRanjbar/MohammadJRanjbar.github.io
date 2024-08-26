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

  <!-- Debugging output -->
  <p>Total Repos: {{ total_repos }}</p>
  <p>Half Repos: {{ half_repos }}</p>

  <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
    
    <!-- First Column -->
    <div style="flex: 1; min-width: 300px;">
      {% assign debug_first_column_indices = "" %}
      {% for index in (0..half_repos-1) %}
        {% assign debug_first_column_indices = debug_first_column_indices | append: index | append: ", " %}
        {% assign repo = site.data.repositories.github_repos[index] %}
        {% include repository/repo.html repository=repo %}
      {% endfor %}
      <!-- Debugging output -->
      <p>First Column Indices: {{ debug_first_column_indices }}</p>
    </div>
    
    <!-- Second Column -->
    <div style="flex: 1; min-width: 300px;">
      {% assign debug_second_column_indices = "" %}
      {% for index in (half_repos..total_repos-1) %}
        {% assign debug_second_column_indices = debug_second_column_indices | append: index | append: ", " %}
        {% assign repo = site.data.repositories.github_repos[index] %}
        {% include repository/repo.html repository=repo %}
      {% endfor %}
      <!-- Debugging output -->
      <p>Second Column Indices: {{ debug_second_column_indices }}</p>
    </div>
    
  </div>
{% endif %}





