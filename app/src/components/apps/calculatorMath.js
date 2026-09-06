function tokenize(source) {
  const normalized = source
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replaceAll("−", "-")
    .replaceAll("π", "pi");
  const tokens = [];
  let index = 0;

  while (index < normalized.length) {
    const rest = normalized.slice(index);
    const whitespace = rest.match(/^\s+/);
    if (whitespace) {
      index += whitespace[0].length;
      continue;
    }

    const number = rest.match(/^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i);
    if (number) {
      tokens.push({ type: "number", value: Number(number[0]) });
      index += number[0].length;
      continue;
    }

    const identifier = rest.match(/^[a-z]+/i);
    if (identifier) {
      tokens.push({ type: "identifier", value: identifier[0].toLowerCase() });
      index += identifier[0].length;
      continue;
    }

    if ("+-*/^%()".includes(rest[0])) {
      tokens.push({ type: rest[0], value: rest[0] });
      index += 1;
      continue;
    }

    throw new Error("Unsupported character");
  }

  return tokens;
}

export function evaluateExpression(source, { angleMode = "DEG", answer = 0 } = {}) {
  const tokens = tokenize(source);
  let position = 0;

  const peek = () => tokens[position];
  const take = (type) => {
    const token = tokens[position];
    if (!token || token.type !== type) throw new Error(`Expected ${type}`);
    position += 1;
    return token;
  };

  function toRadians(value) {
    return angleMode === "DEG" ? (value * Math.PI) / 180 : value;
  }

  const functions = {
    sin: (value) => Math.sin(toRadians(value)),
    cos: (value) => Math.cos(toRadians(value)),
    tan: (value) => Math.tan(toRadians(value)),
    ln: (value) => Math.log(value),
    log: (value) => Math.log10(value),
    sqrt: (value) => Math.sqrt(value),
    abs: (value) => Math.abs(value),
  };

  function parsePrimary() {
    const token = peek();
    if (!token) throw new Error("Expected a value");
    if (token.type === "number") {
      position += 1;
      return token.value;
    }
    if (token.type === "(") {
      position += 1;
      const value = parseExpression();
      take(")");
      return value;
    }
    if (token.type === "identifier") {
      position += 1;
      if (token.value === "pi") return Math.PI;
      if (token.value === "e") return Math.E;
      if (token.value === "ans") return answer;
      const operation = functions[token.value];
      if (!operation) throw new Error("Unknown function");
      take("(");
      const value = operation(parseExpression());
      take(")");
      return value;
    }
    throw new Error("Expected a value");
  }

  function parsePostfix() {
    let value = parsePrimary();
    while (peek()?.type === "%") {
      position += 1;
      value /= 100;
    }
    return value;
  }

  function parsePower() {
    let value = parsePostfix();
    if (peek()?.type === "^") {
      position += 1;
      value **= parseUnary();
    }
    return value;
  }

  function parseUnary() {
    if (peek()?.type === "+") {
      position += 1;
      return parseUnary();
    }
    if (peek()?.type === "-") {
      position += 1;
      return -parseUnary();
    }
    return parsePower();
  }

  function startsImplicitFactor(token) {
    return token && (token.type === "number" || token.type === "identifier" || token.type === "(");
  }

  function parseTerm() {
    let value = parseUnary();
    while (true) {
      if (peek()?.type === "*") {
        position += 1;
        value *= parseUnary();
      } else if (peek()?.type === "/") {
        position += 1;
        value /= parseUnary();
      } else if (startsImplicitFactor(peek())) {
        value *= parseUnary();
      } else {
        break;
      }
    }
    return value;
  }

  function parseExpression() {
    let value = parseTerm();
    while (peek()?.type === "+" || peek()?.type === "-") {
      const operator = tokens[position].type;
      position += 1;
      const right = parseTerm();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }

  if (tokens.length === 0) throw new Error("Empty expression");
  const value = parseExpression();
  if (position !== tokens.length || !Number.isFinite(value)) throw new Error("Invalid result");
  return value;
}

export function formatCalculatorResult(value) {
  if (!Number.isFinite(value)) return "Error";
  const rounded = Number(value.toPrecision(12));
  const plain = String(rounded);
  return plain.length > 16 ? rounded.toExponential(8) : plain;
}
