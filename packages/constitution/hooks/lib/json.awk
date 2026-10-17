BEGIN {
  for (k = 1; k < 32; k++) ESCAPE[sprintf("%c", k)] = sprintf("\\u%04x", k)
  ESCAPE[sprintf("%c", 127)] = "\\u007f"
  ESCAPE["\t"] = "\\t"
  ESCAPE["\n"] = "\\n"
  ESCAPE["\r"] = ""
  ESCAPE["\\"] = "\\\\"
  ESCAPE["\""] = "\\\""
}

# A byte loop rather than gsub, whose replacement strings treat "\" and "&"
# differently from one awk to the next.
function json(s,   out, n, k, c) {
  out = ""
  n = length(s)
  for (k = 1; k <= n; k++) {
    c = substr(s, k, 1)
    out = out ((c in ESCAPE) ? ESCAPE[c] : c)
  }
  return out
}
