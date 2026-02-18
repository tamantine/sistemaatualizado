// =============================================
// Página: Gestão de Estoque
// =============================================
import { useState, useEffect } from 'react';
import { useEstoqueStore } from '../store/useEstoqueStore';
import { useAppStore } from '../store/useAppStore';
import Modal from '../components/ui/Modal';
import ProdutoForm from '../components/estoque/ProdutoForm';
import { formatarMoeda } from '../utils/formatters';
import {
    Plus, Search, Filter, Edit, Trash2, Package,
    AlertTriangle, DollarSign, ChevronLeft, ChevronRight,
    Eye,
} from 'lucide-react';
import type { Produto } from '../types';

export default function Estoque() {
    const {
        busca, setBusca,
        filtroCategoria, setFiltroCategoria,
        paginaAtual, setPaginaAtual,
        categorias,
        produtosFiltrados, produtosPaginados, totalPaginas,
        adicionarProduto, atualizarProduto, removerProduto,
    } = useEstoqueStore();
    const { adicionarToast } = useAppStore();

    // Carregar dados do Supabase na montagem
    const carregarDados = useEstoqueStore((s) => s.carregarDados);
    useEffect(() => { carregarDados(); }, [carregarDados]);

    const [modalAberto, setModalAberto] = useState(false);
    const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);
    const [confirmarExclusao, setConfirmarExclusao] = useState<string | null>(null);

    // Métricas do topo
    const todosProdutos = produtosFiltrados();
    const totalProdutos = todosProdutos.length;
    const estoqueTotal = todosProdutos.reduce((acc, p) => acc + p.estoque_atual * p.preco_venda, 0);
    const alertas = todosProdutos.filter((p) => p.estoque_atual <= p.estoque_minimo).length;
    const vencendo = todosProdutos.filter((p) => {
        if (!p.data_validade) return false;
        const dias = Math.ceil((new Date(p.data_validade).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return dias <= 5 && dias > 0;
    }).length;

    // Funções de status
    const getStatusProduto = (p: Produto) => {
        if (p.estoque_atual <= 0) return { label: 'Sem Estoque', cor: 'bg-red-500/20 text-red-400' };
        if (p.estoque_atual <= p.estoque_minimo) return { label: 'Estoque Baixo', cor: 'bg-yellow-500/20 text-yellow-400' };
        if (p.data_validade) {
            const dias = Math.ceil((new Date(p.data_validade).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            if (dias <= 3) return { label: `Vence em ${dias}d`, cor: 'bg-orange-500/20 text-orange-400' };
        }
        return { label: 'Normal', cor: 'bg-green-500/20 text-green-400' };
    };

    // Abrir modal para novo ou edição
    const abrirModal = (produto?: Produto) => {
        setProdutoEditando(produto || null);
        setModalAberto(true);
    };

    // Salvar produto
    const salvarProduto = (dados: Partial<Produto>) => {
        if (produtoEditando) {
            atualizarProduto(produtoEditando.id, dados);
            adicionarToast({ tipo: 'sucesso', titulo: 'Produto atualizado', mensagem: `${dados.nome} foi atualizado com sucesso` });
        } else {
            const novoProduto: Produto = {
                id: crypto.randomUUID(),
                nome: dados.nome || '',
                codigo: dados.codigo,
                codigo_barras: dados.codigo_barras,
                categoria_id: dados.categoria_id,
                unidade: dados.unidade || 'UN',
                preco_custo: dados.preco_custo || 0,
                preco_venda: dados.preco_venda || 0,
                estoque_atual: dados.estoque_atual || 0,
                estoque_minimo: dados.estoque_minimo || 0,
                data_validade: dados.data_validade,
                lote: dados.lote,
                localizacao: dados.localizacao,
                margem_lucro: dados.preco_custo ? ((dados.preco_venda! - dados.preco_custo) / dados.preco_custo) * 100 : 0,
                ativo: true,
                em_promocao: false,
                icms_aliquota: 0,
                pis_aliquota: 0,
                cofins_aliquota: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            adicionarProduto(novoProduto);
            adicionarToast({ tipo: 'sucesso', titulo: 'Produto cadastrado', mensagem: `${dados.nome} foi adicionado ao estoque` });
        }
        setModalAberto(false);
        setProdutoEditando(null);
    };

    // Excluir produto
    const excluirProduto = (id: string) => {
        removerProduto(id);
        adicionarToast({ tipo: 'sucesso', titulo: 'Produto excluído' });
        setConfirmarExclusao(null);
    };

    // Obtém nome da categoria
    const nomeCategoria = (catId?: string) => {
        return categorias.find((c) => c.id === catId)?.nome || '—';
    };

    const produtos = produtosPaginados();
    const paginas = totalPaginas();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Cards de métricas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                        <Package size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-surface-400">Total Produtos</p>
                        <p className="text-xl font-bold text-surface-100">{totalProdutos}</p>
                    </div>
                </div>
                <div className="glass rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                        <DollarSign size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-surface-400">Valor em Estoque</p>
                        <p className="text-xl font-bold text-surface-100">{formatarMoeda(estoqueTotal)}</p>
                    </div>
                </div>
                <div className="glass rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center">
                        <AlertTriangle size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-surface-400">Estoque Baixo</p>
                        <p className="text-xl font-bold text-surface-100">{alertas}</p>
                    </div>
                </div>
                <div className="glass rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                        <Eye size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-surface-400">Vencendo</p>
                        <p className="text-xl font-bold text-surface-100">{vencendo}</p>
                    </div>
                </div>
            </div>

            {/* Barra de ações */}
            <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex flex-1 gap-3 w-full sm:w-auto">
                    {/* Busca */}
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                        <input
                            type="text"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            placeholder="Buscar por nome, código ou barras..."
                            className="w-full bg-surface-700/50 border border-surface-600 rounded-xl pl-9 pr-3 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                        />
                    </div>
                    {/* Filtro de categoria */}
                    <div className="relative">
                        <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                        <select
                            value={filtroCategoria}
                            onChange={(e) => setFiltroCategoria(e.target.value)}
                            className="bg-surface-700/50 border border-surface-600 rounded-xl pl-9 pr-8 py-2.5 text-sm text-surface-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Todas</option>
                            {categorias.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.nome}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {/* Botão novo */}
                <button
                    onClick={() => abrirModal()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all shrink-0"
                >
                    <Plus size={16} /> Novo Produto
                </button>
            </div>

            {/* Tabela de produtos */}
            <div className="glass rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-surface-700">
                                <th className="text-left py-3 px-4 text-surface-400 font-semibold">Produto</th>
                                <th className="text-left py-3 px-4 text-surface-400 font-semibold hidden md:table-cell">Categoria</th>
                                <th className="text-left py-3 px-4 text-surface-400 font-semibold">UN</th>
                                <th className="text-right py-3 px-4 text-surface-400 font-semibold">Preço</th>
                                <th className="text-right py-3 px-4 text-surface-400 font-semibold hidden sm:table-cell">Estoque</th>
                                <th className="text-center py-3 px-4 text-surface-400 font-semibold hidden lg:table-cell">Status</th>
                                <th className="text-center py-3 px-4 text-surface-400 font-semibold">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {produtos.map((produto) => {
                                const status = getStatusProduto(produto);
                                return (
                                    <tr
                                        key={produto.id}
                                        className="border-b border-surface-700/50 hover:bg-surface-800/30 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-semibold text-surface-200">{produto.nome}</p>
                                                <p className="text-xs text-surface-500">{produto.codigo || '—'}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-surface-400 hidden md:table-cell">{nomeCategoria(produto.categoria_id)}</td>
                                        <td className="py-3 px-4">
                                            <span className="text-xs font-bold bg-surface-700 text-surface-300 px-2 py-1 rounded-lg">
                                                {produto.unidade}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <span className="font-semibold text-brand-400">{formatarMoeda(produto.preco_venda)}</span>
                                            {produto.em_promocao && produto.preco_promocional && (
                                                <p className="text-xs text-accent-400">Promo: {formatarMoeda(produto.preco_promocional)}</p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right text-surface-300 hidden sm:table-cell">
                                            {produto.estoque_atual} {produto.unidade.toLowerCase()}
                                        </td>
                                        <td className="py-3 px-4 text-center hidden lg:table-cell">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.cor}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => abrirModal(produto)}
                                                    className="p-2 rounded-lg text-surface-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmarExclusao(produto.id)}
                                                    className="p-2 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {produtos.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-surface-500">
                                        <Package size={40} className="mx-auto mb-3 opacity-30" />
                                        <p>Nenhum produto encontrado</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                {paginas > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-surface-700">
                        <p className="text-xs text-surface-500">
                            {totalProdutos} produto(s) • Página {paginaAtual} de {paginas}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                                disabled={paginaAtual === 1}
                                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors disabled:opacity-30"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            {Array.from({ length: paginas }, (_, i) => i + 1).map((pg) => (
                                <button
                                    key={pg}
                                    onClick={() => setPaginaAtual(pg)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${pg === paginaAtual
                                        ? 'bg-brand-600 text-white'
                                        : 'text-surface-400 hover:bg-surface-700'
                                        }`}
                                >
                                    {pg}
                                </button>
                            ))}
                            <button
                                onClick={() => setPaginaAtual(Math.min(paginas, paginaAtual + 1))}
                                disabled={paginaAtual === paginas}
                                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors disabled:opacity-30"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de cadastro/edição */}
            <Modal
                aberto={modalAberto}
                onFechar={() => { setModalAberto(false); setProdutoEditando(null); }}
                titulo={produtoEditando ? 'Editar Produto' : 'Novo Produto'}
                tamanho="lg"
            >
                <ProdutoForm
                    produto={produtoEditando}
                    categorias={categorias}
                    onSalvar={salvarProduto}
                    onCancelar={() => { setModalAberto(false); setProdutoEditando(null); }}
                />
            </Modal>

            {/* Modal de confirmação de exclusão */}
            <Modal
                aberto={!!confirmarExclusao}
                onFechar={() => setConfirmarExclusao(null)}
                titulo="Confirmar Exclusão"
                tamanho="sm"
            >
                <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <Trash2 size={28} className="text-red-400" />
                    </div>
                    <p className="text-surface-300 mb-6">Tem certeza que deseja excluir este produto?<br />Esta ação não pode ser desfeita.</p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => setConfirmarExclusao(null)}
                            className="px-4 py-2.5 rounded-xl text-sm font-medium text-surface-400 hover:bg-surface-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => confirmarExclusao && excluirProduto(confirmarExclusao)}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors"
                        >
                            Excluir
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
