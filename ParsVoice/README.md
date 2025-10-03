# TTS Model Showcase - Best Speeches

This package contains the top-rated TTS model outputs with scores > 4.5 in all categories.

## Contents:

- `index.html` - Interactive showcase webpage
- `best_speeches.json` - Speech data and ratings
- `audio/generated/` - Generated TTS audio files (50 files)
- `audio/reference/` - Reference audio files (50 files)

## Statistics:

- Total speeches: 50
- Minimum score threshold: 4.5 (for each category)
- Generated audio files: 50
- Reference audio files: 50

## How to Use:

### Local Viewing:
1. Open `index.html` in a web browser
2. All audio files are included and will play locally

### GitHub Pages:
1. Create a new repository on GitHub
2. Upload all files maintaining the folder structure
3. Enable GitHub Pages in repository settings
4. Your showcase will be live at: https://YOUR_USERNAME.github.io/REPO_NAME/

## File Structure:
```
tts_best_speeches/
├── index.html
├── best_speeches.json
├── README.md
└── audio/
    ├── generated/
    │   ├── gen_1_*.wav
    │   ├── gen_2_*.wav
    │   └── ...
    └── reference/
        ├── ref_1_*.wav
        ├── ref_2_*.wav
        └── ...
```

## Rating Categories:

- **Naturalness**: How natural and human-like the generated speech sounds
- **Similarity**: How similar the generated voice is to the reference speaker
- **Text Match**: How accurately the generated speech matches the text

All speeches in this package have scores > 4.5 in ALL three categories.

Generated on: 2025-10-03 14:26:28
