// C# Console Simulator V2 (Pro Edition)
// High-fidelity .NET CLI simulation

document.addEventListener('DOMContentLoaded', () => {
    createTerminal();
});

function createTerminal() {
    // 1. Create the Terminal Button (FAB)
    const fab = document.createElement('button');
    fab.innerHTML = '<span style="color:var(--accent-neon)">>_</span> Console';
    fab.className = 'terminal-fab';
    fab.onclick = toggleTerminal;
    // Force LTR for consistency
    fab.style.direction = 'ltr';
    fab.style.textAlign = 'left';
    document.body.appendChild(fab);

    // 2. Create the Terminal Window
    const termInfo = `
<div class="terminal-overlay" id="terminal-overlay" style="direction: ltr; text-align: left;">
    <div class="terminal-window">
        <div class="terminal-header">
            <div class="term-buttons">
                <span class="term-btn term-close" onclick="toggleTerminal()"></span>
                <span class="term-btn term-min"></span>
                <span class="term-btn term-max"></span>
            </div>
            <div class="term-title">Administrator: PowerShell - .NET 10.0</div>
        </div>
        <div class="terminal-body" id="term-body">
            <div class="term-line" style="color:white">PowerShell 7.4.2</div>
            <div class="term-line">Copyright (c) Microsoft Corporation. All rights reserved.</div>
            <div class="term-line"><br></div>
            <div class="term-line">Loading .NET SDK 10.0.100... <span style="color:#4ec9b0">[OK]</span></div>
            <div class="term-line"><br></div>
            <div class="term-line">Type <span style="color:#569cd6">"help"</span> to view available commands.</div>
            <div class="term-line"><br></div>
            
            <div class="term-input-line">
                <span class="prompt">PS C:\\Users\\Student\\source\\repos></span>
                <input type="text" class="term-input" id="term-input" autocomplete="off" spellcheck="false">
            </div>
        </div>
    </div>
</div>`;

    const div = document.createElement('div');
    div.innerHTML = termInfo;
    document.body.appendChild(div);

    // 3. Event Listeners
    const input = document.getElementById('term-input');
    const overlay = document.getElementById('terminal-overlay');

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            processCommand(input.value);
            input.value = '';
        }
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) toggleTerminal();
    });
}

function toggleTerminal() {
    const overlay = document.getElementById('terminal-overlay');
    const input = document.getElementById('term-input');

    if (overlay.classList.contains('open')) {
        overlay.classList.remove('open');
    } else {
        overlay.classList.add('open');
        setTimeout(() => input.focus(), 100);
    }
}

function processCommand(cmd) {
    const body = document.getElementById('term-body');
    const inputLine = document.querySelector('.term-input-line');
    const cleanCmd = cmd.trim();

    // Add command to history
    const historyLine = document.createElement('div');
    historyLine.className = 'term-line';
    historyLine.innerHTML = `<span class="prompt">${fsState.currentDir}></span> ${escapeHtml(cmd)}`;
    body.insertBefore(historyLine, inputLine);

    if (!cleanCmd) return;

    // Simulate Processing Delay (Realism)
    // Small random delay for "authenticity"
    const delay = Math.floor(Math.random() * 200) + 50;

    // Disable input during processing
    const input = document.getElementById('term-input');
    input.disabled = true;

    setTimeout(() => {
        const output = getOutput(cleanCmd);

        if (output) {
            const outLine = document.createElement('div');
            outLine.className = 'term-line term-output';
            outLine.innerHTML = output;
            body.insertBefore(outLine, inputLine);
        }

        // Re-enable input and scroll
        input.disabled = false;
        input.focus();
        body.scrollTop = body.scrollHeight;
    }, delay);
}

const replState = {
    variables: {}
};

// Mock File System State
const fsState = {
    currentDir: 'PS C:\\Users\\Student\\source\\repos',
};

// Professional Syntax Highlighting Colors
const c = {
    keyword: 'color: #569cd6', // Blue
    string: 'color: #ce9178',  // Orange
    number: 'color: #b5cea8',  // Light Green
    comment: 'color: #6a9955', // Green
    func: 'color: #dcdcaa',    // Yellow
    control: 'color: #c586c0', // Purple
    text: 'color: #d4d4d4',    // Light Gray (VS Code default)
    success: 'color: #4ec9b0', // Teal
    error: 'color: #f44747',   // Red
    warn: 'color: #cca700'     // Dark Yellow
};

function getOutput(cmd) {
    const lowerCmd = cmd.toLowerCase().trim();

    // 1. HELP
    if (lowerCmd === 'help') {
        return `
<div><strong>Supported Commands:</strong></div>
<div style="margin-left: 10px;">
  <span style="${c.func}">dotnet new console</span>   - Create a new .NET console application<br>
  <span style="${c.func}">dotnet run</span>           - Build and execute the current project<br>
  <span style="${c.func}">dotnet build</span>         - Compile the project binaries<br>
  <span style="${c.func}">clear</span> / <span style="${c.func}">cls</span>          - Clear the terminal screen<br>
</div>
<div style="margin-top: 10px;"><strong>C# REPL Mode:</strong></div>
<div style="margin-left: 10px;">
  <span style="${c.control}">Currently active.</span> You can type valid C# statements directly.<br>
  example: <span style="${c.keyword}">int</span> x = <span style="${c.number}">10</span>;<br>
  example: <span style="${c.func}">Console</span>.<span style="${c.func}">WriteLine</span>(<span style="${c.string}">"Hello"</span>);
</div>`;
    }

    // 2. CLEAR
    if (lowerCmd === 'clear' || lowerCmd === 'cls') {
        const body = document.getElementById('term-body');
        // Remove all lines except the last input line
        Array.from(body.children).forEach(child => {
            if (!child.classList.contains('term-input-line')) child.remove();
        });

        // Re-add header
        const header = `
            <div class="term-line" style="color:white">PowerShell 7.4.2</div>
            <div class="term-line">Copyright (c) Microsoft Corporation. All rights reserved.</div>
            <div class="term-line"><br></div>`;
        const temp = document.createElement('div');
        temp.innerHTML = header;
        while (temp.firstChild) body.insertBefore(temp.firstChild, body.querySelector('.term-input-line'));
        return '';
    }

    // 3. DOTNET NEW
    if (lowerCmd.includes('dotnet new')) {
        return `
<div style="color:white">The template "Console App" was created successfully.</div>
<br>
<div>Processing post-creation actions...</div>
<div>Running 'dotnet restore' on ${fsState.currentDir}\\MyProject.csproj...</div>
<div>  Determining projects to restore...</div>
<div>  Restored ${fsState.currentDir}\\MyProject.csproj (in 142 ms).</div>
<br>
<div style="${c.success}">Restore succeeded.</div>`;
    }

    // 4. DOTNET RUN
    if (lowerCmd.includes('dotnet run')) {
        return `
<div>Building...</div>
<div style="${c.text}">Determining projects to restore...</div>
<div style="${c.text}">All projects are up-to-date for restore.</div>
<div style="${c.text}">MyProject -> ${fsState.currentDir}\\bin\\Debug\\net10.0\\MyProject.dll</div>
<br>
<div style="${c.success}">Build succeeded.</div>
<div style="margin-left: 20px;">0 Warning(s)</div>
<div style="margin-left: 20px;">0 Error(s)</div>
<br>
<div style="color:white; font-weight:bold;">Hello World!</div>
`;
    }

    // 5. DOTNET BUILD
    if (lowerCmd.includes('dotnet build')) {
        return `
<div>Microsoft (R) Build Engine version 17.10.0+ for .NET</div>
<div>Copyright (C) Microsoft Corporation. All rights reserved.</div>
<br>
<div>  Determining projects to restore...</div>
<div>  All projects are up-to-date for restore.</div>
<div style="${c.text}">MyProject -> ${fsState.currentDir}\\bin\\Debug\\net10.0\\MyProject.dll</div>
<br>
<div style="${c.success}">Build succeeded.</div>
<div style="margin-left: 20px;">0 Warning(s)</div>
<div style="margin-left: 20px;">0 Error(s)</div>
<br>
<div>Time Elapsed 00:00:01.45</div>`;
    }

    // 6. C# REPL (Interpretation)

    // Console.WriteLine
    const printMatch = cmd.match(/Console\.WriteLine\((.*)\)/i);
    if (printMatch) {
        let content = printMatch[1].trim();
        // Strip quotes
        if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'"))) {
            content = content.substring(1, content.length - 1);
        }
        return `<div style="color:white">${escapeHtml(content)}</div>`;
    }

    // Variable Assignment
    // int x = 10;
    if (cmd.match(/^\w+\s+\w+\s*=/)) {
        return `<div style="${c.comment}">// REPL: Variable assigned (InMemory).</div>`;
    }

    // Unknown Command / Error
    // Should look like a real PowerShell error
    return `
<div style="${c.error}">${escapeHtml(cmd)} : The term '${escapeHtml(cmd.split(' ')[0])}' is not recognized as the name of a cmdlet, function, script file, or operable program.</div>
<div style="${c.error}">Check the spelling of the name, or if a path was included, verify that the path is correct and try again.</div>
<div style="${c.error}">At line:1 char:1</div>
<div style="${c.error}">+ ${escapeHtml(cmd)}</div>
<div style="${c.error}">+ ~~~</div>
    <div style="${c.error}">+ CategoryInfo          : ObjectNotFound: (${escapeHtml(cmd.split(' ')[0])}:String) [], CommandNotFoundException</div>
    <div style="${c.error}">+ FullyQualifiedErrorId : CommandNotFoundException</div>`;
}

function escapeHtml(text) {
    if (!text) return text;
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
