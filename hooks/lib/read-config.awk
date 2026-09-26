# The fixed YAML subset of spec §4.3. A record puts free text last, so that a
# tab inside it survives.

BEGIN {
  T = "\t"
  LISTS = " domains platforms languages implementations "
  FIELDS = " rule level reason until "
}

function fail(line) {
  if (!failed) print "error" T line
  failed = 1
  exit
}

function trim(s) {
  sub(/^[ \t]+/, "", s)
  sub(/[ \t]+$/, "", s)
  return s
}

# A "#" after a blank starts a comment unless it sits in a quoted scalar, and a
# quote opens a scalar only where a scalar can start.
function uncomment(s,   i, n, c, quote, last) {
  n = length(s)
  last = ""
  for (i = 1; i <= n; i++) {
    c = substr(s, i, 1)
    if (quote == "\"") {
      if (c == "\\") i++
      else if (c == "\"") quote = ""
    } else if (quote == "'") {
      if (c == "'") quote = ""
    } else if (c == "#" && (i == 1 || substr(s, i - 1, 1) ~ /[ \t]/)) {
      return substr(s, 1, i - 1)
    } else if ((c == "\"" || c == "'") && (last == "" || index(":[,-", last))) {
      quote = c
    }
    if (c != " " && c != "\t") last = c
  }
  return s
}

function scalar(s,   n, c, inner, out, i, ch) {
  s = trim(s)
  if (s == "") return ""
  c = substr(s, 1, 1)
  n = length(s)
  if (c == "\"" || c == "'") {
    if (n < 2 || substr(s, n, 1) != c) fail(NR)
    inner = substr(s, 2, n - 2)
    out = ""
    for (i = 1; i <= n - 2; i++) {
      ch = substr(inner, i, 1)
      if (c == "\"" && ch == "\\") {
        i++
        ch = substr(inner, i, 1)
        if (ch != "\"" && ch != "\\") ch = "\\" ch
      } else if (ch == c) {
        if (c == "\"" || substr(inner, i + 1, 1) != "'") fail(NR)
        i++
      }
      out = out ch
    }
    return out
  }
  if (index("&*!|>{[@`%", c)) fail(NR)
  return s
}

function closing_bracket(s,   i, n, c, quote, last) {
  n = length(s)
  last = "["
  for (i = 2; i <= n; i++) {
    c = substr(s, i, 1)
    if (quote == "\"") {
      if (c == "\\") i++
      else if (c == "\"") quote = ""
    } else if (quote == "'") {
      if (c == "'") quote = ""
    } else if ((c == "\"" || c == "'") && (last == "[" || last == ",")) {
      quote = c
    } else if (c == "]") {
      return i
    } else if (c == "[" || c == "{") {
      fail(NR)
    }
    if (c != " " && c != "\t") last = c
  }
  return 0
}

function flow(s, app, key,   end, inner, n, i, c, quote, last, piece, pieces, count) {
  end = closing_bracket(s)
  if (trim(substr(s, end + 1)) != "") fail(NR)
  inner = substr(s, 2, end - 2)
  n = length(inner)
  last = ","
  piece = ""
  for (i = 1; i <= n; i++) {
    c = substr(inner, i, 1)
    if (quote == "\"") {
      if (c == "\\") {
        piece = piece c
        i++
        c = substr(inner, i, 1)
      } else if (c == "\"") {
        quote = ""
      }
    } else if (quote == "'") {
      if (c == "'") quote = ""
    } else if (c == ",") {
      pieces[++count] = piece
      piece = ""
      last = ","
      continue
    } else if ((c == "\"" || c == "'") && last == ",") {
      quote = c
    }
    piece = piece c
    if (c != " " && c != "\t") last = c
  }
  pieces[++count] = piece
  for (i = 1; i <= count; i++) {
    piece = trim(pieces[i])
    # "[a, b,]" ends with an empty piece, which YAML allows; any other is an error.
    if (piece == "" && i < count) fail(NR)
    if (piece != "") print "item" T app T key T scalar(piece)
  }
}

function list(l, rest, app, key) {
  KEY[l] = key
  N[l] = 0
  if (rest == "") {
    KIND[l] = "list"
    return
  }
  if (substr(rest, 1, 1) != "[") fail(NR)
  KIND[l] = "done"
  if (closing_bracket(rest)) {
    flow(rest, app, key)
    return
  }
  pending = rest
  pline = NR
  papp = app
  pkey = key
  pindent = l ? 4 : 0
}

function item(l, t, app,   text) {
  text = trim(substr(t, 2))
  if (text == "") fail(NR)
  print "item" T app T KEY[l] T scalar(text)
  N[l]++
}

function overrides(l, rest) {
  KEY[l] = "overrides"
  N[l] = 0
  if (rest ~ /^\[ *\]$/) KIND[l] = "done"
  else if (rest == "") KIND[l] = "overrides"
  else fail(NR)
}

function flush() {
  if (open) print "override" T oapp T oline T orule T olevel T ountil T oreason
  open = 0
}

function field(t,   name, value) {
  if (!match(t, /^[a-z]+:/)) fail(NR)
  name = substr(t, 1, RLENGTH - 1)
  value = substr(t, RLENGTH + 1)
  if (!index(FIELDS, " " name " ") || (name in ohas) || (value != "" && value !~ /^[ \t]/)) fail(NR)
  ohas[name] = 1
  value = scalar(value)
  if (name == "rule") orule = value
  else if (name == "level") olevel = value
  else if (name == "until") ountil = value
  else oreason = value
}

# An override is "- <field>: <value>", its other fields two spaces deeper.
function override(l, t, indent, app) {
  if (t ~ /^-( |$)/) {
    flush()
    open = 1
    oindent = indent
    oline = NR
    oapp = app
    orule = olevel = ountil = oreason = ""
    delete ohas
    N[l]++
    t = trim(substr(t, 2))
    if (t != "") field(t)
    return
  }
  if (!open || indent != oindent + 2) fail(NR)
  field(t)
}

function body(l, t, indent, app) {
  if (KIND[l] == "skip") return
  if (KIND[l] == "list" && t ~ /^-( |$)/) item(l, t, app)
  else if (KIND[l] == "overrides") override(l, t, indent, app)
  else fail(NR)
}

function close_level(l, app) {
  if (KIND[l] == "overrides") flush()
  if ((KIND[l] == "list" || KIND[l] == "overrides") && N[l] == 0) print "empty" T app T KEY[l]
  KIND[l] = ""
}

function close_top() {
  close_level(1, app)
  if (KIND[0] == "apps" && !apps) print "empty" T T "apps"
  close_level(0, "")
}

function top(t,   key, rest) {
  if (t == "---" && !keys && !marker) {
    marker = 1
    return
  }
  if (!match(t, /^[A-Za-z_][A-Za-z0-9_-]*:/)) fail(NR)
  key = substr(t, 1, RLENGTH - 1)
  rest = substr(t, RLENGTH + 1)
  if (rest != "" && rest !~ /^[ \t]/) fail(NR)
  rest = trim(rest)
  if (key in seen) fail(NR)
  close_top()
  seen[key] = 1
  keys++
  app = ""
  print "key" T key
  if (key == "version" || key == "check") {
    KIND[0] = "scalar"
    rest = scalar(rest)
    if (rest == "") print "empty" T T key
    else print "value" T key T rest
  } else if (index(LISTS, " " key " ")) {
    list(0, rest, "", key)
  } else if (key == "apps") {
    if (rest ~ /^\{ *\}$/) KIND[0] = "done"
    else if (rest == "") KIND[0] = "apps"
    else fail(NR)
  } else if (key == "overrides") {
    overrides(0, rest)
  } else {
    # An unknown key is a warning, not a parse error; its lines are skipped.
    KIND[0] = "skip"
  }
}

# Under apps: a path two spaces in, its keys four spaces in.
function app_line(t, indent,   key, rest) {
  if (indent == 2 && t !~ /^-( |$)/) {
    if (substr(t, length(t)) != ":") fail(NR)
    close_level(1, app)
    app = scalar(substr(t, 1, length(t) - 1))
    if (app == "" || (app in appseen)) fail(NR)
    appseen[app] = 1
    apps++
    print "app" T app
    return
  }
  if (app == "" || indent < 4) fail(NR)
  if (indent == 4 && t !~ /^-( |$)/) {
    if (!match(t, /^[a-z]+:/)) fail(NR)
    key = substr(t, 1, RLENGTH - 1)
    rest = substr(t, RLENGTH + 1)
    if ((rest != "" && rest !~ /^[ \t]/) || ((app, key) in appkeys)) fail(NR)
    appkeys[app, key] = 1
    rest = trim(rest)
    close_level(1, app)
    if (index(LISTS, " " key " ")) list(1, rest, app, key)
    else if (key == "overrides") overrides(1, rest)
    else fail(NR)
    return
  }
  body(1, t, indent, app)
}

{
  sub(/\r$/, "")
  line = uncomment($0)
  if (line ~ /^[ \t]*$/) next
  if (line ~ /^ *\t/) fail(NR)
  match(line, /^ */)
  indent = RLENGTH
  t = trim(line)
  if (pending != "") {
    if (indent <= pindent) fail(NR)
    pending = pending " " t
    if (closing_bracket(pending)) {
      flow(pending, papp, pkey)
      pending = ""
    }
    next
  }
  if (indent == 0 && t !~ /^-( |$)/) top(t)
  else if (KIND[0] == "apps") app_line(t, indent)
  else body(0, t, indent, "")
}

END {
  if (failed) exit
  if (pending != "") fail(pline)
  close_top()
}
