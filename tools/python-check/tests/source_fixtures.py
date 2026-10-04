from pathlib import Path


def python(*lines: str) -> str:
  return ''.join(f'{line}\n' for line in lines)


def function_of(lines: int) -> str:
  return python('def tally() -> int:', *['  total = 0'] * (lines - 2), '  return total')


def write_files(folder: Path, files: dict[str, str]) -> None:
  for name, text in files.items():
    path = folder / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding='utf-8')
