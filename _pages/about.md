---
# Leave the homepage title empty to use the site title
title: 'About Me'
date: 2024-08-25
type: landing

sections:
  - block: hero
    demo: true # Only display this section in the Hugo Blox Builder demo site
    content:
      title: About Me
      image:
        filename: profile.jpg
      cta:
        label: '**Contact Me**'
        url: '#contact'
      cta_note:
        label: >-
          <div style="text-shadow: none;"><a class="github-button" href="https://github.com/MohammadJRanjbar" data-icon="octicon-star" data-size="large" data-show-count="true" aria-label="Star">Star my GitHub</a></div>
      text: |-
        **Hello!** 

        I am Mohammad Javad Ranjbar, an enthusiastic and innovative Electrical and Computer Engineer currently pursuing a Master's degree in Computer Engineering at the University of Tehran. I am working under the guidance of [Dr. Faili](https://scholar.google.com/citations?user=Faili's_Google_Scholar_ID) and [Dr. Shakeri](https://scholar.google.com/citations?user=Shakeri's_Google_Scholar_ID) in the Natural Language Processing Lab. My research focuses on few-shot text-to-speech synthesis.

        Previously, I earned my Bachelor's in Electrical Engineering from Amirkabir University of Technology (AUT) and worked as a research assistant in the Intelligence and Large Scale System Research Lab, specializing in facial expression recognition under [Dr. Menhaj](https://scholar.google.com/citations?user=Menhaj's_Google_Scholar_ID) and [Dr. Taheri](https://scholar.google.com/citations?user=Taheri's_Google_Scholar_ID).

        I am currently involved in teaching and research as a teaching assistant for Machine Learning at Sharif University of Technology and Deep Learning at the University of Tehran. Additionally, I am developing a retrieval-augmented chatbot named SOFIA.
    design:
      background:
        gradient_end: '#ff5722'
        gradient_start: '#e64a19'
        text_color_light: true
  - block: about.biography
    id: about
    content:
      title: Biography
      username: mohammadranjbar
  - block: education
    content:
      title: Education
      date_format: Jan 2024
      items:
        - title: Master's Degree in Computer Engineering
          institution: University of Tehran
          institution_url: ''
          institution_logo: org-ut
          location: Tehran, Iran
          date_start: '2022-09-01'
          date_end: ''
          description: 'Currently pursuing research in few-shot text-to-speech synthesis under the guidance of Dr. Faili and Dr. Shakeri.'
        - title: Bachelor's Degree in Electrical Engineering
          institution: Amirkabir University of Technology (AUT)
          institution_url: ''
          institution_logo: org-aut
          location: Tehran, Iran
          date_start: '2018-09-01'
          date_end: '2022-06-30'
          description: 'Specialized in facial expression recognition as a research assistant under Dr. Menhaj and Dr. Taheri.'
    design:
      columns: '2'
  - block: skills
    content:
      title: Skills
      text: ''
      username: mohammadranjbar
    design:
      columns: '1'
  - block: experience
    content:
      title: Experience
      date_format: Jan 2024
      items:
        - title: Teaching Assistant
          company: Sharif University of Technology
          company_url: ''
          company_logo: org-sharif
          location: Tehran, Iran
          date_start: '2023-09-01'
          date_end: ''
          description: 'Teaching Machine Learning courses.'
        - title: Teaching Assistant
          company: University of Tehran
          company_url: ''
          company_logo: org-ut
          location: Tehran, Iran
          date_start: '2023-09-01'
          date_end: ''
          description: 'Teaching Deep Learning courses.'
        - title: Research Assistant
          company: Natural Language Processing Lab
          company_url: ''
          company_logo: org-nlp
          location: Tehran, Iran
          date_start: '2022-09-01'
          date_end: ''
          description: 'Working on few-shot text-to-speech synthesis.'
    design:
      columns: '2'
  - block: accomplishments
    content:
      title: 'Accomplishments'
      date_format: Jan 2024
      items:
        - certificate_url: https://www.coursera.org
          date_end: ''
          date_start: '2023-05-01'
          description: 'Completed advanced coursework in machine learning.'
          icon: coursera
          organization: Coursera
          organization_url: https://www.coursera.org
          title: Advanced Machine Learning
          url: ''
        - certificate_url: https://www.edx.org
          date_end: ''
          date_start: '2023-03-01'
          description: 'Completed training in speech synthesis techniques.'
          icon: edx
          organization: edX
          organization_url: https://www.edx.org
          title: Speech Synthesis Fundamentals
          url: https://www.edx.org/professional-certificate/speech-synthesis-fundamentals
    design:
      columns: '2'
  - block: collection
    id: posts
    content:
      title: Recent Posts
      count: 5
      filters:
        folders:
          - post
        author: ""
        category: ""
        tag: ""
        exclude_featured: false
        exclude_future: false
        exclude_past: false
        publication_type: ""
      offset: 0
      order: desc
    design:
      view: compact
      columns: '2'
  - block: contact
    id: contact
    content:
      title: Contact
      subtitle:
      text: |-
        Feel free to reach out to me via email or connect with me on LinkedIn or GitHub.
      email: mohammdjavadranjbarkalahroodi@gmail.com
      contact_links:
        - icon: linkedin
   
