let display;
let historyList;
let history = [];

function initElements() {
    if (!display) display = document.getElementById('display');
    if (!historyList) historyList = document.getElementById('history-list');
    renderHistory();
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initElements);
} else {
    initElements();
}

function appendValue(value) {
    display.value = (display.value || "") + value;
}

function clearDisplay() {
    display.value = "";
}

function deleteLast() {
    display.value = display.value.slice(0, -1);
}

function toggleSign() {
    if (!display.value) return;
    // Simple toggle of the whole expression sign
    if (display.value.startsWith('-')) display.value = display.value.slice(1);
    else display.value = '-' + display.value;
}

function percentage() {
    if (!display.value) return;
    try {
        const expr = transformExpression(display.value);
        const val = Function('"use strict"; return (' + expr + ')')();
        const result = val / 100;
        addHistory(display.value + '%', result);
        display.value = String(result);
    } catch (e) {
        display.value = "Error";
    }
}

function calculate() {
    if (!display.value) return;
    try {
        const expr = transformExpression(display.value);
        const result = Function('"use strict"; return (' + expr + ')')();
        if (typeof result === 'number' && !Number.isFinite(result)) throw new Error('Non-finite');
        addHistory(display.value, result);
        display.value = String(result);
    } catch (e) {
        display.value = "Error";
    }
}

function transformExpression(input) {
    let expr = String(input);
    // Replace common tokens with JavaScript Math equivalents
    expr = expr.replace(/\^/g, '**');
    expr = expr.replace(/\bpi\b/g, 'Math.PI');
    expr = expr.replace(/\be\b/g, 'Math.E');
    expr = expr.replace(/\bsin\(/g, 'Math.sin(');
    expr = expr.replace(/\bcos\(/g, 'Math.cos(');
    expr = expr.replace(/\btan\(/g, 'Math.tan(');
    expr = expr.replace(/\bsqrt\(/g, 'Math.sqrt(');
    expr = expr.replace(/\bln\(/g, 'Math.log('); // natural log
    expr = expr.replace(/\blog\(/g, 'Math.log10('); // base-10 log
    // allow implicit multiply like 2pi or 2(Math...) -> insert * between number and identifier
    expr = expr.replace(/(\d)\s*(Math|pi|e|\()/g, '$1*$2');
    return expr;
}

function addHistory(expr, result) {
    history.unshift({ expr, result });
    if (history.length > 20) history.pop();
    renderHistory();
}

function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = '';
    history.forEach((item, idx) => {
        const li = document.createElement('li');
        li.textContent = `${item.expr} = ${item.result}`;
        li.title = 'Click to reuse expression';
        li.onclick = () => { display.value = item.expr; };
        historyList.appendChild(li);
    });
}

function clearHistory() {
    history = [];
    renderHistory();
}