const PRECO_RESINA = 85;
const PRECO_BARRO = 15;

let produtos = JSON.parse(localStorage.getItem('produtos')) || [];
let vendas = JSON.parse(localStorage.getItem('vendas')) || [];
let estoque = JSON.parse(localStorage.getItem('estoque')) || { resina: 50, barro: 30 };

function dinheiro(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function salvar() {
  localStorage.setItem('produtos', JSON.stringify(produtos));
  localStorage.setItem('vendas', JSON.stringify(vendas));
  localStorage.setItem('estoque', JSON.stringify(estoque));
}

function calcularCusto(resina, barro, acabamento) {
  return (resina * PRECO_RESINA) + (barro * PRECO_BARRO) + acabamento;
}

function adicionarProduto() {
  const nome = document.getElementById('nomeProduto').value.trim();
  const resina = Number(document.getElementById('resina').value);
  const barro = Number(document.getElementById('barro').value);
  const acabamento = Number(document.getElementById('acabamento').value);
  const precoVenda = Number(document.getElementById('precoVenda').value);

  if (!nome || !precoVenda) {
    alert('Preencha o nome da peça e o preço de venda.');
    return;
  }

  const custo = calcularCusto(resina, barro, acabamento);
  produtos.push({ id: Date.now(), nome, resina, barro, acabamento, precoVenda, custo });
  salvar();
  limparCamposProduto();
  atualizarTela();
}

function limparCamposProduto() {
  ['nomeProduto', 'resina', 'barro', 'acabamento', 'precoVenda'].forEach(id => document.getElementById(id).value = '');
}

function registrarVenda() {
  const produtoId = Number(document.getElementById('produtoVenda').value);
  const produto = produtos.find(p => p.id === produtoId);
  const cliente = document.getElementById('cliente').value.trim() || 'Cliente não informado';
  const quantidade = Number(document.getElementById('quantidade').value) || 1;

  if (!produto) {
    alert('Cadastre um produto antes de vender.');
    return;
  }

  const total = produto.precoVenda * quantidade;
  const custoTotal = produto.custo * quantidade;
  const lucro = total - custoTotal;

  estoque.resina -= produto.resina * quantidade;
  estoque.barro -= produto.barro * quantidade;

  vendas.push({
    data: new Date().toLocaleDateString('pt-BR'),
    cliente,
    produto: produto.nome,
    quantidade,
    total,
    lucro
  });

  salvar();
  document.getElementById('cliente').value = '';
  document.getElementById('quantidade').value = 1;
  atualizarTela();
}

function salvarEstoque() {
  estoque.resina = Number(document.getElementById('estoqueResina').value);
  estoque.barro = Number(document.getElementById('estoqueBarro').value);
  salvar();
  atualizarTela();
}

function atualizarTela() {
  atualizarDashboard();
  atualizarProdutos();
  atualizarVendas();
  atualizarSelect();
  atualizarEstoque();
  atualizarSugestao();
}

function atualizarDashboard() {
  const totalVendido = vendas.reduce((soma, venda) => soma + venda.total, 0);
  const totalLucro = vendas.reduce((soma, venda) => soma + venda.lucro, 0);
  const totalCusto = totalVendido - totalLucro;
  const totalPecas = vendas.reduce((soma, venda) => soma + venda.quantidade, 0);

  document.getElementById('totalVendido').textContent = dinheiro(totalVendido);
  document.getElementById('totalCusto').textContent = dinheiro(totalCusto);
  document.getElementById('totalLucro').textContent = dinheiro(totalLucro);
  document.getElementById('totalPecas').textContent = totalPecas;
}

function atualizarProdutos() {
  const tbody = document.getElementById('listaProdutos');
  tbody.innerHTML = '';

  produtos.forEach(produto => {
    const lucro = produto.precoVenda - produto.custo;
    const margem = produto.precoVenda ? (lucro / produto.precoVenda) * 100 : 0;
    tbody.innerHTML += `
      <tr>
        <td>${produto.nome}</td>
        <td>${dinheiro(produto.custo)}</td>
        <td>${dinheiro(produto.precoVenda)}</td>
        <td>${dinheiro(lucro)}</td>
        <td>${margem.toFixed(1)}%</td>
      </tr>
    `;
  });
}

function atualizarVendas() {
  const tbody = document.getElementById('listaVendas');
  tbody.innerHTML = '';

  vendas.slice().reverse().forEach(venda => {
    tbody.innerHTML += `
      <tr>
        <td>${venda.data}</td>
        <td>${venda.cliente}</td>
        <td>${venda.produto}</td>
        <td>${venda.quantidade}</td>
        <td>${dinheiro(venda.total)}</td>
        <td>${dinheiro(venda.lucro)}</td>
      </tr>
    `;
  });
}

function atualizarSelect() {
  const select = document.getElementById('produtoVenda');
  select.innerHTML = '<option value="">Selecione um produto</option>';
  produtos.forEach(produto => {
    select.innerHTML += `<option value="${produto.id}">${produto.nome}</option>`;
  });
}

function atualizarEstoque() {
  document.getElementById('estoqueResina').value = estoque.resina;
  document.getElementById('estoqueBarro').value = estoque.barro;

  let alertas = [];
  if (estoque.resina <= 10) alertas.push('Resina baixa');
  if (estoque.barro <= 10) alertas.push('Barro baixo');
  document.getElementById('alertaEstoque').textContent = alertas.length ? 'Atenção: ' + alertas.join(' e ') : 'Estoque dentro do controle.';
}

function atualizarSugestao() {
  const box = document.getElementById('sugestaoPreco');
  if (!produtos.length) {
    box.textContent = 'Cadastre um produto para receber sugestão de preço.';
    return;
  }
  const produto = produtos[produtos.length - 1];
  const sugestao = produto.custo * 1.3;
  box.textContent = `Sugestão: ${produto.nome} custa ${dinheiro(produto.custo)}. Para 30% de margem sobre custo, venda por pelo menos ${dinheiro(sugestao)}.`;
}

function limparTudo() {
  if (confirm('Tem certeza que deseja apagar todos os dados?')) {
    produtos = [];
    vendas = [];
    estoque = { resina: 50, barro: 30 };
    salvar();
    atualizarTela();
  }
}

atualizarTela();
