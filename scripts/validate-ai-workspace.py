"""Validate project-scoped coding agents and skill discovery.

@author Wichit Wongta
@since 2026-08-21
"""

from __future__ import annotations

import re
import sys
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NAME = re.compile(r"^[a-z][a-z0-9-]*$")


def _frontmatter(path: Path, errors: list[str]) -> tuple[dict[str, str], str]:
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as exc:
        errors.append(f"{path.relative_to(ROOT)}: unreadable: {exc}")
        return {}, ""
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        errors.append(f"{path.relative_to(ROOT)}: missing YAML frontmatter")
        return {}, text
    metadata: dict[str, str] = {}
    for line in lines[1:]:
        if line.strip() == "---":
            break
        if ":" not in line or line[:1].isspace():
            continue
        key, value = line.split(":", 1)
        metadata[key.strip()] = value.strip().strip("'\"")
    else:
        errors.append(f"{path.relative_to(ROOT)}: unterminated YAML frontmatter")
    return metadata, text


def _required(
    path: Path,
    data: dict[str, object],
    keys: tuple[str, ...],
    errors: list[str],
) -> None:
    for key in keys:
        value = data.get(key)
        if not isinstance(value, str) or not value.strip():
            errors.append(f"{path.relative_to(ROOT)}: {key!r} must be a non-empty string")


def _codex_agents(errors: list[str]) -> set[str]:
    config_path = ROOT / ".codex" / "config.toml"
    try:
        config = tomllib.loads(config_path.read_text(encoding="utf-8"))
    except (OSError, tomllib.TOMLDecodeError) as exc:
        errors.append(f"{config_path.relative_to(ROOT)}: invalid TOML: {exc}")
        return set()
    agents_config = config.get("agents", {})
    if agents_config.get("enabled") is not True:
        errors.append(".codex/config.toml: agents.enabled must be true")
    concurrency = agents_config.get("max_concurrent_threads_per_session")
    if not isinstance(concurrency, int) or concurrency < 1:
        errors.append(".codex/config.toml: concurrency must be a positive integer")

    names: set[str] = set()
    paths = sorted((ROOT / ".codex" / "agents").glob("*.toml"))
    for path in paths:
        try:
            data = tomllib.loads(path.read_text(encoding="utf-8"))
        except (OSError, tomllib.TOMLDecodeError) as exc:
            errors.append(f"{path.relative_to(ROOT)}: invalid TOML: {exc}")
            continue
        _required(path, data, ("name", "description", "developer_instructions"), errors)
        name = data.get("name")
        if isinstance(name, str):
            if not NAME.fullmatch(name):
                errors.append(f"{path.relative_to(ROOT)}: invalid agent name {name!r}")
            if name in names:
                errors.append(f"{path.relative_to(ROOT)}: duplicate agent name {name!r}")
            names.add(name)
    if not paths:
        errors.append(".codex/agents: no project agents found")
    return names


def _claude_agents(errors: list[str]) -> set[str]:
    names: set[str] = set()
    paths = sorted((ROOT / ".claude" / "agents").glob("*.md"))
    for path in paths:
        data, _ = _frontmatter(path, errors)
        _required(path, data, ("name", "description"), errors)
        name = data.get("name")
        if name:
            if not NAME.fullmatch(name):
                errors.append(f"{path.relative_to(ROOT)}: invalid agent name {name!r}")
            if name in names:
                errors.append(f"{path.relative_to(ROOT)}: duplicate agent name {name!r}")
            names.add(name)
    if not paths:
        errors.append(".claude/agents: no project agents found")
    return names


def _skills(root: Path, errors: list[str]) -> dict[str, tuple[Path, str]]:
    found: dict[str, tuple[Path, str]] = {}
    for path in sorted(root.glob("*/SKILL.md")):
        data, text = _frontmatter(path, errors)
        _required(path, data, ("name", "description"), errors)
        name = data.get("name")
        if not name:
            continue
        if not NAME.fullmatch(name):
            errors.append(f"{path.relative_to(ROOT)}: invalid skill name {name!r}")
        if path.parent.name != name:
            errors.append(f"{path.relative_to(ROOT)}: directory must match skill name {name!r}")
        found[name] = (path, text)
    if not found:
        errors.append(f"{root.relative_to(ROOT)}: no project skills found")
    return found


def _validate_skills(errors: list[str]) -> int:
    codex = _skills(ROOT / ".agents" / "skills", errors)
    claude = _skills(ROOT / ".claude" / "skills", errors)
    if codex.keys() != claude.keys():
        errors.append(f"skill roots differ: Codex={sorted(codex)} Claude={sorted(claude)}")
    for name in codex.keys() & claude.keys():
        codex_text = codex[name][1]
        claude_text = claude[name][1]
        canonical_ref = f".claude/skills/{name}/SKILL.md"
        if codex_text != claude_text and canonical_ref not in codex_text.replace("\\", "/"):
            errors.append(f"skill {name!r}: Codex entrypoint neither mirrors nor routes to Claude")
    return len(codex)


def main() -> int:
    errors: list[str] = []
    if not (ROOT / "AGENTS.md").is_file():
        errors.append("AGENTS.md: missing repository instructions")
    try:
        claude_context = (ROOT / "CLAUDE.md").read_text(encoding="utf-8")
    except OSError as exc:
        errors.append(f"CLAUDE.md: unreadable: {exc}")
        claude_context = ""
    if "@AGENTS.md" not in claude_context:
        errors.append("CLAUDE.md: must import @AGENTS.md")

    codex_agents = _codex_agents(errors)
    claude_agents = _claude_agents(errors)
    if codex_agents != claude_agents:
        errors.append(
            "agent profiles differ: "
            f"Codex={sorted(codex_agents)} Claude={sorted(claude_agents)}"
        )
    skill_count = _validate_skills(errors)

    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print(f"AI workspace valid: {len(codex_agents)} paired agents, {skill_count} skill(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
