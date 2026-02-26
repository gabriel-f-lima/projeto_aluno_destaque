// ================= NAVEGAÇÃO =================
function setActive(element, sectionId) {
    const items = document.querySelectorAll('.nav-item');
    items.forEach(item => item.classList.remove('active'));  
    element.classList.add('active');

    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active-section');
    });

    const targetSection = document.getElementById(sectionId);
    if(targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active-section');
    }
}

// ================= ESTADO DA APLICAÇÃO =================
let turmas = [
    { id: "1", nome: "Turma A - 1º Ano" },
    { id: "2", nome: "Turma B - 2º Ano" }
];

let requisitosExtras = []; // Ex: { id: "req_ext_1", nome: "Comportamento" }

let alunos = [];

// Event Listeners Base
document.getElementById('req_nota').addEventListener('change', renderizarDados);
document.getElementById('req_presenca').addEventListener('change', renderizarDados);
document.getElementById('req_ead').addEventListener('change', renderizarDados);
document.getElementById('select_turma').addEventListener('change', renderizarDados);


// ================= REGRAS DE NEGÓCIO =================
function calcularMedalha(aluno) {
    const reqNota = document.getElementById('req_nota').checked;
    const reqPres = document.getElementById('req_presenca').checked;
    const reqEad = document.getElementById('req_ead').checked;

    let passouNota = !reqNota || (aluno.nota >= 95);
    let passouEad = !reqEad || (aluno.ead == 100);
    
    // Verifica se atende a todos os requisitos extras ativos
    let passouExtras = requisitosExtras.every(req => aluno.extras && aluno.extras[req.id] === true);

    if (passouNota && passouEad && passouExtras) {
        if (!reqPres || aluno.presenca == 100) return 'ouro';
        if (!reqPres || aluno.presenca >= 97) return 'prata';
        if (!reqPres || aluno.presenca >= 95) return 'bronze';
    }
    return 'nenhuma';
}

function getIconeMedalha(tipo) {
    if (tipo === 'ouro') return '<i class="fa-solid fa-medal medal-ouro" title="Ouro"></i>';
    if (tipo === 'prata') return '<i class="fa-solid fa-medal medal-prata" title="Prata"></i>';
    if (tipo === 'bronze') return '<i class="fa-solid fa-medal medal-bronze" title="Bronze"></i>';
    return '<i class="fa-solid fa-circle-xmark sem-medalha" title="Sem Destaque"></i>';
}


// ================= FUNÇÕES DE TURMAS =================
function renderizarTurmas() {
    // 1. Atualiza o Select da aba Turmas
    const select = document.getElementById('select_turma');
    const valorAtual = select.value;
    select.innerHTML = '';
    
    turmas.forEach(t => {
        const option = document.createElement('option');
        option.value = t.id;
        option.textContent = t.nome;
        select.appendChild(option);
    });

    if (turmas.find(t => t.id === valorAtual)) {
        select.value = valorAtual;
    }

    // 2. Atualiza o Select de Filtro do Dashboard (Top Performers)
    const selectFiltroTp = document.getElementById('filtro_tp_turma');
    if (selectFiltroTp) {
        const valorAtualTp = selectFiltroTp.value;
        selectFiltroTp.innerHTML = '<option value="todas">Todas as turmas</option>';
        turmas.forEach(t => {
            const option = document.createElement('option');
            option.value = t.id;
            option.textContent = t.nome;
            selectFiltroTp.appendChild(option);
        });
        if (valorAtualTp === 'todas' || turmas.find(t => t.id === valorAtualTp)) {
            selectFiltroTp.value = valorAtualTp;
        }
    }

    renderizarDados();
}

function adicionarTurma() {
    const nome = document.getElementById('nova_turma_nome').value.trim();
    if (!nome) return;
    
    const novoId = Date.now().toString(); // ID único
    turmas.push({ id: novoId, nome: nome });
    document.getElementById('nova_turma_nome').value = '';
    
    renderizarTurmas();
    document.getElementById('select_turma').value = novoId;
    renderizarDados();
}

function removerTurma() {
    const turmaId = document.getElementById('select_turma').value;
    if (!turmaId) return;
    
    if (confirm("Tem certeza que deseja excluir esta turma e todos os seus alunos?")) {
        turmas = turmas.filter(t => t.id !== turmaId);
        alunos = alunos.filter(a => a.turmaId !== turmaId);
        renderizarTurmas();
    }
}


// ================= FUNÇÕES DE REQUISITOS EXTRAS =================
function renderizarRequisitosExtras() {
    const divLista = document.getElementById('lista_requisitos_extras');
    const divForm = document.getElementById('form_requisitos_extras');
    
    divLista.innerHTML = '';
    divForm.innerHTML = '';

    requisitosExtras.forEach(req => {
        // Renderiza na lista de requisitos (com botão excluir)
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.marginBottom = '5px';
        div.innerHTML = `
            <label style="font-size: 14px; color: var(--text-muted);"><i class="fa-solid fa-check-double"></i> ${req.nome}</label>
            <button class="btn-danger" style="padding: 2px 6px; font-size: 10px;" onclick="removerRequisitoExtra('${req.id}')"><i class="fa-solid fa-xmark"></i></button>
        `;
        divLista.appendChild(div);

        // Renderiza como checkbox no formulário de adicionar aluno
        const formDiv = document.createElement('label');
        formDiv.style.display = 'flex';
        formDiv.style.gap = '8px';
        formDiv.style.fontSize = '14px';
        formDiv.innerHTML = `<input type="checkbox" id="check_${req.id}" checked> ${req.nome}?`;
        divForm.appendChild(formDiv);
    });
}

function adicionarRequisitoExtra() {
    const nome = document.getElementById('novo_req_nome').value.trim();
    if (!nome) return;

    const novoId = "req_ext_" + Date.now();
    requisitosExtras.push({ id: novoId, nome: nome });
    
    // Atualiza os alunos existentes com o novo requisito como 'falso' por padrão
    alunos.forEach(a => {
        if (!a.extras) a.extras = {};
        a.extras[novoId] = false; 
    });

    document.getElementById('novo_req_nome').value = '';
    renderizarRequisitosExtras();
    renderizarDados();
}

function removerRequisitoExtra(id) {
    requisitosExtras = requisitosExtras.filter(r => r.id !== id);
    renderizarRequisitosExtras();
    renderizarDados();
}


// ================= ALUNOS E RENDERIZAÇÃO =================
function renderizarDados() {
    const turmaSelecionada = document.getElementById('select_turma').value;
    const ordem = document.getElementById('ordenacao_alunos').value;
    const tbody = document.getElementById('tabela_alunos');
    tbody.innerHTML = ''; 

    // Pré-calcula as medalhas de todos e filtra pela turma
    let alunosProcessados = alunos
        .filter(a => a.turmaId === turmaSelecionada)
        .map(a => ({ ...a, medalha: calcularMedalha(a) }));

    // Lógica de Ordenação
    if (ordem === 'alfabetica') {
        alunosProcessados.sort((a, b) => a.nome.localeCompare(b.nome));
    } else {
        const peso = { 'ouro': 3, 'prata': 2, 'bronze': 1, 'nenhuma': 0 };
        alunosProcessados.sort((a, b) => {
            if (peso[b.medalha] !== peso[a.medalha]) {
                return peso[b.medalha] - peso[a.medalha]; // Maior medalha primeiro
            }
            return a.nome.localeCompare(b.nome); // Desempate por ordem alfabética
        });
    }

    // Renderiza a tabela
    alunosProcessados.forEach(aluno => {
        const icone = getIconeMedalha(aluno.medalha);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${aluno.nome}</strong></td>
            <td>${aluno.nota}</td>
            <td>${aluno.presenca}%</td>
            <td>${aluno.ead}%</td>
            <td style="text-align: center;">${icone}</td>
            <td>
                <button class="btn-danger" onclick="removerAluno(${aluno.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Atualiza as Estatísticas do Dashboard Geral
    let totalOuro = 0, totalPrata = 0, totalBronze = 0;

    alunos.forEach(a => {
        const med = calcularMedalha(a);
        if(med === 'ouro') totalOuro++;
        if(med === 'prata') totalPrata++;
        if(med === 'bronze') totalBronze++;
    });

    document.getElementById('alunos_ouro').textContent = totalOuro;
    document.getElementById('alunos_prata').textContent = totalPrata;
    document.getElementById('alunos_bronze').textContent = totalBronze;
    document.getElementById('dash_total_alunos').textContent = alunos.length;
    document.getElementById('dash_total_turmas').textContent = turmas.length;
    document.getElementById('dash_total_destaques').textContent = (totalOuro + totalPrata + totalBronze);

    renderizarTopPerformers();
}

function adicionarAluno() {
    const nome = document.getElementById('novo_nome').value.trim();
    const nota = parseInt(document.getElementById('novo_nota').value);
    const presenca = parseInt(document.getElementById('novo_presenca').value);
    const ead = parseInt(document.getElementById('novo_ead').value);
    const turmaId = document.getElementById('select_turma').value;

    if (!nome || isNaN(nota) || isNaN(presenca) || isNaN(ead)) {
        alert("Preencha todos os campos corretamente.");
        return;
    }
    if (!turmaId) {
        alert("Crie uma turma primeiro.");
        return;
    }

    // Coleta as respostas dos requisitos extras
    let extrasAluno = {};
    requisitosExtras.forEach(req => {
        const checkbox = document.getElementById(`check_${req.id}`);
        extrasAluno[req.id] = checkbox ? checkbox.checked : false;
    });

    const novoId = alunos.length > 0 ? Math.max(...alunos.map(a => a.id)) + 1 : 1;

    alunos.push({ 
        id: novoId, 
        turmaId: turmaId, 
        nome: nome, 
        nota: nota, 
        presenca: presenca, 
        ead: ead,
        extras: extrasAluno
    });

    // Limpa os inputs
    document.querySelectorAll('.add-form input[type="text"], .add-form input[type="number"]').forEach(input => input.value = '');
    
    renderizarDados();
}

function removerAluno(id) {
    if(confirm("Deseja remover este aluno?")) {
        alunos = alunos.filter(a => a.id !== id);
        renderizarDados();
    }
}
function renderizarTopPerformers() {
    const container = document.getElementById('lista_top_performers');
    if (!container) return;

    const filtroTurma = document.getElementById('filtro_tp_turma').value;
    const limit = parseInt(document.getElementById('filtro_tp_qtd').value);

    // Filtra pela turma escolhida
    let alunosFiltrados = alunos;
    if (filtroTurma !== 'todas') {
        alunosFiltrados = alunos.filter(a => a.turmaId === filtroTurma);
    }

    // Ordena os alunos: Maior Nota -> Maior Presença -> Maior EAD
    alunosFiltrados.sort((a, b) => {
        if (b.nota !== a.nota) return b.nota - a.nota; // Desempate por nota
        if (b.presenca !== a.presenca) return b.presenca - a.presenca; // Desempate por presença
        return b.ead - a.ead; // Desempate por EAD
    });

    // Pega apenas a quantidade que o usuário escolheu (Top 3, Top 5, etc)
    const topAlunos = alunosFiltrados.slice(0, limit);

    if (topAlunos.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhuma pontuação registrada ainda</div>';
        return;
    }

    container.innerHTML = ''; // Limpa a lista antes de desenhar
    
    topAlunos.forEach((aluno, index) => {
        // Pega o nome da Turma
        const turmaObj = turmas.find(t => t.id === aluno.turmaId);
        const turmaNome = turmaObj ? turmaObj.nome : 'Sem Turma';
        
        // Pega a medalha do aluno
        const medalha = calcularMedalha(aluno);
        const icone = getIconeMedalha(medalha);

        // Cria a linha (card) do aluno
        const div = document.createElement('div');
        div.className = 'top-performer-item';
        div.innerHTML = `
            <div class="tp-rank">${index + 1}º</div>
            <div class="tp-info">
                <h4>${aluno.nome} ${icone}</h4>
                <span>${turmaNome}</span>
            </div>
            <div class="tp-stats">
                <span title="Nota"><i class="fa-solid fa-star" style="color:var(--yellow)"></i> ${aluno.nota}</span>
                <span title="Presença"><i class="fa-solid fa-user-check" style="color:var(--green)"></i> ${aluno.presenca}%</span>
                <span title="EAD"><i class="fa-solid fa-laptop-code" style="color:var(--blue)"></i> ${aluno.ead}%</span>
            </div>
        `;
        container.appendChild(div);
    });
}