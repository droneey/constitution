BEGIN {
  FS = "\t"
  while ((getline line < ENVIRON["CONSTITUTION_STATE"]) > 0) {
    split(line, f, "\t")
    if (f[1] == "active") {
      N++
      SCOPE[N] = f[2]
      APPPATH[N] = f[3]
      ID[N] = f[4]
      GLOBS[N] = f[5]
    }
  }
  close(ENVIRON["CONSTITUTION_STATE"])
}

{
  path = $0
  scope = 0
  depth = -1
  for (i = 1; i <= N; i++) {
    if (SCOPE[i] == 0 || APPPATH[i] == "") continue
    if (index(path "/", APPPATH[i] "/") == 1 && length(APPPATH[i]) > depth) {
      scope = SCOPE[i]
      depth = length(APPPATH[i])
    }
  }
  inner = (scope == 0) ? path : substr(path, depth + 2)
  for (i = 1; i <= N; i++) {
    if (SCOPE[i] != scope || (ID[i] in NAMED) || !governed(inner, GLOBS[i])) continue
    NAMED[ID[i]] = 1
    out = out (out == "" ? "" : ", ") ID[i]
  }
}

END { if (out != "") print out }
