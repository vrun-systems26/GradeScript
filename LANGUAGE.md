# ShieldQL language reference

## A rule

Every ShieldQL source file (or playground buffer) is one or more `rule`
blocks:

```
rule <Name> {
  when <expression>
  within <duration>          // optional
  severity: <low|medium|high|critical>   // optional, defaults to medium
  tags: <string>, <string>, ...          // optional
  description: <string>                  // optional
}
```

- `<Name>` is a bare identifier (letters, digits, underscore; must not start
  with a digit).
- `when` is required and must be present exactly once.
- `within`, `severity`, `tags`, and `description` are optional and may
  appear in any order.

## Expressions

```
expr       := or
or         := and ( "or" and )*
and        := unary ( "and" unary )*
unary      := "not" unary | comparison
comparison := primary ( op primary )?
op         := "==" | "!=" | ">=" | "<=" | ">" | "<" | "contains"
primary    := path | STRING | NUMBER | DURATION | "true" | "false" | "(" or ")"
path       := IDENT ( "." IDENT )*
```

`and` binds tighter than `or`, matching most C-family languages. Use
parentheses to override precedence, e.g. `(a or b) and c`.

## Fields

Fields are referenced as dotted paths. By convention the two roots are:

- `event.*` — fields on the event being evaluated (e.g. `event.type`,
  `event.failed_attempts`).
- `user.*` — fields on the user/account associated with the event (e.g.
  `user.home_country`, `user.is_admin`).

Any root name is legal — the interpreter resolves whatever context object
you pass it — but `event` and `user` are what the code generators and
sample data use.

## Literals

- **String:** `"double quoted"`, supports `\"` and `\\` escapes.
- **Number:** `5`, `900`, `500000000`, `0.5`.
- **Duration:** a number immediately followed by a unit with no space —
  `10m`, `30s`, `1h`, `7d`, `500ms`. Valid units: `ms`, `s`, `m`, `h`, `d`.
  Durations are only meaningful after `within` in the current version.
- **Boolean:** `true`, `false`.

## Operators

| Operator   | Meaning                          |
|------------|-----------------------------------|
| `==`       | equal                             |
| `!=`       | not equal                         |
| `>=` `<=`  | greater/less than or equal        |
| `>` `<`    | greater/less than                 |
| `contains` | left string contains right string |
| `and`      | logical and (short-circuiting)    |
| `or`       | logical or (short-circuiting)     |
| `not`      | logical negation                  |

## Comments

`// ...` runs to the end of the line. There are no block comments.

## Full example

```
// Flags a process spawned by a non-admin user that requests admin-level
// privileges while running PowerShell.
rule PrivilegeEscalation {
  when event.type == "process_start"
    and event.requested_privilege == "admin"
    and user.is_admin == false
    and event.process contains "powershell"
  within 5m
  severity: critical
  tags: "privilege-escalation", "endpoint"
  description: "Non-admin user's PowerShell process requested admin privileges"
}
```

## Grammar notes for the curious

- The lexer, parser, interpreter, and all three code generators live in a
  single dependency-free file, [`engine.js`](engine.js), so the whole
  language implementation is readable top to bottom in one sitting.
- The parser is a straightforward recursive-descent implementation — there's
  no parser generator or grammar DSL involved, which keeps error messages
  precise (`ParseError` and `LexError` carry line/column information).
- The interpreter and the three code generators all walk the *same* AST
  produced by the parser — none of them re-parses or re-derives it — which
  is what guarantees a rule can't silently mean something different in
  Splunk than it does in Elastic.
