# A value that cannot be decoded prints nothing, so the hook goes on as if the
# field were absent.

BEGIN {
  ESCAPED["\""] = "\""
  ESCAPED["\\"] = "\\"
  ESCAPED["/"] = "/"
  ESCAPED["b"] = sprintf("%c", 8)
  ESCAPED["f"] = sprintf("%c", 12)
  ESCAPED["n"] = "\n"
  ESCAPED["r"] = "\r"
  ESCAPED["t"] = "\t"
}

function hex(digits,   k, d, value) {
  if (length(digits) != 4) return -1
  value = 0
  for (k = 1; k <= 4; k++) {
    d = index("0123456789abcdef", tolower(substr(digits, k, 1)))
    if (!d) return -1
    value = value * 16 + d - 1
  }
  return value
}

function utf8(code) {
  if (code < 128) return sprintf("%c", code)
  if (code < 2048) return sprintf("%c%c", 192 + int(code / 64), 128 + code % 64)
  if (code < 65536) return sprintf("%c%c%c", 224 + int(code / 4096), 128 + int(code / 64) % 64, 128 + code % 64)
  return sprintf("%c%c%c%c", 240 + int(code / 262144), 128 + int(code / 4096) % 64, 128 + int(code / 64) % 64, 128 + code % 64)
}

{ text = text $0 "\n" }

END {
  if (!match(text, "\"" ENVIRON["CONSTITUTION_FIELD"] "\"[ \t\n]*:[ \t\n]*\"")) exit
  s = substr(text, RSTART + RLENGTH)
  n = length(s)
  out = ""
  for (i = 1; i <= n; i++) {
    c = substr(s, i, 1)
    if (c == "\"") {
      print out
      exit
    }
    if (c != "\\") {
      out = out c
      continue
    }
    c = substr(s, ++i, 1)
    if (c in ESCAPED) {
      out = out ESCAPED[c]
      continue
    }
    if (c != "u") exit
    code = hex(substr(s, i + 1, 4))
    i += 4
    # A character past the first plane comes as a pair of surrogates.
    if (code >= 55296 && code < 56320 && substr(s, i + 1, 2) == "\\u") {
      low = hex(substr(s, i + 3, 4))
      if (low >= 56320 && low < 57344) {
        code = 65536 + (code - 55296) * 1024 + low - 56320
        i += 6
      }
    }
    # A NUL cannot live in a shell variable.
    if (code < 1) exit
    out = out utf8(code)
  }
}
