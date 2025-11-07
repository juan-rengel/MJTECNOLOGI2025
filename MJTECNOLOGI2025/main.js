// ======== SISTEMA MJ TECNOLOGIA 2025 ========

// ----- Variáveis principais -----
let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let vendas = JSON.parse(localStorage.getItem("vendas")) || [];

// ----- Alternar tema claro/escuro -----
function alternarTema() {
  document.body.classList.toggle("light");
  localStorage.setItem("temaClaro", document.body.classList.contains("light"));
}
if (localStorage.getItem("temaClaro") === "true") {
  document.body.classList.add("light");
}

// ----- Trocar abas internas -----
function mostrarAba(id) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("ativa"));
  document.getElementById(id).classList.add("ativa");
}

// ----- Salvar dados -----
function salvarDados() {
  localStorage.setItem("produtos", JSON.stringify(produtos));
  localStorage.setItem("vendas", JSON.stringify(vendas));
}

// ----- Atualizar listas -----
function atualizarProdutos() {
  const lista = document.getElementById("listaProdutos");
  const select = document.getElementById("produtoVenda");
  lista.innerHTML = "";
  select.innerHTML = "<option value=''>Selecione</option>";

  produtos.forEach((p, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${p.nome}</strong><br>
      Preço: R$ ${p.preco.toFixed(2)} | Custo: R$ ${p.custo.toFixed(2)} | Estoque: ${p.estoque}
      ${p.foto ? `<br><img src="${p.foto}" width="60">` : ""}
      <br><button class="excluir-btn" onclick="excluirProduto(${i})">Excluir</button>
    `;
    lista.appendChild(li);

    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = p.nome;
    select.appendChild(opt);
  });
}
atualizarProdutos();

// ----- Cadastrar produto -----
function cadastrarProduto() {
  const nome = document.getElementById("nomeProduto").value.trim();
  const preco = parseFloat(document.getElementById("precoProduto").value);
  const custo = parseFloat(document.getElementById("custoProduto").value);
  const estoque = parseInt(document.getElementById("estoqueProduto").value);
  const fotoInput = document.getElementById("fotoProduto");

  if (!nome || isNaN(preco) || isNaN(custo) || isNaN(estoque)) {
    alert("Preencha todos os campos corretamente!");
    return;
  }

  let foto = "";
  if (fotoInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function (e) {
      foto = e.target.result;
      produtos.push({ nome, preco, custo, estoque, foto });
      salvarDados();
      atualizarProdutos();
    };
    reader.readAsDataURL(fotoInput.files[0]);
  } else {
    produtos.push({ nome, preco, custo, estoque, foto });
    salvarDados();
    atualizarProdutos();
  }

  document.getElementById("nomeProduto").value = "";
  document.getElementById("precoProduto").value = "";
  document.getElementById("custoProduto").value = "";
  document.getElementById("estoqueProduto").value = "";
  fotoInput.value = "";
}

// ----- Excluir produto -----
function excluirProduto(i) {
  if (confirm("Excluir este produto?")) {
    produtos.splice(i, 1);
    salvarDados();
    atualizarProdutos();
  }
}

// ----- Registrar venda -----
function registrarVenda() {
  const produtoIndex = document.getElementById("produtoVenda").value;
  const qtd = parseInt(document.getElementById("qtdVenda").value);
  const tipo = document.querySelector('input[name="tipoVenda"]:checked').value;
  const cliente = document.getElementById("clienteVenda").value.trim();
  const whats = document.getElementById("whatsVenda").value.trim();
  const diasPrazo = parseInt(document.getElementById("diasPrazo").value) || 0;

  if (produtoIndex === "" || isNaN(qtd) || !cliente) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  const produto = produtos[produtoIndex];
  if (produto.estoque < qtd) {
    alert("Estoque insuficiente!");
    return;
  }

  const total = produto.preco * qtd;
  const vencimento = tipo === "prazo" ? new Date(Date.now() + diasPrazo * 86400000) : null;

  vendas.push({
    produto: produto.nome,
    quantidade: qtd,
    total,
    tipo,
    cliente,
    whats,
    vencimento: vencimento ? vencimento.toISOString() : null,
    pago: tipo === "avista"
  });

  produto.estoque -= qtd;
  salvarDados();
  atualizarProdutos();
  atualizarVendas();

  // Mensagem WhatsApp se venda a prazo
  if (tipo === "prazo" && whats) {
    const msg = `Olá ${cliente}! Sua compra de ${produto.nome} no valor de R$ ${total.toFixed(2)} vence em ${diasPrazo} dia(s).`;
    const link = `https://wa.me/55${whats}?text=${encodeURIComponent(msg)}`;
    window.open(link, "_blank");
  }

  alert("Venda registrada com sucesso!");
  document.getElementById("produtoVenda").value = "";
  document.getElementById("qtdVenda").value = "";
  document.getElementById("clienteVenda").value = "";
  document.getElementById("whatsVenda").value = "";
  document.getElementById("diasPrazo").value = "";
}

// ----- Atualizar lista de vendas -----
function atualizarVendas() {
  const lista = document.getElementById("listaVendas");
  lista.innerHTML = "";

  vendas.forEach((v, i) => {
    const li = document.createElement("li");
    const venc = v.vencimento ? new Date(v.vencimento).toLocaleDateString() : "—";
    li.innerHTML = `
      <strong>${v.cliente}</strong> - ${v.produto}<br>
      Qtd: ${v.quantidade} | Total: R$ ${v.total.toFixed(2)}<br>
      Tipo: ${v.tipo.toUpperCase()} | Venc: ${venc}<br>
      <button class="excluir-btn" onclick="excluirVenda(${i})">Excluir</button>
    `;
    lista.appendChild(li);
  });
}
atualizarVendas();

// ----- Excluir venda -----
function excluirVenda(i) {
  if (confirm("Excluir esta venda?")) {
    const venda = vendas[i];
    const prod = produtos.find(p => p.nome === venda.produto);
    if (prod) prod.estoque += venda.quantidade;

    vendas.splice(i, 1);
    salvarDados();
    atualizarVendas();
    atualizarProdutos();
  }
}

// ----- Relatório -----
function gerarRelatorio() {
  const resumo = document.getElementById("resumoRelatorio");
  const totalVendas = vendas.reduce((a, v) => a + v.total, 0);
  const lucro = vendas.reduce((a, v) => {
    const p = produtos.find(p => p.nome === v.produto);
    return a + (p ? (v.total - v.quantidade * p.custo) : 0);
  }, 0);

  resumo.innerHTML = `
    <p><strong>Total de Vendas:</strong> R$ ${totalVendas.toFixed(2)}</p>
    <p><strong>Lucro Estimado:</strong> R$ ${lucro.toFixed(2)}</p>
    <p><strong>Quantidade de Vendas:</strong> ${vendas.length}</p>
  `;
}
gerarRelatorio();

// ----- Exportar Excel -----
function exportarExcel() {
  let csv = "Produto,Cliente,Quantidade,Total,Tipo,Vencimento\n";
  vendas.forEach(v => {
    csv += `${v.produto},${v.cliente},${v.quantidade},${v.total},${v.tipo},${v.vencimento || ""}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "relatorio_mjtecnologia.csv";
  a.click();
}

// ----- Exportar PDF -----
function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Relatório MJ Tecnologia 2025", 10, 10);

  let y = 20;
  vendas.forEach(v => {
    doc.text(`${v.cliente} - ${v.produto} (${v.quantidade}x) R$${v.total.toFixed(2)}`, 10, y);
    y += 8;
  });

  doc.save("relatorio_mjtecnologia.pdf");
}

// ----- Limpar tudo -----
function limparTudo() {
  if (confirm("Deseja realmente apagar TODOS os dados?")) {
    localStorage.clear();
    produtos = [];
    vendas = [];
    atualizarProdutos();
    atualizarVendas();
    gerarRelatorio();
  }
}

// ----- Lembrete automático WhatsApp -----
setInterval(() => {
  const hoje = new Date().toISOString().split("T")[0];
  vendas.forEach(v => {
    if (v.vencimento && !v.pago) {
      const venc = new Date(v.vencimento).toISOString().split("T")[0];
      if (venc === hoje && v.whats) {
        const msg = `Olá ${v.cliente}! Lembrete: sua compra de ${v.produto} vence hoje.`;
        const link = `https://wa.me/55${v.whats}?text=${encodeURIComponent(msg)}`;
        window.open(link, "_blank");
        v.pago = true; // evita repetir lembrete
        salvarDados();
      }
    }
  });
}, 60000); // verifica a cada 1 min
