# ​openclaw config

# 

[​

](#openclaw-config)

`openclaw config`

Config helpers: get/set/unset values by path. Run without a subcommand to open the configure wizard (same as `openclaw configure`).

## 

[​

](#examples)

Examples

Copy

```
openclaw config get browser.executablePath
openclaw config set browser.executablePath "/usr/bin/google-chrome"
openclaw config set agents.defaults.heartbeat.every "2h"
openclaw config set agents.list[0].tools.exec.node "node-id-or-name"
openclaw config unset tools.web.search.apiKey
```

## 

[​

](#paths)

Paths

Paths use dot or bracket notation:

Copy

```
openclaw config get agents.defaults.workspace
openclaw config get agents.list[0].id
```

Use the agent list index to target a specific agent:

Copy

```
openclaw config get agents.list
openclaw config set agents.list[1].tools.exec.node "node-id-or-name"
```

## 

[​

](#values)

Values

Values are parsed as JSON5 when possible; otherwise they are treated as strings. Use `--strict-json` to require JSON5 parsing. `--json` remains supported as a legacy alias.

Copy

```
openclaw config set agents.defaults.heartbeat.every "0m"
openclaw config set gateway.port 19001 --strict-json
openclaw config set channels.whatsapp.groups '["*"]' --strict-json
```

Restart the gateway after edits.