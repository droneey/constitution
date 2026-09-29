function glob_re(g,   re, n, k, c) {
  re = ""
  n = length(g)
  for (k = 1; k <= n; k++) {
    c = substr(g, k, 1)
    if (substr(g, k, 3) == "**/") {
      re = re "(.*/)?"
      k += 2
    } else if (substr(g, k, 2) == "**") {
      re = re ".*"
      k++
    } else if (c == "*") re = re "[^/]*"
    else if (c == "?") re = re "[^/]"
    else if (c == "{") re = re "("
    else if (c == "}") re = re ")"
    else if (c == "," && braces(g, k)) re = re "|"
    else if (index(".+^$|()[]\\", c)) re = re "\\" c
    else re = re c
  }
  return "^" re "$"
}

function braces(g, k,   open, j) {
  open = 0
  for (j = 1; j < k; j++) {
    if (substr(g, j, 1) == "{") open++
    else if (substr(g, j, 1) == "}") open--
  }
  return open > 0
}

function governed(path, globs,   n, a, k) {
  n = split(globs, a, " ")
  for (k = 1; k <= n; k++) if (path ~ glob_re(a[k])) return 1
  return 0
}
