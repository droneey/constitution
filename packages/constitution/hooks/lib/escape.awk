{ text = text (NR > 1 ? "\n" : "") $0 }
END { printf "%s", json(text) }
