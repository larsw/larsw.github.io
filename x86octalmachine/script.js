const familyInfo = [
  {
    digit: "0",
    range: "000-077",
    title: "Arithmetic terrain",
    summary:
      "The article's cleanest regularities begin here. The arithmetic family can be read as a repeating pattern across the low byte range.",
    examples: ["000 add Eb, Rb", "004 add AL, Db", "055 sub AX, Dw"],
  },
  {
    digit: "1",
    range: "100-177",
    title: "Jump and control strip",
    summary:
      "This range includes the article's famous conditional-jump run at 160-177, plus other control-oriented one-byte forms.",
    examples: [
      "160-177 conditional jumps",
      "condition code treated as a distinct strip",
      "prototype focuses on the range pattern",
    ],
  },
  {
    digit: "2",
    range: "200-277",
    title: "Move and immediate forms",
    summary:
      "The prototype's anchor demonstrations live here: immediate forms at 200/201/203 and the 210-216 move cluster used to explain xrm and xsm.",
    examples: ["200 xPm Op Eb, Db", "210 xrm mov Eb, Rb", "216 xsm mov SR, Ew"],
  },
  {
    digit: "3",
    range: "300-377",
    title: "Upper byte band",
    summary:
      "This is the top of the one-byte octal space. The prototype keeps it as map context rather than pretending to decode the whole band.",
    examples: [
      "300-377 is still one-byte space",
      "atlas context first",
      "selected cells may remain unlabeled",
    ],
  },
];

const operatorNames = ["add", "or", "adc", "sbb", "and", "sub", "xor", "cmp"];

const opcodeNotes = {
  "000": "add Eb, Rb",
  "001": "add Ew, Rw",
  "002": "add Rb, Eb",
  "003": "add Rw, Ew",
  "004": "add AL, Db",
  "005": "add AX, Dw",
  "010": "or Eb, Rb",
  "014": "or AL, Db",
  "055": "sub AX, Dw",
  "160": "jcc family starts here",
  "177": "jcc family ends here",
  "200": "Op Eb, Db via xPm",
  "201": "Op Ew, Dw via xPm",
  "203": "Op Ew, Dc via xPm",
  "210": "mov Eb, Rb",
  "211": "mov Ew, Rw",
  "212": "mov Rb, Eb",
  "213": "mov Rw, Ew",
  "214": "mov Ew, SR",
  "216": "mov SR, Ew",
};

const byteRegs = ["AL", "CL", "DL", "BL", "AH", "CH", "DH", "BH"];
const wordRegs = ["AX", "CX", "DX", "BX", "SP", "BP", "SI", "DI"];
const dwordRegs = ["EAX", "ECX", "EDX", "EBX", "ESP", "EBP", "ESI", "EDI"];
const segmentRegs = ["ES", "CS", "SS", "DS", "<res>", "<res>", "<res>", "<res>"];

const matrix16 = [
  ["00", "DS:[BX + SI]"],
  ["01", "DS:[BX + DI]"],
  ["02", "SS:[BP + SI]"],
  ["03", "SS:[BP + DI]"],
  ["04", "DS:[SI]"],
  ["05", "DS:[DI]"],
  ["06", "DS:[Dw]"],
  ["07", "DS:[BX]"],
  ["10", "DS:[BX + SI + Dc]"],
  ["11", "DS:[BX + DI + Dc]"],
  ["12", "SS:[BP + SI + Dc]"],
  ["13", "SS:[BP + DI + Dc]"],
  ["14", "DS:[SI + Dc]"],
  ["15", "DS:[DI + Dc]"],
  ["16", "SS:[BP + Dc]"],
  ["17", "DS:[BX + Dc]"],
  ["20", "DS:[BX + SI + Dw]"],
  ["21", "DS:[BX + DI + Dw]"],
  ["22", "SS:[BP + SI + Dw]"],
  ["23", "SS:[BP + DI + Dw]"],
  ["24", "DS:[SI + Dw]"],
  ["25", "DS:[DI + Dw]"],
  ["26", "SS:[BP + Dw]"],
  ["27", "DS:[BX + Dw]"],
  ["30", "AL / AX"],
  ["31", "CL / CX"],
  ["32", "DL / DX"],
  ["33", "BL / BX"],
  ["34", "AH / SP"],
  ["35", "CH / BP"],
  ["36", "DH / SI"],
  ["37", "BH / DI"],
];

const registerGroups = [
  {
    title: "General Register File",
    note:
      "Intel's general 16-bit registers are AX, BX, CX, and DX. Their high and low halves are separately addressable as AH/AL, BH/BL, CH/CL, and DH/DL.",
    entries: [
      ["AX", "Accumulator register used heavily by arithmetic and implicit-operand instructions."],
      ["BX", "Base register that also participates in effective-address formation."],
      ["CX", "Count register used by shifts, loops, and repeated string operations."],
      ["DX", "Data register used with multiply, divide, and port I/O forms."],
    ],
  },
  {
    title: "Pointer and Index Registers",
    note:
      "These stay 16-bit in the original 8086 model and carry the stack and index roles used by effective-address and string instructions.",
    entries: [
      ["SP", "Stack pointer. Tracks the top of the hardware stack in the stack segment."],
      ["BP", "Base pointer. Commonly used for stack-relative addressing and frame-style access."],
      ["SI", "Source index. Used by indexed addressing and source-side string operations."],
      ["DI", "Destination index. Used by indexed addressing and destination-side string operations."],
    ],
  },
  {
    title: "Segment Registers",
    note:
      "The original 8086 exposes four active segment registers. They select code, data, stack, and extra data windows within the one-megabyte physical space.",
    entries: [
      ["CS", "Code segment base for instruction fetch; paired with IP."],
      ["DS", "Default data segment for most ordinary memory operands."],
      ["SS", "Stack segment used with SP, BP, pushes, pops, calls, and returns."],
      ["ES", "Extra segment, most visibly used as the destination segment for string stores and moves."],
    ],
  },
  {
    title: "Execution Context",
    note:
      "Intel's architecture description also centers on the instruction pointer and FLAGS register, plus the split between the Execution Unit and Bus Interface Unit.",
    entries: [
      ["IP", "Instruction pointer offset inside the current code segment."],
      ["FLAGS", "Status and control bits that report arithmetic results and steer execution."],
      ["EU", "Execution Unit, which decodes and executes instructions."],
      ["BIU", "Bus Interface Unit, which fetches instructions and forms physical addresses."],
    ],
  },
];

const flagInfo = [
  ["CF", "Carry", "Set on unsigned carry or borrow."],
  ["PF", "Parity", "Reflects the parity of the low-order byte of the result."],
  ["AF", "Auxiliary", "Tracks carry between bit 3 and bit 4 for BCD-style adjustments."],
  ["ZF", "Zero", "Set when the result is zero."],
  ["SF", "Sign", "Copies the high-order sign bit of the result."],
  ["TF", "Trap", "Enables single-step trap behavior."],
  ["IF", "Interrupt", "Controls recognition of maskable external interrupts."],
  ["DF", "Direction", "Chooses whether string operations auto-increment or auto-decrement SI and DI."],
  ["OF", "Overflow", "Set on signed overflow."],
];

const coverageFamilies = [
  {
    title: "Processor Architecture",
    copy:
      "Intel's baseline covers the execution-unit and bus-interface split, register set, FLAGS, instruction pointer, segmentation, stack behavior, and physical address generation.",
    source: "Intel 1979: processor architecture, memory, stack, and interrupts",
    items: ["EU / BIU", "segmentation", "physical addresses", "stack", "interrupt pointer table", "I/O space"],
  },
  {
    title: "Data Transfers",
    copy:
      "The instruction set does not stop at MOV. Intel groups general transfers, address-object transfers, and flag transfers as distinct parts of the architecture.",
    source: "Intel 1979: data transfer instruction families",
    items: ["MOV", "PUSH", "POP", "XCHG", "IN", "OUT"],
  },
  {
    title: "Address and Flag Transfers",
    copy:
      "The original manuals explicitly separate effective-address and flag-moving operations from ordinary data transfers.",
    source: "Intel 1979: address objects and flag transfers",
    items: ["LEA", "LDS", "LES", "LAHF", "SAHF", "PUSHF / POPF"],
  },
  {
    title: "Arithmetic and Adjust",
    copy:
      "Intel's arithmetic section includes addition and subtraction, multiply and divide, sign extension, and the decimal-adjust instructions used with packed and unpacked BCD.",
    source: "Intel 1979: arithmetic instructions and flags",
    items: ["ADD / ADC", "SUB / SBB / CMP", "INC / DEC / NEG", "MUL / IMUL", "DIV / IDIV", "AAA / AAS / DAA / DAS / AAM / AAD / CBW / CWD"],
  },
  {
    title: "Logic, Shifts, and Rotates",
    copy:
      "Bit manipulation is its own family in the manuals, covering logical operations as well as shifts and rotates through carry.",
    source: "Intel 1979: bit manipulation instructions",
    items: ["AND / OR / XOR / TEST", "NOT", "SHL / SHR / SAR", "ROL / ROR / RCL / RCR"],
  },
  {
    title: "Strings and Repeat Prefixes",
    copy:
      "The 8086 string model is a first-class part of the spec, tied to SI, DI, CX, DF, and the repeat prefixes.",
    source: "Intel 1979: string instructions and string addressing",
    items: ["MOVS", "CMPS", "SCAS", "LODS", "STOS", "REP / REPE / REPNE"],
  },
  {
    title: "Program Transfer",
    copy:
      "Control flow spans unconditional transfers, conditional jumps, subroutine calls and returns, and loop-oriented iteration control.",
    source: "Intel 1979: program transfer instructions",
    items: ["JMP", "CALL / RET", "Jcc", "LOOP / LOOPE / LOOPNE", "JCXZ"],
  },
  {
    title: "Interrupts and Control",
    copy:
      "Intel separates interrupt instructions, processor-control instructions, and flag operations. These are part of the programmer-visible spec, not just hardware trivia.",
    source: "Intel 1979: interrupts, processor control, and flag operations",
    items: ["INT / INTO / IRET", "CLI / STI", "CLD / STD", "CLC / STC / CMC", "HLT"],
  },
  {
    title: "Synchronization and External Interface",
    copy:
      "The manuals also document the edge of the CPU: wait states, coprocessor escape, lock semantics, no-op behavior, and port-based I/O addressing.",
    source: "Intel 1979: external synchronization and I/O",
    items: ["WAIT", "ESC", "LOCK", "NOP", "port addressing", "memory-mapped I/O"],
  },
];

const registerGrid = document.querySelector("#registerGrid");
const flagGrid = document.querySelector("#flagGrid");
const coverageGrid = document.querySelector("#coverageGrid");
const atlasBoards = document.querySelector("#opcodeBoards");
const atlasLegend = document.querySelector("#atlasLegend");
const atlasDetail = document.querySelector("#atlasDetail");
const atlasExamples = document.querySelector("#atlasExamples");
const operatorStrip = document.querySelector("#operatorStrip");
const formulaStack = document.querySelector("#formulaStack");
const sequenceInput = document.querySelector("#sequenceInput");
const decodeSummary = document.querySelector("#decodeSummary");
const decodeBreakdown = document.querySelector("#decodeBreakdown");
const matrixGrid = document.querySelector("#matrixGrid");
const matrixDetail = document.querySelector("#matrixDetail");
const readingResult = document.querySelector("#readingResult");

let activeFamily = "2";
let activeOpcode = "210";
let activeOperator = 0;
let activeMatrixMode = "15";
let activeAddressSize = "16";
let activeWordSize = "16";

function octalColor(digit) {
  return `var(--family-${digit})`;
}

function octalPad(value) {
  return value.toString(8).padStart(3, "0");
}

function signedByteFromOctal(token) {
  const value = parseInt(token, 8);
  return value > 0o177 ? value - 0o400 : value;
}

function formatDisplacement(value) {
  if (!value) {
    return "";
  }
  return value > 0 ? ` + ${value}` : ` - ${Math.abs(value)}`;
}

function getKnownOpcodeNote(opcode) {
  if (opcodeNotes[opcode]) {
    return opcodeNotes[opcode];
  }

  if (/^0[0-7][0-5]$/.test(opcode)) {
    const op = operatorNames[Number.parseInt(opcode[1], 8)];
    const variant = opcode[2];
    const forms = {
      "0": `${op} Eb, Rb`,
      "1": `${op} Ew, Rw`,
      "2": `${op} Rb, Eb`,
      "3": `${op} Rw, Ew`,
      "4": `${op} AL, Db`,
      "5": `${op} AX, Dw`,
    };
    return forms[variant];
  }

  return "Prototype has no exact note for this cell";
}

function getOpcodeTag(opcode) {
  const note = getKnownOpcodeNote(opcode);
  const numericOpcode = parseInt(opcode, 8);

  if (numericOpcode >= 0o160 && numericOpcode <= 0o177) {
    return "jcc";
  }

  if (note.includes("mov")) {
    return "mov";
  }

  if (note.includes("add")) {
    return "add";
  }

  if (note.startsWith("or ")) {
    return "or";
  }

  if (note.includes("sub")) {
    return "sub";
  }

  if (note.includes("via xPm")) {
    return "imm";
  }

  return "";
}

function renderRegisterGrid() {
  registerGrid.innerHTML = "";

  registerGroups.forEach((group) => {
    const card = document.createElement("article");
    card.className = "register-card";
    card.innerHTML = `
      <div>
        <h3 class="register-title">${group.title}</h3>
        <p class="register-note">${group.note}</p>
      </div>
      <div class="register-entry-list">
        ${group.entries
          .map(
            ([name, role]) => `
              <div class="register-entry">
                <code>${name}</code>
                <span class="register-role">${role}</span>
              </div>
            `
          )
          .join("")}
      </div>
    `;
    registerGrid.appendChild(card);
  });
}

function renderFlagGrid() {
  flagGrid.innerHTML = "";

  flagInfo.forEach(([code, name, copy]) => {
    const card = document.createElement("article");
    card.className = "flag-card";
    card.innerHTML = `
      <code class="flag-code">${code}</code>
      <p class="flag-name">${name}</p>
      <p class="flag-copy">${copy}</p>
    `;
    flagGrid.appendChild(card);
  });
}

function renderCoverageGrid() {
  coverageGrid.innerHTML = "";

  coverageFamilies.forEach((family) => {
    const card = document.createElement("article");
    card.className = "coverage-card";
    card.innerHTML = `
      <div>
        <h3 class="coverage-title">${family.title}</h3>
        <p class="coverage-copy">${family.copy}</p>
      </div>
      <p class="coverage-source">${family.source}</p>
      <div class="coverage-chip-list">
        ${family.items.map((item) => `<span class="coverage-item">${item}</span>`).join("")}
      </div>
    `;
    coverageGrid.appendChild(card);
  });
}

function buildAtlasLegend() {
  familyInfo.forEach((family) => {
    const button = document.createElement("button");
    button.className = "range-card";
    button.dataset.family = family.digit;
    button.style.setProperty("--family-color", octalColor(family.digit));
    button.innerHTML = `
      <code>${family.range}</code>
      <span class="range-title">${family.title}</span>
      <span class="range-summary">${family.summary}</span>
    `;
    button.addEventListener("click", () => {
      activeFamily = family.digit;
      if (activeOpcode[0] !== family.digit) {
        activeOpcode = family.range.slice(0, 3);
      }
      renderAtlasLegend();
      renderAtlasBoards();
      renderAtlasDetail(activeOpcode);
    });
    atlasLegend.appendChild(button);
  });
}

function renderAtlasLegend() {
  atlasLegend.querySelectorAll(".range-card").forEach((button) => {
    const isActive = button.dataset.family === activeFamily;
    button.classList.toggle("is-active", isActive);
    button.style.background = isActive
      ? octalColor(button.dataset.family)
      : "linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.72))";
    button.style.borderColor = isActive
      ? "transparent"
      : `color-mix(in srgb, ${octalColor(button.dataset.family)} 26%, rgba(22,19,27,0.08))`;
  });
}

function renderAtlasBoards() {
  atlasBoards.innerHTML = "";

  familyInfo.forEach((family) => {
    const board = document.createElement("section");
    board.className = "opcode-board";
    board.dataset.family = family.digit;
    board.style.setProperty("--board-color", octalColor(family.digit));
    board.classList.toggle("is-active", family.digit === activeFamily);

    const header = document.createElement("div");
    header.className = "opcode-board-header";
    header.innerHTML = `
      <span class="opcode-board-range">${family.range}</span>
      <span class="opcode-board-title">${family.title}</span>
      <span class="opcode-board-note">Rows = middle digit, columns = last digit.</span>
    `;

    const wrap = document.createElement("div");
    wrap.className = "opcode-matrix-wrap";

    const matrix = document.createElement("div");
    matrix.className = "opcode-matrix";

    const corner = document.createElement("div");
    corner.className = "opcode-axis opcode-corner";
    corner.innerHTML = `<span>mid</span><span>low</span>`;
    matrix.appendChild(corner);

    for (let column = 0; column < 8; column += 1) {
      const axis = document.createElement("div");
      axis.className = "opcode-axis is-column";
      axis.textContent = String(column);
      matrix.appendChild(axis);
    }

    for (let row = 0; row < 8; row += 1) {
      const rowAxis = document.createElement("div");
      rowAxis.className = "opcode-axis is-row";
      rowAxis.textContent = `${family.digit}${row}`;
      matrix.appendChild(rowAxis);

      for (let column = 0; column < 8; column += 1) {
        const opcode = `${family.digit}${row}${column}`;
        const note = getKnownOpcodeNote(opcode);
        const tag = getOpcodeTag(opcode);
        const cell = document.createElement("button");
        const isActive = opcode === activeOpcode;
        const isKnown = Boolean(tag);
        cell.className = "opcode-microcell";
        cell.classList.toggle("is-active", isActive);
        cell.classList.toggle("is-known", isKnown);
        cell.dataset.opcode = opcode;
        cell.style.setProperty("--board-color", octalColor(family.digit));
        cell.title = note !== "Prototype has no exact note for this cell" ? note : opcode;
        cell.innerHTML = `
          <span class="opcode-micro-code">${opcode}</span>
          <span class="opcode-tag ${isKnown ? "" : "is-empty"}">${tag || "anchor"}</span>
        `;
        cell.addEventListener("click", () => {
          activeFamily = family.digit;
          activeOpcode = opcode;
          renderAtlasLegend();
          renderAtlasBoards();
          renderAtlasDetail(opcode);
        });
        matrix.appendChild(cell);
      }
    }

    wrap.appendChild(matrix);
    board.appendChild(header);
    board.appendChild(wrap);
    atlasBoards.appendChild(board);
  });
}

function renderAtlasDetail(opcode) {
  const family = familyInfo.find((item) => item.digit === opcode[0]) || familyInfo[0];
  const note = getKnownOpcodeNote(opcode);
  atlasDetail.querySelector("h3").textContent = opcode;
  atlasDetail.querySelector(".detail-summary").innerHTML = `
    <code>${opcode}</code> sits inside range <code>${family.range}</code>.
    ${family.summary}
    ${note !== "Prototype has no exact note for this cell" ? ` Selected cell: <code>${note}</code>.` : ""}
  `;

  const details = atlasDetail.querySelectorAll(".detail-list dd");
  details[0].textContent = `${family.range} is the valid byte span for leading octal digit ${opcode[0]}.`;
  details[1].textContent = `${opcode[1]} splits that span into an 8-byte run: ${opcode[0]}${opcode[1]}0-${opcode[0]}${opcode[1]}7.`;
  details[2].textContent = `${opcode[2]} picks one opcode inside that run.`;

  atlasExamples.innerHTML = "";
  family.examples.forEach((example) => {
    const pill = document.createElement("div");
    pill.className = "detail-tag";
    pill.textContent = example;
    atlasExamples.appendChild(pill);
  });
}

function buildOperatorStrip() {
  operatorNames.forEach((name, index) => {
    const button = document.createElement("button");
    button.className = "operator-chip";
    button.dataset.operator = String(index);
    button.textContent = `${index} · ${name}`;
    button.addEventListener("click", () => {
      activeOperator = index;
      renderOperatorStrip();
      renderFormulaStack();
    });
    operatorStrip.appendChild(button);
  });
}

function renderOperatorStrip() {
  operatorStrip.querySelectorAll(".operator-chip").forEach((button) => {
    const isActive = Number(button.dataset.operator) === activeOperator;
    button.classList.toggle("is-active", isActive);
    button.style.background = isActive ? octalColor("0") : "rgba(255,255,255,0.7)";
  });
}

function renderFormulaStack() {
  const operatorDigit = activeOperator.toString(8);
  const opName = operatorNames[activeOperator];
  const lines = [
    [`0${operatorDigit}0`, `${opName} Eb, Rb`],
    [`0${operatorDigit}1`, `${opName} Ew, Rw`],
    [`0${operatorDigit}2`, `${opName} Rb, Eb`],
    [`0${operatorDigit}3`, `${opName} Rw, Ew`],
    [`0${operatorDigit}4`, `${opName} AL, Db`],
    [`0${operatorDigit}5`, `${opName} AX, Dw`],
  ];

  formulaStack.innerHTML = "";
  lines.forEach(([opcode, meaning]) => {
    const line = document.createElement("div");
    line.className = "formula-line";
    line.innerHTML = `
      <code class="formula-opcode">${opcode}</code>
      <span>${meaning}</span>
    `;
    formulaStack.appendChild(line);
  });
}

function resolve16BitMode(x, m, width, displacementToken) {
  if (x === 3) {
    return width === "byte" ? byteRegs[m] : wordRegs[m];
  }

  if (x === 0 && m === 6) {
    return `DS:[${displacementToken || "Dw"}]`;
  }

  const bases = [
    "DS:[BX + SI",
    "DS:[BX + DI",
    "SS:[BP + SI",
    "SS:[BP + DI",
    "DS:[SI",
    "DS:[DI",
    "SS:[BP",
    "DS:[BX",
  ];

  let displacement = "";
  if (x === 1 && displacementToken) {
    displacement = formatDisplacement(signedByteFromOctal(displacementToken));
  } else if (x === 2 && displacementToken) {
    displacement = ` + ${parseInt(displacementToken, 8)}`;
  }

  return `${bases[m]}${displacement}]`;
}

function decodeSequence(raw) {
  const tokens = raw
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!tokens.length) {
    return {
      title: "No sequence",
      summary: "Enter octal bytes separated by spaces.",
      bullets: [],
    };
  }

  const opcode = tokens[0];
  if (!/^[0-7]{3}$/.test(opcode)) {
    return {
      title: "Invalid opcode",
      summary: "The first token must be a three-digit octal byte.",
      bullets: [],
    };
  }

  if (["210", "211", "212", "213"].includes(opcode) && /^[0-7]{3}$/.test(tokens[1] || "")) {
    const x = Number.parseInt(tokens[1][0], 8);
    const m = Number.parseInt(tokens[1][1], 8);
    const r = Number.parseInt(tokens[1][2], 8);
    const displacement = tokens[2];
    const leftWidth = opcode === "210" || opcode === "212" ? "byte" : "word";
    const reg = leftWidth === "byte" ? byteRegs[r] : wordRegs[r];
    const ea = resolve16BitMode(x, m, leftWidth, displacement);
    const direction = {
      "210": `${ea}, ${reg}`,
      "211": `${ea}, ${reg}`,
      "212": `${reg}, ${ea}`,
      "213": `${reg}, ${ea}`,
    }[opcode];

    return {
      title: `Decoded ${opcode}`,
      summary: `<code>${opcode}</code> means <code>${getKnownOpcodeNote(opcode)}</code>, so <code>xrm = ${tokens[1]}</code> becomes <code>${direction}</code>.`,
      bullets: [
        `<code>x = ${x}</code> and <code>m = ${m}</code> combine as <code>xm = ${x}${m}</code>.`,
        `<code>r = ${r}</code> selects register <code>${reg}</code>.`,
        x === 1 && displacement
          ? `Signed byte displacement <code>${displacement}</code> becomes <code>${signedByteFromOctal(displacement)}</code>.`
          : x === 2 && displacement
            ? `Word displacement <code>${displacement}</code> becomes decimal <code>${parseInt(displacement, 8)}</code>.`
            : "No extra displacement is needed for this mode.",
      ],
      finalAssembly: `mov ${direction}`,
    };
  }

  if (["214", "216"].includes(opcode) && /^[0-7]{3}$/.test(tokens[1] || "")) {
    const x = Number.parseInt(tokens[1][0], 8);
    const s = Number.parseInt(tokens[1][1], 8);
    const m = Number.parseInt(tokens[1][2], 8);
    const displacement = tokens[2];
    const sr = segmentRegs[s];
    const ea = resolve16BitMode(x, m, "word", displacement);
    const operand = opcode === "214" ? `${ea}, ${sr}` : `${sr}, ${ea}`;

    return {
      title: `Decoded ${opcode}`,
      summary: `<code>${opcode}</code> uses <code>xsm</code>, not <code>xrm</code>. The middle digit selects segment register <code>${sr}</code>.`,
      bullets: [
        `<code>x = ${x}</code> and <code>m = ${m}</code> still form <code>xm = ${x}${m}</code>.`,
        `<code>s = ${s}</code> selects segment register <code>${sr}</code>.`,
        x === 3 ? "Because x = 3, the effective address collapses to a register operand." : `Address mode resolves to <code>${ea}</code>.`,
      ],
      finalAssembly: `mov ${operand}`,
    };
  }

  if (/^0[0-7][0-5]$/.test(opcode)) {
    const p = Number.parseInt(opcode[1], 8);
    const variant = opcode[2];
    const opName = operatorNames[p];

    if (["0", "1", "2", "3"].includes(variant) && /^[0-7]{3}$/.test(tokens[1] || "")) {
      const x = Number.parseInt(tokens[1][0], 8);
      const m = Number.parseInt(tokens[1][1], 8);
      const r = Number.parseInt(tokens[1][2], 8);
      const displacement = tokens[2];
      const width = variant === "0" || variant === "2" ? "byte" : "word";
      const reg = width === "byte" ? byteRegs[r] : wordRegs[r];
      const ea = resolve16BitMode(x, m, width, displacement);
      const operand = {
        "0": `${ea}, ${reg}`,
        "1": `${ea}, ${reg}`,
        "2": `${reg}, ${ea}`,
        "3": `${reg}, ${ea}`,
      }[variant];
      return {
        title: `Decoded ${opcode}`,
        summary: `This is the arithmetic pattern <code>${getKnownOpcodeNote(opcode)}</code>. The operator digit <code>P = ${p}</code> selects <code>${opName}</code>.`,
        bullets: [
          `<code>x = ${x}</code>, <code>m = ${m}</code>, and <code>r = ${r}</code> split the operand grammar.`,
          `<code>r = ${r}</code> selects <code>${reg}</code>.`,
          `The effective address side resolves to <code>${ea}</code>.`,
        ],
        finalAssembly: `${opName} ${operand}`,
      };
    }

    if (variant === "4" && tokens[1]) {
      return {
        title: `Decoded ${opcode}`,
        summary: `<code>${opcode}</code> is the accumulator-immediate form <code>${opName} AL, Db</code>.`,
        bullets: [`Immediate constant <code>${tokens[1]}</code> is carried directly after the opcode.`],
        finalAssembly: `${opName} AL, ${parseInt(tokens[1], 8)}`,
      };
    }

    if (variant === "5" && tokens[1]) {
      return {
        title: `Decoded ${opcode}`,
        summary: `<code>${opcode}</code> is the accumulator-immediate form <code>${opName} AX, Dw</code>.`,
        bullets: [`Immediate constant <code>${tokens[1]}</code> is carried directly after the opcode.`],
        finalAssembly: `${opName} AX, ${parseInt(tokens[1], 8)}`,
      };
    }
  }

  return {
    title: `No prototype decoder for ${opcode}`,
    summary:
      "This page only decodes the article's demonstration patterns. The atlas above still helps you place the opcode in octal space.",
    bullets: [
      `Band: <code>${opcode[0]}xx</code>.`,
      `Known note: <code>${getKnownOpcodeNote(opcode)}</code>.`,
    ],
  };
}

function renderDecode(raw) {
  const result = decodeSequence(raw);
  decodeSummary.innerHTML = `
    <p class="note-kicker">Summary</p>
    <h3>${result.title}</h3>
    <p>${result.summary}</p>
    ${result.finalAssembly ? `<p><strong>Assembly:</strong> <code>${result.finalAssembly}</code></p>` : ""}
  `;

  decodeBreakdown.innerHTML = `
    <p class="note-kicker">Breakdown</p>
    <h3>What the digits are doing</h3>
    ${result.bullets.length ? `<ul>${result.bullets.map((item) => `<li>${item}</li>`).join("")}</ul>` : "<p>No extra detail for this sequence.</p>"}
  `;
}

function buildMatrix() {
  matrix16.forEach(([code, label]) => {
    const cell = document.createElement("button");
    const isRegister = code[0] === "3";
    cell.className = "matrix-cell";
    cell.classList.toggle("is-register", isRegister);
    cell.dataset.mode = code;
    cell.innerHTML = `
      <span class="matrix-code">${code}</span>
      <span class="matrix-caption">${label}</span>
    `;
    cell.addEventListener("click", () => {
      activeMatrixMode = code;
      renderMatrix();
      renderMatrixDetail(code);
    });
    matrixGrid.appendChild(cell);
  });
}

function renderMatrix() {
  matrixGrid.querySelectorAll(".matrix-cell").forEach((cell) => {
    cell.classList.toggle("is-active", cell.dataset.mode === activeMatrixMode);
  });
}

function renderMatrixDetail(mode) {
  const [xChar, mChar] = mode.split("");
  const x = Number.parseInt(xChar, 8);
  const label = matrix16.find(([code]) => code === mode)?.[1] || "";
  const dds = matrixDetail.querySelectorAll(".detail-list dd");
  matrixDetail.querySelector("h3").textContent = mode;
  matrixDetail.querySelector(".detail-summary").innerHTML = `
    <code>${mode}</code> resolves to <code>${label}</code>.
  `;
  dds[0].innerHTML =
    x === 3
      ? `<code>Eb</code> uses register form and resolves directly to <code>${label}</code>, with no memory lookup.`
      : `<code>Eb</code> uses this address form and points to a byte-sized object: <code>${label}</code>.`;
  dds[1].innerHTML =
    x === 3
      ? `<code>Ew</code> uses the same register form and resolves directly to <code>${label}</code>.`
      : `<code>Ew</code> uses the same address form and points to a word-sized object: <code>${label}</code>.`;
  dds[2].textContent =
    x === 0
      ? "No displacement unless m = 6, which becomes direct memory."
      : x === 1
        ? "One signed-byte displacement follows the mode."
        : x === 2
          ? "One word displacement follows the mode."
          : "Register mode: no memory addressing.";
}

function renderReading() {
  const reg = activeWordSize === "16" ? "BX" : "EBX";
  const base = activeAddressSize === "16" ? "DI" : "EBP";
  const width = activeWordSize === "16" ? "word" : "dword";
  readingResult.innerHTML = `
    <p class="note-kicker">Rendered instruction</p>
    <code>mov ${width} ptr [${base} - 3], ${reg}</code>
  `;
}

function bindPresetButtons() {
  document.querySelectorAll(".preset-button").forEach((button) => {
    button.addEventListener("click", () => {
      sequenceInput.value = button.dataset.sequence;
      renderDecode(sequenceInput.value);
    });
  });
}

function bindSegmentedToggle(groupSelector, callback) {
  const group = document.querySelector(groupSelector);
  group.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      group.querySelectorAll("button").forEach((candidate) => {
        candidate.classList.toggle("is-active", candidate === button);
      });
      callback(button.dataset.value);
    });
  });
}

function setupRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll(".reveal").forEach((node) => observer.observe(node));
}

renderRegisterGrid();
renderFlagGrid();
renderCoverageGrid();
buildAtlasLegend();
renderAtlasLegend();
renderAtlasBoards();
renderAtlasDetail(activeOpcode);
buildOperatorStrip();
renderOperatorStrip();
renderFormulaStack();
bindPresetButtons();
renderDecode(sequenceInput.value);
sequenceInput.addEventListener("input", (event) => renderDecode(event.target.value));
buildMatrix();
renderMatrix();
renderMatrixDetail(activeMatrixMode);
renderReading();
bindSegmentedToggle("#addressSizeToggle", (value) => {
  activeAddressSize = value;
  renderReading();
});
bindSegmentedToggle("#wordSizeToggle", (value) => {
  activeWordSize = value;
  renderReading();
});
setupRevealObserver();
