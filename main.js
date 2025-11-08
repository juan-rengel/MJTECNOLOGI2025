// ======== SISTEMA MJ TECNOLOGIA 2025 ========

let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let vendas = JSON.parse(localStorage.getItem("vendas")) || [];

document.addEventListener("DOMContentLoaded", () => {
  try {
    // aplica tema salvo
    if (localStorage.getItem("temaClaro") === "true") {
      document.body.classList.add("light");
    }

    // inicializa botões/handlers
    const btnCadastrar = document.getElementById("btnCadastrarProduto");
    if (btnCadastrar) {
      // garante que o onclick exista (compatível com index.html que tem onclick inline)
      btnCadastrar.onclick = cadastrarProduto;
    } else {
      console.warn("botão #btnCadastrarProduto não encontrado no DOM.");
    }

    const fotoInput = document.getElementById("fotoProduto");
    if (fotoInput) {
      fotoInput.addEventListener("change", mostrarPreviewFoto);
    }

    // render inicial
    atualizarProdutos();
    atualizarVendas();
    gerarRelatorio();

    console.log("MJ Tecnologia: script inicializado com sucesso.");
  } catch (err) {
    console.error("Erro ao inicializar script:", err);
    alert("Ocorreu um erro ao iniciar o sistema. Abra o console para mais detalhes.");
  }
});

// ----- Tema -----
function alternarTema() {
  document.body.classList.toggle("light");
  localStorage.setItem("temaClaro", document.body.classList.contains("light"));
}

// ----- Abas -----
function mostrarAba(id) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("ativa"));
  const alvo = document.getElementById(id);
  if (alvo) alvo.classList.add("ativa");
}

// ----- Salvar localStorage -----
function salvarDados() {
  localStorage.setItem("produtos", JSON.stringify(produtos));
  localStorage.setItem("vendas", JSON.stringify(vendas));
}

// ----- Preview foto -----
function mostrarPreviewFoto() {
  const preview = document.getElementById("previewFoto");
  const input = document.getElementById("fotoProduto");
  preview.innerHTML = "";
  if (input && input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.maxWidth = "120px";
      img.style.borderRadius = "6px";
      preview.appendChild(img);
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// ----- Atualizar lista de produtos -----
function atualizarProdutos() {
  const lista = document.getElementById("listaProdutos");
  const select = document.getElementById("produtoVenda");
  if (!lista || !select) {
    console.warn("Elementos de lista-produtos ou produtoVenda não encontrados.");
    return;
  }
  lista.innerHTML = "";
  select.innerHTML = "<option value=''>Selecione</option>";

  produtos.forEach((p, i) => {
    const li = document.createElement("li");
    const estoqueInt = parseInt(p.estoque) || 0;
    let estoqueClass = estoqueInt < 3 ? "style='color:red; font-weight:bold;'" : "";
    li.innerHTML = `
      <strong>${p.nome}</strong><br>
      Preço: R$ ${Number(p.preco).toFixed(2)} | Custo: R$ ${Number(p.custo).toFixed(2)} |
      <span ${estoqueClass}>Estoque: ${estoqueInt}</span>
      ${p.foto ? `<br><img src="${p.foto}" width="60">` : ""}
      <br>
      <button class="excluir-btn" onclick="excluirProduto(${i})">Excluir</button>
      <button class="excluir-btn" style="background:orange; margin-left:5px;" onclick="editarProduto(${i})">Editar</button>
    `;
    lista.appendChild(li);

    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = p.nome;
    select.appendChild(opt);
  });
}

// ----- Cadastrar produto -----
function cadastrarProduto() {
  try {
    const nome = document.getElementById("nomeProduto").value.trim();
    const preco = parseFloat(document.getElementById("precoProduto").value);
    const custo = parseFloat(document.getElementById("custoProduto").value);
    const estoque = parseInt(document.getElementById("estoqueProduto").value);
    const fotoInput = document.getElementById("fotoProduto");

    if (!nome || isNaN(preco) || isNaN(custo) || isNaN(estoque)) {
      alert("⚠️ Preencha todos os campos corretamente!");
      return;
    }

    const salvarProduto = (fotoBase64) => {
      produtos.push({
        nome,
        preco,
        custo,
        estoque,
        foto: fotoBase64 || null
      });
      salvarDados();
      atualizarProdutos();
      limparCamposProduto();
      alert("✅ Produto cadastrado com sucesso!");
    };

    if (fotoInput && fotoInput.files && fotoInput.files[0]) {
      const leitor = new FileReader();
      leitor.onload = (e) => salvarProduto(e.target.result);
      leitor.readAsDataURL(fotoInput.files[0]);
    } else {
      salvarProduto(null);
    }
  } catch (err) {
    console.error("Erro em cadastrarProduto:", err);
    alert("Erro ao cadastrar produto. Veja o console para detalhes.");
  }
}

// ----- Limpar campos -----
function limparCamposProduto() {
  document.getElementById("nomeProduto").value = "";
  document.getElementById("precoProduto").value = "";
  document.getElementById("custoProduto").value = "";
  document.getElementById("estoqueProduto").value = "";
  const fotoInput = document.getElementById("fotoProduto");
  if (fotoInput) {
    fotoInput.value = "";
    delete fotoInput.dataset.editIndex;
  }
  const preview = document.getElementById("previewFoto");
  if (preview) preview.innerHTML = "";

  const botao = document.getElementById("btnCadastrarProduto");
  if (botao) {
    botao.textContent = "➕ Adicionar Produto";
    botao.onclick = cadastrarProduto;
  }
}

// ----- Editar produto -----
function editarProduto(i) {
  const p = produtos[i];
  if (!p) {
    alert("Produto não encontrado para edição.");
    return;
  }
  document.getElementById("nomeProduto").value = p.nome;
  document.getElementById("precoProduto").value = p.preco;
  document.getElementById("custoProduto").value = p.custo;
  document.getElementById("estoqueProduto").value = p.estoque;

  const fotoInput = document.getElementById("fotoProduto");
  if (fotoInput) fotoInput.dataset.editIndex = i;

  const botao = document.getElementById("btnCadastrarProduto");
  if (botao) {
    botao.textContent = "💾 Salvar Alterações";
    botao.onclick = () => salvarEdicaoProduto(i);
  } else {
    alert("Botão de cadastro não encontrado.");
  }
}

// ----- Salvar edição -----
function salvarEdicaoProduto(i) {
  try {
    const nome = document.getElementById("nomeProduto").value.trim();
    const preco = parseFloat(document.getElementById("precoProduto").value);
    const custo = parseFloat(document.getElementById("custoProduto").value);
    const estoque = parseInt(document.getElementById("estoqueProduto").value);
    const fotoInput = document.getElementById("fotoProduto");

    if (!nome || isNaN(preco) || isNaN(custo) || isNaN(estoque)) {
      alert("⚠️ Preencha todos os campos corretamente!");
      return;
    }

    const aplicarAtualizacao = (fotoBase64) => {
      produtos[i] = {
        nome,
        preco,
        custo,
        estoque,
        foto: fotoBase64 || (produtos[i] ? produtos[i].foto : null)
      };
      salvarDados();
      atualizarProdutos();
      limparCamposProduto();
      alert("✅ Produto atualizado com sucesso!");
    };

    if (fotoInput && fotoInput.files && fotoInput.files.length > 0) {
      const leitor = new FileReader();
      leitor.onload = (e) => aplicarAtualizacao(e.target.result);
      leitor.readAsDataURL(fotoInput.files[0]);
    } else {
      aplicarAtualizacao(produtos[i] ? produtos[i].foto : null);
    }
  } catch (err) {
    console.error("Erro em salvarEdicaoProduto:", err);
    alert("Erro ao salvar edição. Veja o console para detalhes.");
  }
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
  try {
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
    if (!produto) {
      alert("Produto inválido.");
      return;
    }
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
  } catch (err) {
    console.error("Erro em registrarVenda:", err);
    alert("Erro ao registrar venda. Veja o console para detalhes.");
  }
}

// ----- Atualizar lista de vendas -----
function atualizarVendas() {
  const lista = document.getElementById("listaVendas");
  if (!lista) return;
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
  if (!resumo) return;
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

// ----- Lembrete automático WhatsApp (checa a cada minuto) -----
setInterval(() => {
  const hoje = new Date().toISOString().split("T")[0];
  vendas.forEach(v => {
    if (v.vencimento && !v.pago) {
      const venc = new Date(v.vencimento).toISOString().split("T")[0];
      if (venc === hoje && v.whats) {
        const msg = `Olá ${v.cliente}! Lembrete: sua compra de ${v.produto} vence hoje.`;
        const link = `https://wa.me/55${v.whats}?text=${encodeURIComponent(msg)}`;
        window.open(link, "_blank");
        v.pago = true;
        salvarDados();
      }
    }
  });
}, 60000);
