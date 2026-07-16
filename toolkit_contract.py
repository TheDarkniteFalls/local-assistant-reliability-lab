#!/usr/bin/env python3
"""Derive visitor-facing contracts from the toolkit index."""

from __future__ import annotations


TEMPLATE_CREATE_URL = (
    "https://github.com/new?template_owner=TheDarkniteFalls&"
    "template_name=reliable-ai-work-starter&visibility=private"
)


def runtime_tokens(repo: dict) -> list[str]:
    commands = repo["commands"]
    if repo["kind"] in {"guide", "starter"}:
        tokens = ["no_code"]
        if any("python" in command for command in commands):
            tokens.append("python")
        return tokens
    if any(command.lstrip().startswith(("npm", "node")) for command in commands):
        return ["node"]
    return ["python"]


def runtime_label(repo: dict) -> str:
    tokens = runtime_tokens(repo)
    if tokens == ["node"]:
        return "Node.js 20+"
    if tokens == ["python"]:
        return "Python 3"
    if "python" in tokens:
        return "No code; Python optional"
    return "No code"


def help_type(repo: dict) -> str:
    if repo["kind"] == "starter":
        return "starter"
    if repo["kind"] == "guide":
        return "guide"
    return "runnable_check"


def is_read_only(repo: dict) -> bool:
    return repo["kind"] != "starter"


def operation_label(repo: dict) -> str:
    if repo["kind"] == "starter":
        return "Edits three named local files after approval"
    if repo["kind"] == "guide":
        return "Guidance only"
    return "Read-only check; examples may use temporary files"


def action(repo: dict) -> dict[str, str]:
    if repo["slug"] == "reliable-ai-work-starter":
        return {"label": "Create a private starter", "url": TEMPLATE_CREATE_URL}
    if repo["slug"] == "agent-operator-handbook":
        return {"label": "Read the handbook", "url": repo["url"]}
    return {"label": f"Open {repo['name']}", "url": repo["url"]}


def navigator_entry(repo: dict) -> dict:
    return {
        "slug": repo["slug"],
        "name": repo["name"],
        "url": repo["url"],
        "journey": repo["journey"],
        "kind": repo["kind"],
        "help_type": help_type(repo),
        "maturity": repo["maturity"],
        "minutes": repo["minutes"],
        "runtimes": runtime_tokens(repo),
        "runtime_label": runtime_label(repo),
        "use_when": repo["use_when"],
        "proof": repo["proof"],
        "limitation": repo["limitation"],
        "command": repo["commands"][0],
        "constraints": {
            "local": True,
            "no_model": True,
            "no_network": True,
            "read_only": is_read_only(repo),
        },
        "operation": operation_label(repo),
        "action": action(repo),
    }
