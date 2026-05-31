Voice-acting audio goes here.

When a Meijel native records the words, save each clip as an .mp3 in this folder
and set the matching "audio" field in ../../content/course.json to the filename.

Example:
  "huis": { "nl": "huis", "meels": "husj", "audio": "husj.mp3", "status": "approved" }
  → place the file assets/audio/husj.mp3

Until a clip exists, leave "audio": null. The app falls back gracefully:
listen-exercises reveal the written Mééls word instead of playing sound.
