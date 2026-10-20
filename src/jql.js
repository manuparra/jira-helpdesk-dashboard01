export function addJqlClause(baseJql, clause) {
  return `${baseJql}${clause ? ` AND (${clause})` : ''} ORDER BY updated DESC`;
}

export function jqlString(value) {
  return `"${String(value).replaceAll('"', '\\"')}"`;
}
