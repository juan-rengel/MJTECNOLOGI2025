// ==========================
// MJ TECNOLOGI 2025
// Controle de Vendas e Estoque com LocalStorage
// ==========================

let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let vendas = JSON.parse(localStorage.getItem("vendas")) || [];

function salvarDados() {
  localStorage.setItem("produtos", JSON.stringify(produtos));
  localStorage.setItem("vendas", JSON.stringify(vendas));
}

// Alternar abas
function mostrarAba(abaId) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("ativa"));
  document.getElementById(abaId).classList.add("ativa");
}

// =================== PRODUTOS ===================
function cadastrarProduto() {
  const nome = document.getElementById("nomeProduto").value.trim();
  const preco = parseFloat(document.getElementById("precoProduto").value);
  const custo = parseFloat(document.getElementById("custoProduto").value);
  const estoque = parseInt(document.getElementById("estoqueProduto").value);
  const fotoInput = document.getElementById("fotoProduto");

  if (!nome || isNaN(preco) || isNaN(custo) || isNaN(estoque)) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  if (fotoInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function (e) {
      adicionarProduto(nome, preco, custo, estoque, e.target.result);
    };
    reader.readAsDataURL(fotoInput.files[0]);
  } else {
    adicionarProduto(nome, preco, custo, estoque, "");
  }
}

function adicionarProduto(nome, preco, custo, estoque, foto) {
  produtos.push({ id: Date.now(), nome, preco, custo, estoque, foto });
  salvarDados();
  listarProdutos();
  alert("Produto adicionado com sucesso!");
}

function listarProdutos() {
  const lista = document.getElementById("listaProdutos");
  lista.innerHTML = "";
  produtos.forEach(p => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${p.nome}</strong><br>
      Preço: R$${p.preco.toFixed(2)} | Custo: R$${p.custo.toFixed(2)}<br>
      Estoque: ${p.estoque} unidades
      ${p.foto ? `<br><img src="${p.foto}" width="100" style="margin-top:5px;border-radius:6px;">` : ""}
    `;
    lista.appendChild(li);
  });
}

// =================== VENDAS ===================
function registrarVenda() {
  const produtoId = parseInt(document.getElementById("produtoVenda").value);
  const qtd = parseInt(document.getElementById("qtdVenda").value);
  const tipo = document.querySelector('input[name="tipoVenda"]:checked').value;
  const cliente = document.getElementById("clienteVenda").value || "Cliente";
  const diasPrazo = parseInt(document.getElementById("diasPrazo").value) || 0;

  const produto = produtos.find(p => p.id === produtoId);
  if (!produto || qtd <= 0 || qtd > produto.estoque) {
    alert("Verifique o produto e a quantidade disponível.");
    return;
  }

  const total = produto.preco * qtd;
  const dataVenda = new Date();
  const vencimento = tipo === "prazo"
    ? new Date(dataVenda.getTime() + diasPrazo * 24 * 60 * 60 * 1000)
    : null;

  vendas.push({
    id: Date.now(),
    produto: produto.nome,
    qtd,
    total,
    tipo,
    cliente,
    data: dataVenda.toLocaleDateString(),
    vencimento: vencimento ? vencimento.toLocaleDateString() : null
  });

  produto.estoque -= qtd;
  salvarDados();
  listarVendas();
  alert("Venda registrada com sucesso!");
}

function listarVendas() {
  const lista = document.getElementById("listaVendas");
  lista.innerHTML = "";
  vendas.forEach(v => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${v.produto} - ${v.qtd}x - R$${v.total.toFixed(2)}<br>
      Tipo: ${v.tipo === "prazo" ? "A Prazo" : "À Vista"}
      ${v.vencimento ? ` | Vencimento: ${v.vencimento}` : ""}
      ${v.tipo === "prazo" ? `<br>Cliente: ${v.cliente}` : ""}
    `;
    lista.appendChild(li);
  });
}

// =================== RELATÓRIO ===================
function gerarRelatorio() {
  const totalVendas = vendas.reduce((acc, v) => acc + v.total, 0);
  const custoTotal = produtos.reduce((acc, p) => acc + (p.custo * (p.estoque || 0)), 0);
  const lucro = totalVendas - custoTotal;
  const retorno = custoTotal > 0 ? ((lucro / custoTotal) * 100).toFixed(2) : "0.00";

  document.getElementById("resumoRelatorio").innerHTML = `
    <strong>Total de Vendas:</strong> R$${totalVendas.toFixed(2)}<br>
    <strong>Custo Total:</strong> R$${custoTotal.toFixed(2)}<br>
    <strong>Lucro:</strong> R$${lucro.toFixed(2)}<br>
    <strong>Retorno (%):</strong> ${retorno}%
  `;
}

// =================== ALERTA WHATSAPP ===================
function verificarVencimentos() {
  const hoje = new Date().toLocaleDateString();
  const vencendo = vendas.filter(v => v.vencimento === hoje);

  if (vencendo.length === 0) {
    alert("Nenhum cliente com vencimento hoje.");
    return;
  }

  vencendo.forEach(v => {
    const msg = encodeURIComponent(`Olá ${v.cliente}, lembrando que sua compra (${v.produto}) vence hoje. Pix: 929931135510 (Mercado Pago).`);
    const url = `https://wa.me/?text=${msg}`;
    window.open(url, "_blank");
  });
}
