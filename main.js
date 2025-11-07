// ===============================
// MJ TECNOLOGIA 2025 - main.js
// ===============================

// === TEMA CLARO/ESCURO ===
function alternarTema() {
  document.body.classList.toggle('light');
  localStorage.setItem('tema', document.body.classList.contains('light') ? 'light' : 'dark');
}

window.onload = () => {
  const temaSalvo = localStorage.getItem('tema');
  if (temaSalvo === 'light') document.body.classList.add('light');
  carregarProdutos();
  carregarVendas();
  gerarRelatorio();
};

// === TROCA DE ABAS ===
function mostrarAba(abaId) {
  document.querySelectorAll('section').forEach(sec => sec.classList.remove('ativa'));
  document.getElementById(abaId).classList.add('ativa');
}

// === VARIÁVEIS GLOBAIS ===
let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
let vendas = JSON.parse(localStorage.getItem('vendas')) || [];

// === FUNÇÃO: CADASTRAR PRODUTO ===
function cadastrarProduto() {
  const nome = document.getElementById('nomeProduto').value.trim();
  const preco = parseFloat(document.getElementById('precoProduto').value);
  const custo = parseFloat(document.getElementById('custoProduto').value);
  const estoque = parseInt(document.getElementById('estoqueProduto').value);
  const fotoInput = document.getElementById('fotoProduto');

  if (!nome || isNaN(preco) || isNaN(custo) || isNaN(estoque)) {
    alert("Preencha todos os campos corretamente!");
    return;
  }

  // Ler imagem e salvar em base64
  if (fotoInput.files && fotoInput.files[0]) {
    const leitor = new FileReader();
    leitor.onload = function(e) {
      const imagemBase64 = e.target.result;
      salvarProduto(nome, preco, custo, estoque, imagemBase64);
    };
    leitor.readAsDataURL(fotoInput.files[0]);
  } else {
    salvarProduto(nome, preco, custo, estoque, null);
  }
}

function salvarProduto(nome, preco, custo, estoque, foto) {
  produtos.push({ nome, preco, custo, estoque, foto });
  localStorage.setItem('produtos', JSON.stringify(produtos));
  atualizarListaProdutos();
  atualizarSelectVendas();
  document.getElementById('nomeProduto').value = '';
  document.getElementById('precoProduto').value = '';
  document.getElementById('custoProduto').value = '';
  document.getElementById('estoqueProduto').value = '';
  document.getElementById('fotoProduto').value = '';
  document.getElementById('previewFoto').innerHTML = '';
  alert("✅ Produto cadastrado com sucesso!");
}

// === MOSTRAR FOTO PRÉVIA ===
document.getElementById('fotoProduto').addEventListener('change', function() {
  const preview = document.getElementById('previewFoto');
  preview.innerHTML = '';
  const arquivo = this.files[0];
  if (arquivo) {
    const leitor = new FileReader();
    leitor.onload = e => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.style.maxWidth = '120px';
      img.style.borderRadius = '10px';
      img.style.marginTop = '8px';
      preview.appendChild(img);
    };
    leitor.readAsDataURL(arquivo);
  }
});

// === ATUALIZA LISTA DE PRODUTOS ===
function atualizarListaProdutos() {
  const lista = document.getElementById('listaProdutos');
  lista.innerHTML = '';

  produtos.forEach((p, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${p.nome}</strong><br>
      💰 Venda: R$${p.preco.toFixed(2)} | 💸 Custo: R$${p.custo.toFixed(2)} | 📦 Estoque: ${p.estoque}
      ${p.foto ? `<br><img src="${p.foto}" style="max-width:80px; border-radius:8px; margin-top:5px;">` : ''}
      <br><button class="excluir-btn" onclick="excluirProduto(${i})">Excluir</button>
    `;
    lista.appendChild(li);
  });
}

function excluirProduto(i) {
  if (confirm("Tem certeza que deseja excluir este produto?")) {
    produtos.splice(i, 1);
    localStorage.setItem('produtos', JSON.stringify(produtos));
    atualizarListaProdutos();
    atualizarSelectVendas();
  }
}

function carregarProdutos() {
  atualizarListaProdutos();
  atualizarSelectVendas();
}

// === ATUALIZA SELECT DE VENDAS ===
function atualizarSelectVendas() {
  const select = document.getElementById('produtoVenda');
  select.innerHTML = '';
  produtos.forEach((p, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = p.nome;
    select.appendChild(opt);
  });
}

// === FUNÇÃO: REGISTRAR VENDA ===
function registrarVenda() {
  const idx = document.getElementById('produtoVenda').value;
  const qtd = parseInt(document.getElementById('qtdVenda').value);
  const tipo = document.querySelector('input[name="tipoVenda"]:checked').value;
  const cliente = document.getElementById('clienteVenda').value.trim();
  const whats = document.getElementById('whatsVenda').value.trim();
  const dias = parseInt(document.getElementById('diasPrazo').value) || 0;

  if (idx === '' || isNaN(qtd) || qtd <= 0) {
    alert("Preencha os campos corretamente!");
    return;
  }

  const produto = produtos[idx];
  if (produto.estoque < qtd) {
    alert("❌ Estoque insuficiente!");
    return;
  }

  produto.estoque -= qtd;
  const total = produto.preco * qtd;
  const venda = { produto: produto.nome, qtd, total, tipo, cliente, whats, dias, data: new Date().toLocaleDateString() };
  vendas.push(venda);

  localStorage.setItem('vendas', JSON.stringify(vendas));
  localStorage.setItem('produtos', JSON.stringify(produtos));

  atualizarListaProdutos();
  carregarVendas();
  gerarRelatorio();
  alert("✅ Venda registrada com sucesso!");
}

// === CARREGAR VENDAS ===
function carregarVendas() {
  const lista = document.getElementById('listaVendas');
  lista.innerHTML = '';
  vendas.forEach((v, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      🛒 <strong>${v.produto}</strong> — ${v.qtd} un — R$${v.total.toFixed(2)}<br>
      Tipo: ${v.tipo === 'avista' ? 'À Vista' : 'A Prazo'} ${v.tipo === 'prazo' ? `( ${v.dias} dias )` : ''}<br>
      Cliente: ${v.cliente || '-'} | 📱 ${v.whats || '-'}<br>
      📅 ${v.data}
      <br><button class="excluir-btn" onclick="excluirVenda(${i})">Excluir</button>
    `;
    lista.appendChild(li);
  });
}

function excluirVenda(i) {
  if (confirm("Excluir esta venda?")) {
    vendas.splice(i, 1);
    localStorage.setItem('vendas', JSON.stringify(vendas));
    carregarVendas();
    gerarRelatorio();
  }
}

// === RELATÓRIO FINANCEIRO ===
function gerarRelatorio() {
  const totalVendas = vendas.reduce((acc, v) => acc + v.total, 0);
  const custoTotal = vendas.reduce((acc, v) => {
    const prod = produtos.find(p => p.nome === v.produto);
    return acc + (prod ? prod.custo * v.qtd : 0);
  }, 0);
  const lucro = totalVendas - custoTotal;

  document.getElementById('resumoRelatorio').innerHTML = `
    💰 Total de Vendas: R$${totalVendas.toFixed(2)}<br>
    💸 Custo Total: R$${custoTotal.toFixed(2)}<br>
    📈 Lucro: R$${lucro.toFixed(2)}
  `;
}

// === EXPORTAR ===
function exportarExcel() {
  const conteudo = produtos.map(p => `${p.nome}\t${p.preco}\t${p.custo}\t${p.estoque}`).join('\n');
  const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'produtos.xls';
  link.click();
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Relatório Financeiro - MJ Tecnologia", 10, 10);
  let y = 20;
  produtos.forEach(p => {
    doc.text(`${p.nome} | Venda: R$${p.preco} | Custo: R$${p.custo} | Estoque: ${p.estoque}`, 10, y);
    y += 8;
  });
  doc.save("relatorio.pdf");
}

function limparTudo() {
  if (confirm("Deseja apagar todos os dados?")) {
    localStorage.clear();
    produtos = [];
    vendas = [];
    atualizarListaProdutos();
    carregarVendas();
    gerarRelatorio();
  }
}
