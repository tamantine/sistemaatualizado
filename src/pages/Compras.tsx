// =============================================
// Página: Compras & Fornecedores
// Pedidos, Fornecedores, Cotações
// =============================================
import { useComprasStore } from '../store/useComprasStore';
import { useAppStore } from '../store/useAppStore';
import type { Fornecedor, PedidoCompra } from '../types';
import { formatarMoeda, formatarData } from '../utils/formatters';
import Modal from '../components/ui/Modal';
import { useState } from 'react';
import {
    Package, Search, Plus, Edit3, Trash2, Truck,
    FileText, CheckCircle, XCircle, Clock, Users, ShoppingCart,
    BarChart3, Phone, Mail, MapPin, Building2,
    ArrowDownCircle, Scale, Send, Star,
} from 'lucide-react';

function CardMetrica({ titulo, valor, icone: Icone, cor, subtitulo }: {
    titulo: string; valor: string | number; icone: React.ElementType; cor: string; subtitulo?: string;
}) {
    return (
        <div className="bg-surface-800/60 backdrop-blur-sm rounded-2xl p-5 border border-surface-700/50 hover:border-surface-600 transition-all">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cor} flex items-center justify-center shadow-lg`}>
                    <Icone size={20} className="text-white" />
                </div>
            </div>
            <p className="text-2xl font-bold text-surface-100 mb-0.5">{valor}</p>
            <p className="text-xs text-surface-400">{titulo}</p>
            {subtitulo && <p className="text-[10px] text-surface-500 mt-1">{subtitulo}</p>}
        </div>
    );
}

// =============================================
// Aba: Pedidos de Compra
// =============================================
function AbaPedidos() {
    const store = useComprasStore();
    const { adicionarToast } = useAppStore();
    const pedidos = store.pedidosFiltrados();
    const stats = store.estatisticas();

    const statusConfig: Record<PedidoCompra['status'], { cor: string; icone: React.ElementType; label: string }> = {
        pendente: { cor: 'text-amber-400 bg-amber-500/10', icone: Clock, label: 'Pendente' },
        aprovado: { cor: 'text-blue-400 bg-blue-500/10', icone: CheckCircle, label: 'Aprovado' },
        recebido: { cor: 'text-green-400 bg-green-500/10', icone: ArrowDownCircle, label: 'Recebido' },
        cancelado: { cor: 'text-red-400 bg-red-500/10', icone: XCircle, label: 'Cancelado' },
    };

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Cards métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <CardMetrica titulo="Total de Pedidos" valor={stats.totalPedidos} icone={ShoppingCart} cor="from-blue-500 to-indigo-700" />
                <CardMetrica titulo="Pendentes/Aprovados" valor={stats.pendentes} icone={Clock} cor="from-amber-500 to-orange-700" subtitulo="Aguardando recebimento" />
                <CardMetrica titulo="Volume Total" valor={formatarMoeda(stats.valorTotal)} icone={BarChart3} cor="from-green-500 to-emerald-700" subtitulo="Pedidos ativos" />
                <CardMetrica titulo="Economia Cotações" valor={formatarMoeda(stats.economiaCotacoes)} icone={Scale} cor="from-cyan-500 to-blue-700" subtitulo="Este mês" />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-2 items-center flex-1 w-full sm:w-auto">
                    <div className="relative flex-1 sm:max-w-xs">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                        <input type="text" value={store.buscaPedido} onChange={(e) => store.setBuscaPedido(e.target.value)} placeholder="Buscar pedido..." className="w-full bg-surface-800/50 border border-surface-700 rounded-xl pl-9 pr-3 py-2 text-sm text-surface-200 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
                    </div>
                    <select value={store.filtroPedido} onChange={(e) => store.setFiltroPedido(e.target.value as typeof store.filtroPedido)} className="bg-surface-800/50 border border-surface-700 rounded-xl px-3 py-2 text-sm text-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none cursor-pointer">
                        <option value="todos">Todos Status</option>
                        <option value="pendente">Pendente</option>
                        <option value="aprovado">Aprovado</option>
                        <option value="recebido">Recebido</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>
                <button onClick={() => { store.setPedidoSelecionado(null); store.setModalPedido(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all">
                    <Plus size={16} /> Novo Pedido
                </button>
            </div>

            {/* Lista de pedidos */}
            <div className="space-y-3">
                {pedidos.length === 0 ? (
                    <div className="py-16 text-center text-surface-500">Nenhum pedido encontrado</div>
                ) : (
                    pedidos.map((pedido) => {
                        const cfg = statusConfig[pedido.status];
                        const StatusIcon = cfg.icone;
                        return (
                            <div key={pedido.id} className="bg-surface-800/60 rounded-2xl border border-surface-700/50 hover:border-surface-600 transition-all overflow-hidden">
                                <div className="p-5">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-600 flex items-center justify-center shadow-lg">
                                                <FileText size={22} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-surface-100">Pedido #{pedido.numero_pedido}</p>
                                                <p className="text-xs text-surface-400">{pedido.fornecedor?.razao_social || 'Fornecedor'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.cor}`}>
                                                <StatusIcon size={12} /> {cfg.label}
                                            </span>
                                            <span className="text-lg font-bold text-surface-100">{formatarMoeda(pedido.valor_total)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-surface-400">
                                        <div className="flex items-center gap-1"><Clock size={12} /> Criado: {formatarData(pedido.created_at)}</div>
                                        {pedido.data_previsao && <div className="flex items-center gap-1"><Truck size={12} /> Previsão: {formatarData(pedido.data_previsao)}</div>}
                                        {pedido.data_recebimento && <div className="flex items-center gap-1 text-green-400"><ArrowDownCircle size={12} /> Recebido: {formatarData(pedido.data_recebimento)}</div>}
                                        {pedido.itens && <div className="flex items-center gap-1"><Package size={12} /> {pedido.itens.length} itens</div>}
                                    </div>

                                    {pedido.observacoes && <p className="mt-2 text-xs text-surface-500 italic">"{pedido.observacoes}"</p>}

                                    {/* Itens do pedido expandíveis */}
                                    {pedido.itens && pedido.itens.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-surface-700/30">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                {pedido.itens.map((item) => (
                                                    <div key={item.id} className="flex items-center gap-2 bg-surface-700/20 rounded-lg px-3 py-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-surface-200 truncate">{item.produto?.nome || 'Produto'}</p>
                                                            <p className="text-[10px] text-surface-500">{item.quantidade} × {formatarMoeda(item.preco_unitario)}</p>
                                                        </div>
                                                        <p className="text-xs font-bold text-surface-200">{formatarMoeda(item.subtotal)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Ações do pedido */}
                                    <div className="mt-3 pt-3 border-t border-surface-700/30 flex items-center justify-end gap-2">
                                        {pedido.status === 'pendente' && (
                                            <button onClick={() => { store.aprovarPedido(pedido.id); adicionarToast({ tipo: 'sucesso', titulo: 'Pedido aprovado!' }); }}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition-colors">
                                                <CheckCircle size={13} /> Aprovar
                                            </button>
                                        )}
                                        {pedido.status === 'aprovado' && (
                                            <button onClick={() => { store.receberPedido(pedido.id); adicionarToast({ tipo: 'sucesso', titulo: 'Pedido recebido!', mensagem: 'Estoque será atualizado' }); }}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-colors">
                                                <ArrowDownCircle size={13} /> Confirmar Recebimento
                                            </button>
                                        )}
                                        {(pedido.status === 'pendente' || pedido.status === 'aprovado') && (
                                            <button onClick={() => { if (confirm('Cancelar este pedido?')) { store.atualizarPedido(pedido.id, { status: 'cancelado' }); adicionarToast({ tipo: 'aviso', titulo: 'Pedido cancelado' }); } }}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                                                <XCircle size={13} /> Cancelar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// =============================================
// Aba: Fornecedores
// =============================================
function AbaFornecedores() {
    const store = useComprasStore();
    const { adicionarToast } = useAppStore();
    const fornecedores = store.fornecedoresFiltrados();

    const tipoLabel = (t: Fornecedor['tipo']) => {
        if (t === 'juridica') return '🏢 Pessoa Jurídica';
        if (t === 'produtor_rural') return '🌱 Produtor Rural';
        return '👤 Pessoa Física';
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative flex-1 sm:max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                    <input type="text" value={store.buscaFornecedor} onChange={(e) => store.setBuscaFornecedor(e.target.value)} placeholder="Buscar fornecedor..." className="w-full bg-surface-800/50 border border-surface-700 rounded-xl pl-9 pr-3 py-2 text-sm text-surface-200 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all" />
                </div>
                <button onClick={() => { store.setFornecedorSelecionado(null); store.setModalFornecedor(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all">
                    <Plus size={16} /> Novo Fornecedor
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {fornecedores.map((f) => (
                    <div key={f.id} className="bg-surface-800/60 rounded-2xl border border-surface-700/50 hover:border-surface-600 transition-all overflow-hidden">
                        <div className="px-5 py-4 border-b border-surface-700/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                    {f.razao_social.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-surface-100 truncate max-w-[180px]">{f.razao_social}</p>
                                    {f.nome_fantasia && <p className="text-[10px] text-surface-500">{f.nome_fantasia}</p>}
                                </div>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${f.ativo ? 'text-green-400 bg-green-500/10' : 'text-surface-500 bg-surface-700/50'}`}>
                                {f.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                        <div className="px-5 py-3 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-surface-400"><Building2 size={12} className="text-surface-500" /> {tipoLabel(f.tipo)}</div>
                            {f.cnpj_cpf && <div className="flex items-center gap-2 text-xs text-surface-400"><FileText size={12} className="text-surface-500" /> {f.cnpj_cpf}</div>}
                            {f.telefone && <div className="flex items-center gap-2 text-xs text-surface-400"><Phone size={12} className="text-surface-500" /> {f.telefone}</div>}
                            {f.email && <div className="flex items-center gap-2 text-xs text-surface-400 truncate"><Mail size={12} className="text-surface-500" /> {f.email}</div>}
                            {f.cidade && <div className="flex items-center gap-2 text-xs text-surface-400"><MapPin size={12} className="text-surface-500" /> {f.cidade}{f.estado ? ` - ${f.estado}` : ''}</div>}
                        </div>
                        <div className="px-5 py-3 border-t border-surface-700/30 flex items-center justify-end gap-1">
                            <button onClick={() => { store.setFornecedorSelecionado(f); store.setModalFornecedor(true); }} className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors" title="Editar"><Edit3 size={14} /></button>
                            <button onClick={() => { if (confirm('Remover fornecedor?')) { store.removerFornecedor(f.id); adicionarToast({ tipo: 'info', titulo: 'Fornecedor removido' }); } }} className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Excluir"><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// =============================================
// Aba: Cotações
// =============================================
function AbaCotacoes() {
    const store = useComprasStore();
    const { adicionarToast } = useAppStore();

    const statusCor = (s: string) => {
        if (s === 'aberta') return 'text-blue-400 bg-blue-500/10';
        if (s === 'respondida') return 'text-amber-400 bg-amber-500/10';
        if (s === 'fechada') return 'text-green-400 bg-green-500/10';
        return 'text-surface-500 bg-surface-700/50';
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
                <p className="text-sm text-surface-400">Compare preços de múltiplos fornecedores antes de comprar</p>
                <button onClick={() => store.setModalCotacao(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all">
                    <Send size={16} /> Nova Cotação
                </button>
            </div>

            <div className="space-y-4">
                {store.cotacoes.map((cot) => (
                    <div key={cot.id} className="bg-surface-800/60 rounded-2xl border border-surface-700/50 overflow-hidden hover:border-surface-600 transition-all">
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="text-sm font-bold text-surface-100">{cot.titulo}</h4>
                                    <p className="text-xs text-surface-400 mt-0.5">Limite: {formatarData(cot.data_limite)} · {cot.itens.length} produtos · {cot.fornecedor_ids.length} fornecedores</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {cot.melhor_preco && <span className="text-sm font-bold text-green-400">{formatarMoeda(cot.melhor_preco)}</span>}
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusCor(cot.status)}`}>{cot.status.charAt(0).toUpperCase() + cot.status.slice(1)}</span>
                                </div>
                            </div>

                            {/* Itens da cotação */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {cot.itens.map((item, i) => (
                                    <span key={i} className="text-xs bg-surface-700/30 text-surface-300 px-2.5 py-1 rounded-lg">{item.produto_nome} ({item.quantidade})</span>
                                ))}
                            </div>

                            {/* Respostas dos fornecedores */}
                            {cot.respostas && cot.respostas.length > 0 && (
                                <div className="space-y-2 mt-3 pt-3 border-t border-surface-700/30">
                                    <p className="text-xs font-semibold text-surface-300 mb-2">📊 Respostas recebidas:</p>
                                    {cot.respostas.sort((a, b) => a.valor_total - b.valor_total).map((resp, i) => (
                                        <div key={resp.fornecedor_id} className={`flex items-center gap-3 py-2.5 px-3 rounded-xl ${i === 0 ? 'bg-green-500/5 border border-green-500/20' : 'bg-surface-700/20'}`}>
                                            {i === 0 && <Star size={14} className="text-green-400 shrink-0" />}
                                            {i > 0 && <span className="w-3.5 h-3.5 rounded-full bg-surface-600 text-[9px] text-surface-400 flex items-center justify-center shrink-0">{i + 1}</span>}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-medium ${i === 0 ? 'text-green-300' : 'text-surface-200'}`}>{resp.fornecedor_nome}</p>
                                                <p className="text-[10px] text-surface-500">Entrega: {resp.prazo_entrega} · Pagto: {resp.condicao_pagamento}</p>
                                            </div>
                                            <p className={`text-sm font-bold ${i === 0 ? 'text-green-400' : 'text-surface-300'}`}>{formatarMoeda(resp.valor_total)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Ações */}
                            {cot.status !== 'fechada' && cot.status !== 'cancelada' && (
                                <div className="mt-3 pt-3 border-t border-surface-700/30 flex justify-end gap-2">
                                    {cot.respostas && cot.respostas.length > 0 && (
                                        <button onClick={() => { store.fecharCotacao(cot.id); adicionarToast({ tipo: 'sucesso', titulo: 'Cotação fechada', mensagem: 'Melhor preço selecionado' }); }}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-colors">
                                            <CheckCircle size={13} /> Fechar Cotação
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// =============================================
// Modal: Novo Fornecedor
// =============================================
function ModalFornecedor() {
    const store = useComprasStore();
    const { adicionarToast } = useAppStore();
    const editando = store.fornecedorSelecionado;

    const [razao, setRazao] = useState(editando?.razao_social || '');
    const [fantasia, setFantasia] = useState(editando?.nome_fantasia || '');
    const [tipo, setTipo] = useState<Fornecedor['tipo']>(editando?.tipo || 'juridica');
    const [cnpj, setCnpj] = useState(editando?.cnpj_cpf || '');
    const [telefone, setTelefone] = useState(editando?.telefone || '');
    const [email, setEmail] = useState(editando?.email || '');
    const [cidade, setCidade] = useState(editando?.cidade || '');
    const [estado, setEstado] = useState(editando?.estado || '');

    const ic = "w-full bg-surface-700/50 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all";

    const salvar = () => {
        if (!razao.trim()) { adicionarToast({ tipo: 'erro', titulo: 'Razão social é obrigatória' }); return; }
        const agora = new Date().toISOString().split('T')[0];
        if (editando) {
            store.atualizarFornecedor(editando.id, { razao_social: razao.trim(), nome_fantasia: fantasia || undefined, tipo, cnpj_cpf: cnpj || undefined, telefone: telefone || undefined, email: email || undefined, cidade: cidade || undefined, estado: estado || undefined, updated_at: agora });
            adicionarToast({ tipo: 'sucesso', titulo: 'Fornecedor atualizado' });
        } else {
            store.adicionarFornecedor({ id: crypto.randomUUID(), razao_social: razao.trim(), nome_fantasia: fantasia || undefined, tipo, cnpj_cpf: cnpj || undefined, telefone: telefone || undefined, email: email || undefined, cidade: cidade || undefined, estado: estado || undefined, ativo: true, created_at: agora, updated_at: agora });
            adicionarToast({ tipo: 'sucesso', titulo: 'Fornecedor cadastrado' });
        }
        store.setModalFornecedor(false);
    };

    return (
        <Modal aberto={store.modalFornecedor} onFechar={() => store.setModalFornecedor(false)} titulo={editando ? 'Editar Fornecedor' : 'Novo Fornecedor'} tamanho="md">
            <div className="space-y-4">
                <div className="space-y-1.5"><label className="text-xs font-medium text-surface-400">Razão Social *</label><input type="text" value={razao} onChange={(e) => setRazao(e.target.value)} placeholder="Razão Social" className={ic} autoFocus /></div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><label className="text-xs font-medium text-surface-400">Nome Fantasia</label><input type="text" value={fantasia} onChange={(e) => setFantasia(e.target.value)} placeholder="Nome Fantasia" className={ic} /></div>
                    <div className="space-y-1.5"><label className="text-xs font-medium text-surface-400">Tipo</label>
                        <select value={tipo} onChange={(e) => setTipo(e.target.value as Fornecedor['tipo'])} className={ic}>
                            <option value="juridica">Pessoa Jurídica</option><option value="fisica">Pessoa Física</option><option value="produtor_rural">Produtor Rural</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><label className="text-xs font-medium text-surface-400">CNPJ/CPF</label><input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" className={ic} /></div>
                    <div className="space-y-1.5"><label className="text-xs font-medium text-surface-400">Telefone</label><input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" className={ic} /></div>
                </div>
                <div className="space-y-1.5"><label className="text-xs font-medium text-surface-400">E-mail</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" className={ic} /></div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><label className="text-xs font-medium text-surface-400">Cidade</label><input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" className={ic} /></div>
                    <div className="space-y-1.5"><label className="text-xs font-medium text-surface-400">Estado</label><input type="text" value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="UF" className={ic} maxLength={2} /></div>
                </div>
                <button onClick={salvar} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all mt-2">
                    <CheckCircle size={16} /> {editando ? 'Atualizar' : 'Cadastrar'}
                </button>
            </div>
        </Modal>
    );
}

// =============================================
// Página Principal: Compras & Fornecedores
// =============================================
const abas = [
    { id: 'pedidos' as const, label: 'Pedidos de Compra', icone: ShoppingCart },
    { id: 'fornecedores' as const, label: 'Fornecedores', icone: Users },
    { id: 'cotacoes' as const, label: 'Cotações', icone: Scale },
];

export default function Compras() {
    const { abaAtiva, setAbaAtiva } = useComprasStore();

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-surface-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center shadow-lg shadow-orange-600/25">
                            <Truck size={22} className="text-white" />
                        </div>
                        Compras & Fornecedores
                    </h1>
                    <p className="text-sm text-surface-500 mt-1 ml-[52px]">Pedidos de compra, cotações e gestão de fornecedores</p>
                </div>
            </div>

            <div className="flex gap-1 bg-surface-800/60 rounded-2xl p-1.5 border border-surface-700/50 overflow-x-auto">
                {abas.map((aba) => (
                    <button key={aba.id} onClick={() => setAbaAtiva(aba.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${abaAtiva === aba.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700/50'}`}>
                        <aba.icone size={15} /><span className="hidden sm:inline">{aba.label}</span>
                    </button>
                ))}
            </div>

            {abaAtiva === 'pedidos' && <AbaPedidos />}
            {abaAtiva === 'fornecedores' && <AbaFornecedores />}
            {abaAtiva === 'cotacoes' && <AbaCotacoes />}

            <ModalFornecedor />
        </div>
    );
}
