// ==========================
// MJ TECNOLOGI 2025 - main.js (completo, com WhatsApp e lembrete automático)
// ==========================

// Dados globais (expostos para o HTML)
window.produtos = JSON.parse(localStorage.getItem("produtos")) || [];
window.vendas = JSON.parse(localStorage.getItem("vendas")) || [];

// ---------- Persistência ----------
function salvarDados() {
  localStorage.setItem("produtos", JSON.stringify(window.produtos));
  localStorage.setItem("vendas", JSON.stringify(window.vendas));
}

// ---------- Utilitários ----------
function limparCamposProduto() {
  const ids = ["nomeProduto", "precoProduto", "custoProduto", "estoqueProduto", "fotoProduto"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === "file") el.value = "";
    else el.value = "";
  });
}

function atualizarProdutosDropdown() {
  const select = document.getElementById("produtoVenda");
  if (!select) return;
  select.innerHTML = '<option value="">Selecione...</option>';
  (window.produtos || []).forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.nome;
    select.appendChild(opt);
  });
}

// formata data pt-BR
function hojeStr() {
  return new Date().toLocaleDateString('pt-BR');
}

// converte "dd/mm/aaaa" para Date (ou null)
function parseDateBR(str) {
  if (!str) return null;
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10), m = parseInt(parts[1], 10) - 1, y = parseInt(parts[2], 10);
  return new Date(y, m, d);
}

// ---------- PRODUTOS ----------
function cadastrarProduto() {
  const nome = (document.getElementById("nomeProduto")?.value || "").trim();
  const preco = parseFloat(document.getElementById("precoProduto")?.value);
  const custo = parseFloat(document.getElementById("custoProduto")?.value);
  const estoque = parseInt(document.getElementById("estoqueProduto")?.value);
  const fotoInput = document.getElementById("fotoProduto");

  if (!nome || isNaN(preco) || isNaN(custo) || isNaN(estoque)) {
    alert("⚠️ Preencha todos os campos corretamente.");
    return;
  }

  const produto = {
    id: Date.now(),
    nome,
    preco,
    custo,
    estoque,
    foto: ""
  };

  // leitura de imagem (assíncrona)
  if (fotoInput && fotoInput.files && fotoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      produto.foto = e.target.result;
      window.produtos.push(produto);
      salvarDados();
      listarProdutos();
      atualizarProdutosDropdown();
      limparCamposProduto();
      alert("✅ Produto adicionado com sucesso!");
    };
    reader.readAsDataURL(fotoInput.files[0]);
  } else {
    window.produtos.push(produto);
    salvarDados();
    listarProdutos();
    atualizarProdutosDropdown();
    limparCamposProduto();
    alert("✅ Produto adicionado com sucesso!");
  }
}

function listarProdutos() {
  const lista = document.getElementById("listaProdutos");
  if (!lista) return;
  lista.innerHTML = "";

  if (!window.produtos || window.produtos.length === 0) {
    lista.innerHTML = `<p style="text-align:center;opacity:0.7;">Nenhum produto cadastrado ainda.</p>`;
    return;
  }

  window.produtos.forEach(p => {
    const li = document.createElement("li");
    li.className = "item produto-item";
    li.style.background = "var(--card)";
    li.style.border = "1px solid rgba(255,255,255,0.06)";
    li.style.borderRadius = "12px";
    li.style.padding = "12px";
    li.style.display = "flex";
    li.style.alignItems = "center";
    li.style.gap = "12px";

    const thumb = document.createElement("div");
    thumb.className = "thumb";
    thumb.style.width = "76px";
    thumb.style.height = "76px";
    thumb.style.borderRadius = "10px";
    thumb.style.overflow = "hidden";
    thumb.style.flexShrink = "0";
    thumb.style.background = "#071025";

    if (p.foto) {
      const img = document.createElement("img");
      img.src = p.foto;
      img.alt = p.nome;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      thumb.appendChild(img);
    } else {
      thumb.textContent = p.nome.charAt(0).toUpperCase();
      thumb.style.display = "flex";
      thumb.style.alignItems = "center";
      thumb.style.justifyContent = "center";
      thumb.style.color = "#fff";
      thumb.style.fontWeight = "700";
      thumb.style.background = "linear-gradient(135deg,var(--accent), #66e0ff)";
    }

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.style.flex = "1";

    const title = document.createElement("div");
    title.className = "title";
    title.style.fontWeight = "700";
    title.style.color = "#00b7ff";
    title.textContent = p.nome;

    const sub = document.createElement("div");
    sub.className = "sub muted";
    sub.innerHTML = `💲 <strong>Preço:</strong> R$${p.preco.toFixed(2)} &nbsp; • &nbsp; 📦 <strong>Estoque:</strong> ${p.estoque} un. &nbsp; • &nbsp; 💰 <strong>Custo:</strong> R$${p.custo.toFixed(2)}`;

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "8px";
    actions.style.marginTop = "8px";

    const btnEditar = document.createElement("button");
    btnEditar.className = "btn small";
    btnEditar.style.background = "#2563eb";
    btnEditar.style.color = "white";
    btnEditar.textContent = "✏️ Editar";
    btnEditar.onclick = () => editarProduto(p.id);

    const btnExcluir = document.createElement("button");
    btnExcluir.className = "btn small";
    btnExcluir.style.background = "#ef4444";
    btnExcluir.style.color = "white";
    btnExcluir.textContent = "🗑️ Excluir";
    btnExcluir.onclick = () => excluirProduto(p.id);

    actions.appendChild(btnEditar);
    actions.appendChild(btnExcluir);

    meta.appendChild(title);
    meta.appendChild(sub);
    meta.appendChild(actions);

    li.appendChild(thumb);
    li.appendChild(meta);

    lista.appendChild(li);
  });
}

function editarProduto(id) {
  const produto = window.produtos.find(p => p.id === id);
  if (!produto) return;

  const novoNome = prompt("Novo nome do produto:", produto.nome);
  const novoPreco = parseFloat(prompt("Novo preço (use ponto para decimal):", produto.preco));
  const novoCusto = parseFloat(prompt("Novo custo (use ponto para decimal):", produto.custo));
  const novoEstoque = parseInt(prompt("Novo estoque:", produto.estoque));

  if (!novoNome || isNaN(novoPreco) || isNaN(novoCusto) || isNaN(novoEstoque)) {
    alert("Informações inválidas. Nenhuma alteração feita.");
    return;
  }

  produto.nome = novoNome;
  produto.preco = novoPreco;
  produto.custo = novoCusto;
  produto.estoque = novoEstoque;

  salvarDados();
  listarProdutos();
  atualizarProdutosDropdown();
  alert("Produto atualizado com sucesso!");
}

function excluirProduto(id) {
  if (!confirm("Tem certeza que deseja excluir este produto?")) return;

  window.produtos = window.produtos.filter(p => p.id !== id);
  salvarDados();
  listarProdutos();
  atualizarProdutosDropdown();
  alert("Produto excluído com sucesso!");
}

// ---------- VENDAS ----------
function registrarVenda() {
  const produtoId = parseInt(document.getElementById("produtoVenda")?.value);
  const qtd = parseInt(document.getElementById("qtdVenda")?.value);
  const tipoEl = document.querySelector('input[name="tipoVenda"]:checked');
  const tipo = tipoEl ? tipoEl.value : "vista";
  const cliente = (document.getElementById("clienteVenda")?.value || "Cliente").trim();
  const whatsapp = (document.getElementById("whatsVenda")?.value || "").trim();
  const diasPrazo = parseInt(document.getElementById("diasPrazo")?.value) || 0;

  if (isNaN(produtoId) || !produtoId) {
    alert("Selecione um produto válido.");
    return;
  }
  if (isNaN(qtd) || qtd <= 0) {
    alert("Informe uma quantidade válida.");
    return;
  }

  const produto = window.produtos.find(p => p.id === produtoId);
  if (!produto) {
    alert("Produto não encontrado.");
    return;
  }
  if (qtd > produto.estoque) {
    alert("Quantidade maior que o estoque disponível.");
    return;
  }

  const total = produto.preco * qtd;
  const dataVenda = new Date();
  const vencimentoDate = tipo === "prazo" ? new Date(dataVenda.getTime() + diasPrazo * 24 * 60 * 60 * 1000) : null;

  const venda = {
    id: Date.now(),
    produtoId: produto.id,
    produto: produto.nome,
    qtd,
    total,
    tipo,
    cliente,
    whatsapp,
    data: dataVenda.toLocaleDateString('pt-BR'),
    vencimento: vencimentoDate ? vencimentoDate.toLocaleDateString('pt-BR') : null,
    pago: tipo === "vista" ? true : false
  };

  // atualizar estoque
  produto.estoque -= qtd;

  window.vendas.push(venda);
  salvarDados();
  listarVendas();
  listarProdutos();
  atualizarProdutosDropdown();

  // limpar campos venda
  const ids = ["qtdVenda", "diasPrazo", "clienteVenda", "produtoVenda", "whatsVenda"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  alert("✅ Venda registrada com sucesso!");
}

function listarVendas() {
  const lista = document.getElementById("listaVendas");
  if (!lista) return;
  lista.innerHTML = "";

  if (!window.vendas || window.vendas.length === 0) {
    lista.innerHTML = `<p style="text-align:center;opacity:0.7;">Nenhuma venda registrada ainda.</p>`;
    return;
  }

  window.vendas.forEach(v => {
    const li = document.createElement("li");
    li.style.background = "var(--card)";
    li.style.border = "1px solid rgba(255,255,255,0.06)";
    li.style.borderRadius = "12px";
    li.style.padding = "12px";
    li.style.marginBottom = "12px";
    li.style.display = "flex";
    li.style.flexDirection = "column";

    const status = v.pago ? "✅ Pago" : (v.tipo === "prazo" ? "⏳ A Pagar" : "💸 À Vista");

    li.innerHTML = `
      <strong style="color:#00b7ff;font-size:1.05em;">${v.produto}</strong>
      <div class="muted" style="margin:6px 0;">Cliente: ${v.cliente} • Quantidade: ${v.qtd} • Total: R$${v.total.toFixed(2)}</div>
      ${v.whatsapp ? `<div style="margin:4px 0;">📱 WhatsApp: ${v.whatsapp}</div>` : `<div style="margin:4px 0;opacity:0.8;">📱 WhatsApp: Não informado</div>`}
      <div style="margin:4px 0;">Tipo: ${v.tipo === "prazo" ? "A Prazo" : "À Vista"} ${v.vencimento ? `• Vencimento: ${v.vencimento}` : ""}</div>
      <div style="margin:6px 0;">Status: ${status}</div>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
        <button class="btn small" style="background:#2563eb;color:white;" onclick="editarVenda(${v.id})">✏️ Editar</button>
        <button class="btn small" style="background:#ef4444;color:white;" onclick="excluirVenda(${v.id})">🗑️ Excluir</button>
        ${v.tipo === "prazo" && !v.pago ? `<button class="btn small" style="background:#22c55e;color:white;" onclick="marcarComoPago(${v.id})">💰 Marcar como Pago</button>` : ""}
        ${!v.pago ? `<button class="btn small" style="background:#0ea5a4;color:white;" onclick="enviarWhatsAppVenda(${v.id})">📲 WhatsApp</button>` : ""}
      </div>
    `;

    lista.appendChild(li);
  });
}

function editarVenda(id) {
  const venda = window.vendas.find(v => v.id === id);
  if (!venda) return;

  const produto = window.produtos.find(p => p.id === venda.produtoId);

  const novoQtd = parseInt(prompt("Nova quantidade:", venda.qtd));
  const novoTipo = prompt("Tipo de venda (vista/prazo):", venda.tipo);
  const novoCliente = prompt("Nome do cliente:", venda.cliente) || "Cliente";
  let novoVenc = venda.vencimento;

  if (novoTipo === "prazo") {
    const inputVenc = prompt("Nova data de vencimento (dd/mm/aaaa):", venda.vencimento || "");
    if (inputVenc) {
      const dt = parseDateBR(inputVenc);
      if (!dt || isNaN(dt.getTime())) {
        alert("Data de vencimento inválida. Nenhuma alteração feita.");
        return;
      }
      novoVenc = dt.toLocaleDateString('pt-BR');
    }
  } else {
    novoVenc = null;
  }

  if (isNaN(novoQtd) || novoQtd <= 0 || (novoTipo !== "vista" && novoTipo !== "prazo")) {
    alert("Informações inválidas. Nenhuma alteração feita.");
    return;
  }

  // recalcula total com base no preço atual do produto (se encontrado) ou no total proporcional
  if (produto) {
    venda.total = produto.preco * novoQtd;
    venda.produto = produto.nome;
    venda.produtoId = produto.id;
  } else {
    venda.total = (venda.total / venda.qtd) * novoQtd;
  }

  venda.qtd = novoQtd;
  venda.tipo = novoTipo;
  venda.cliente = novoCliente;
  venda.vencimento = novoVenc;
  venda.pago = novoTipo === "vista" ? true : venda.pago;

  salvarDados();
  listarVendas();
  listarProdutos();
  atualizarProdutosDropdown();
  alert("Venda atualizada com sucesso!");
}

function excluirVenda(id) {
  if (!confirm("Tem certeza que deseja excluir esta venda?")) return;

  const venda = window.vendas.find(v => v.id === id);
  if (venda) {
    const produto = window.produtos.find(p => p.id === venda.produtoId);
    if (produto) produto.estoque += venda.qtd;
  }

  window.vendas = window.vendas.filter(v => v.id !== id);
  salvarDados();
  listarVendas();
  listarProdutos();
  atualizarProdutosDropdown();
  alert("Venda excluída com sucesso!");
}

function marcarComoPago(id) {
  const venda = window.vendas.find(v => v.id === id);
  if (!venda) return;
  if (!confirm(`Confirmar pagamento da venda para ${venda.cliente}?`)) return;
  venda.pago = true;
  salvarDados();
  listarVendas();
  alert("Venda marcada como paga!");
}

function enviarWhatsAppVenda(id) {
  const venda = window.vendas.find(v => v.id === id);
  if (!venda) return;
  const msg = encodeURIComponent(`Olá ${venda.cliente}, lembrando sobre a venda: ${venda.produto} (${venda.qtd}x) - Total R$${venda.total.toFixed(2)}${venda.vencimento ? ` - Vencimento: ${venda.vencimento}` : ""}`);
  // Se existir whatsapp no cadastro da venda, usa-o; senão abre WhatsApp Web genérico
  if (venda.whatsapp) {
    const numero = venda.whatsapp.replace(/\D/g, "");
    const url = `https://wa.me/${numero}?text=${msg}`;
    window.open(url, "_blank");
  } else {
    const url = `https://wa.me/?text=${msg}`;
    window.open(url, "_blank");
  }
}

// ---------- VENCIMENTOS (WhatsApp) ----------
function verificarVencimentos() {
  const hoje = hojeStr();
  const vencendo = (window.vendas || []).filter(v => v.vencimento === hoje && !v.pago && v.tipo === "prazo");

  if (vencendo.length === 0) {
    // comentar se quiser silêncio: alert("Nenhum cliente com vencimento hoje.");
    return;
  }

  // Para cada venda com vencimento hoje, abrir WhatsApp no número informado
  vencendo.forEach(v => {
    const msg = encodeURIComponent(
      `Olá ${v.cliente}, lembrando que sua compra de ${v.produto} (${v.qtd}x) no valor de R$${v.total.toFixed(2)} vence hoje.\n\nPix: 929931135510 (Mercado Pago).`
    );

    if (v.whatsapp) {
      const numero = v.whatsapp.replace(/\D/g, "");
      const url = `https://wa.me/${numero}?text=${msg}`;
      window.open(url, "_blank");
    } else {
      // se não houver número, apenas mostra alert (ou pode enviar genérico)
      alert(`Cliente ${v.cliente} não possui número de WhatsApp cadastrado.`);
    }
  });
}

// ---------- RELATÓRIO ----------
function gerarRelatorio() {
  const totalVendas = (window.vendas || []).reduce((acc, v) => acc + (v.total || 0), 0);
  const custoTotal = (window.produtos || []).reduce((acc, p) => acc + ((p.custo || 0) * (p.estoque || 0)), 0);
  const lucro = totalVendas - custoTotal;
  const retorno = custoTotal > 0 ? ((lucro / custoTotal) * 100).toFixed(2) : "0.00";

  const el = document.getElementById("resumoRelatorio");
  if (el) {
    el.innerHTML = `
      <strong>Total de Vendas:</strong> R$${totalVendas.toFixed(2)}<br>
      <strong>Custo Total (estoque atual):</strong> R$${custoTotal.toFixed(2)}<br>
      <strong>Lucro:</strong> R$${lucro.toFixed(2)}<br>
      <strong>Retorno (%):</strong> ${retorno}%
    `;
  }
}

// ---------- EXPORT / IMPORT / LIMPEZA ----------
function exportarJSON() {
  const data = {
    produtos: window.produtos || [],
    vendas: window.vendas || []
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mj-dados.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importarJSON(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const obj = JSON.parse(e.target.result);
      if (obj.produtos) window.produtos = obj.produtos;
      if (obj.vendas) window.vendas = obj.vendas;
      salvarDados();
      listarProdutos();
      listarVendas();
      atualizarProdutosDropdown();
      alert("Dados importados com sucesso!");
    } catch (err) {
      alert("Arquivo inválido.");
    }
  };
  reader.readAsText(file);
}

function limparDados() {
  if (!confirm('Limpar todos os dados locais (produtos e vendas)?')) return;
  localStorage.removeItem('produtos');
  localStorage.removeItem('vendas');
  window.produtos = [];
  window.vendas = [];
  listarProdutos();
  listarVendas();
  atualizarProdutosDropdown();
  alert('Dados limpos.');
}

// ---------- INICIALIZAÇÃO ----------
document.addEventListener("DOMContentLoaded", () => {
  // expor as funções globalmente (para chamadas diretas do HTML)
  window.cadastrarProduto = cadastrarProduto;
  window.listarProdutos = listarProdutos;
  window.atualizarProdutosDropdown = atualizarProdutosDropdown;
  window.registrarVenda = registrarVenda;
  window.listarVendas = listarVendas;
  window.verificarVencimentos = verificarVencimentos;
  window.gerarRelatorio = gerarRelatorio;
  window.exportarJSON = exportarJSON;
  window.importarJSON = (file) => importarJSON(file);
  window.limparDados = limparDados;
  window.enviarWhatsAppVenda = enviarWhatsAppVenda;
  window.marcarComoPago = marcarComoPago;
  window.editarProduto = editarProduto;
  window.excluirProduto = excluirProduto;
  window.editarVenda = editarVenda;
  window.excluirVenda = excluirVenda;

  // Inicializa UI
  listarProdutos();
  listarVendas();
  atualizarProdutosDropdown();

  // ------------- LEMBRETE AUTOMÁTICO -------------
  // Executa a verificação de vencimentos automaticamente ao abrir o app
  // OBS: essa rotina abre janelas/abas do WhatsApp para cada cliente com vencimento hoje.
  // Se preferir comentar a linha abaixo, remova ou comente a chamada.
  verificarVencimentos();
});
