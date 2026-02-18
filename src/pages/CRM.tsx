// =============================================
// Página: CRM — Clientes, Fidelidade, Promoções, Tabelas de Preço
// =============================================
import { useCRMStore, getNivelFidelidade, niveisFidelidade } from '../store/useCRMStore';
import { useAppStore } from '../store/useAppStore';
import type { Promocao, TabelaPreco } from '../types';
import { formatarMoeda, formatarData } from '../utils/formatters';
import Modal from '../components/ui/Modal';
import { useState } from 'react';
import {
    Users, Search, Plus, Edit3, Trash2, Star, Award, Crown,
    Phone, Mail, MapPin, Filter, Eye, Gift, Tag,
    Calendar, ToggleLeft, ToggleRight, ShoppingBag, Heart,
    TrendingUp, Layers, ChevronRight,
    UserPlus, CheckCircle,
} from 'lucide-react';

// =============================================
// CardMetrica reutilizável (CRM)
// =============================================
function CardCRM({ titulo, valor, icone: Icone, cor, subtitulo }: {
    titulo: string; valor: string | number; icone: React.ElementType; cor: string; subtitulo?: string;
}) {
    return (
        <div className="bg-surface-800/60 backdrop-blur-sm rounded-2xl p-5 border border-surface-700/50 hover:border-surface-600 transition-all group">
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
// Aba: Clientes
// =============================================
function AbaClientes() {
    const store = useCRMStore();
    const { adicionarToast } = useAppStore();
    const clientes = store.clientesFiltrados();

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Barra de ferramentas */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-2 items-center flex-1 w-full sm:w-auto">
                    <div className="relative flex-1 sm:max-w-xs">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                        <input
                            type="text"
                            value={store.buscaCliente}
                            onChange={(e) => store.setBuscaCliente(e.target.value)}
                            placeholder="Buscar cliente..."
                            className="w-full bg-surface-800/50 border border-surface-700 rounded-xl pl-9 pr-3 py-2 text-sm text-surface-200 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                        <select
                            value={store.filtroAtivo}
                            onChange={(e) => store.setFiltroAtivo(e.target.value as 'todos' | 'ativos' | 'inativos')}
                            className="bg-surface-800/50 border border-surface-700 rounded-xl pl-8 pr-8 py-2 text-sm text-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none cursor-pointer"
                        >
                            <option value="todos">Todos</option>
                            <option value="ativos">Ativos</option>
                            <option value="inativos">Inativos</option>
                        </select>
                    </div>
                </div>
                <button
                    onClick={() => { store.setClienteSelecionado(null); store.setModalCliente(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all"
                >
                    <UserPlus size={16} /> Novo Cliente
                </button>
            </div>

            {/* Grid de clientes */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {clientes.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-surface-500">
                        Nenhum cliente encontrado
                    </div>
                ) : (
                    clientes.map((cliente) => {
                        const nivel = getNivelFidelidade(cliente.pontos_fidelidade);
                        return (
                            <div
                                key={cliente.id}
                                className="bg-surface-800/60 rounded-2xl border border-surface-700/50 hover:border-surface-600 transition-all overflow-hidden group"
                            >
                                {/* Header do card com nível */}
                                <div className="px-5 py-4 border-b border-surface-700/30 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                            {cliente.nome.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-surface-100 truncate max-w-[160px]">{cliente.nome}</p>
                                            <p className="text-[10px] text-surface-500">{cliente.cpf_cnpj || 'Sem CPF'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${nivel.cor}20`, color: nivel.cor }}>
                                            {nivel.emoji} {nivel.nome}
                                        </span>
                                    </div>
                                </div>

                                {/* Dados */}
                                <div className="px-5 py-3 space-y-1.5">
                                    {cliente.telefone && (
                                        <div className="flex items-center gap-2 text-xs text-surface-400">
                                            <Phone size={12} className="text-surface-500" /> {cliente.telefone}
                                        </div>
                                    )}
                                    {cliente.email && (
                                        <div className="flex items-center gap-2 text-xs text-surface-400 truncate">
                                            <Mail size={12} className="text-surface-500" /> {cliente.email}
                                        </div>
                                    )}
                                    {cliente.cidade && (
                                        <div className="flex items-center gap-2 text-xs text-surface-400">
                                            <MapPin size={12} className="text-surface-500" /> {cliente.cidade}{cliente.estado ? ` - ${cliente.estado}` : ''}
                                        </div>
                                    )}
                                </div>

                                {/* Footer com métricas e ações */}
                                <div className="px-5 py-3 border-t border-surface-700/30 flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-xs">
                                        <div className="text-center">
                                            <p className="font-bold text-surface-200">{cliente.pontos_fidelidade}</p>
                                            <p className="text-surface-500">pontos</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-surface-200">{formatarMoeda(cliente.limite_credito)}</p>
                                            <p className="text-surface-500">limite</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => store.setClienteSelecionado(cliente)}
                                            className="p-1.5 rounded-lg text-surface-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                                            title="Detalhes"
                                        >
                                            <Eye size={15} />
                                        </button>
                                        <button
                                            onClick={() => { store.setClienteSelecionado(cliente); store.setModalCliente(true); }}
                                            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors"
                                            title="Editar"
                                        >
                                            <Edit3 size={15} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Remover este cliente?')) {
                                                    store.removerCliente(cliente.id);
                                                    adicionarToast({ tipo: 'info', titulo: 'Cliente removido' });
                                                }
                                            }}
                                            className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 size={15} />
                                        </button>
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
// Aba: Fidelidade
// =============================================
function AbaFidelidade() {
    const { clientes, estatisticasCRM, adicionarPontos } = useCRMStore();
    const { adicionarToast } = useAppStore();
    const stats = estatisticasCRM();

    const distribuicaoNiveis = niveisFidelidade.map((nivel) => ({
        ...nivel,
        quantidade: clientes.filter((c) => {
            const n = getNivelFidelidade(c.pontos_fidelidade);
            return n.nome === nivel.nome;
        }).length,
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <CardCRM titulo="Clientes no Programa" valor={stats.comPontos} icone={Heart} cor="from-pink-500 to-rose-700" subtitulo={`${stats.ativos} ativos`} />
                <CardCRM titulo="Total de Pontos" valor={stats.totalPontos.toLocaleString('pt-BR')} icone={Star} cor="from-amber-500 to-yellow-700" />
                <CardCRM titulo="Ticket Médio" valor={formatarMoeda(stats.ticketMedio)} icone={ShoppingBag} cor="from-brand-500 to-brand-700" subtitulo="R$ 1 = 1 ponto" />
                <CardCRM titulo="Taxa de Retenção" valor="87%" icone={TrendingUp} cor="from-cyan-500 to-blue-700" subtitulo="vs 82% mês anterior" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pirâmide de Níveis */}
                <div className="bg-surface-800/60 rounded-2xl border border-surface-700/50 p-5">
                    <h3 className="text-sm font-bold text-surface-200 mb-4 flex items-center gap-2">
                        <Crown size={14} className="text-amber-400" /> Distribuição por Nível
                    </h3>
                    <div className="space-y-3">
                        {distribuicaoNiveis.reverse().map((nivel) => {
                            const pct = stats.total > 0 ? Math.round((nivel.quantidade / stats.total) * 100) : 0;
                            return (
                                <div key={nivel.nome} className="flex items-center gap-3">
                                    <span className="text-lg">{nivel.emoji}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-surface-200">{nivel.nome}</span>
                                            <span className="text-xs text-surface-400">{nivel.quantidade} clientes ({pct}%)</span>
                                        </div>
                                        <div className="h-2 bg-surface-700/50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: nivel.cor }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-surface-500 mt-0.5">{nivel.beneficio}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Clientes */}
                <div className="bg-surface-800/60 rounded-2xl border border-surface-700/50 p-5">
                    <h3 className="text-sm font-bold text-surface-200 mb-4 flex items-center gap-2">
                        <Award size={14} className="text-cyan-400" /> Rankings — Top 5 Clientes
                    </h3>
                    <div className="space-y-2">
                        {stats.topClientes.map((c, i) => {
                            const nivel = getNivelFidelidade(c.pontos_fidelidade);
                            return (
                                <div key={c.id} className="flex items-center gap-3 py-2.5 border-b border-surface-700/20 last:border-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-surface-400/20 text-surface-300' : i === 2 ? 'bg-amber-700/20 text-amber-600' : 'bg-surface-700/50 text-surface-400'}`}>
                                        {i + 1}º
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-surface-200 truncate">{c.nome}</p>
                                        <p className="text-xs text-surface-500">{nivel.emoji} {nivel.nome}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-amber-400">{c.pontos_fidelidade.toLocaleString('pt-BR')}</p>
                                        <p className="text-[10px] text-surface-500">pontos</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            adicionarPontos(c.id, 50);
                                            adicionarToast({ tipo: 'sucesso', titulo: '+50 pontos!', mensagem: `Pontos adicionados para ${c.nome}` });
                                        }}
                                        className="p-1.5 rounded-lg text-amber-400/60 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                                        title="Adicionar pontos"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Regras do programa */}
            <div className="bg-surface-800/60 rounded-2xl border border-surface-700/50 p-5">
                <h3 className="text-sm font-bold text-surface-200 mb-3 flex items-center gap-2">
                    <Gift size={14} className="text-green-400" /> Regras do Programa de Fidelidade
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { titulo: 'Acúmulo', desc: 'R$ 1,00 = 1 ponto em todas as compras', icone: '💰' },
                        { titulo: 'Aniversário', desc: 'Pontos em dobro no mês de aniversário', icone: '🎂' },
                        { titulo: 'Resgate', desc: '100 pontos = R$ 1,00 de desconto', icone: '🎁' },
                        { titulo: 'Validade', desc: 'Pontos expiram em 12 meses sem compra', icone: '⏰' },
                    ].map((r) => (
                        <div key={r.titulo} className="bg-surface-700/30 rounded-xl p-3">
                            <span className="text-lg">{r.icone}</span>
                            <p className="text-xs font-semibold text-surface-200 mt-1">{r.titulo}</p>
                            <p className="text-[10px] text-surface-400 mt-0.5">{r.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// =============================================
// Aba: Promoções
// =============================================
function AbaPromocoes() {
    const store = useCRMStore();
    const { adicionarToast } = useAppStore();
    const promocoes = store.promocoesFiltradas();

    const hoje = new Date().toISOString().split('T')[0];

    const tipoLabel = (t: Promocao['tipo']) => {
        if (t === 'percentual') return '% Desconto';
        if (t === 'valor_fixo') return 'R$ Fixo';
        return 'Quantidade';
    };

    const tipoCor = (t: Promocao['tipo']) => {
        if (t === 'percentual') return 'text-cyan-400 bg-cyan-500/10';
        if (t === 'valor_fixo') return 'text-green-400 bg-green-500/10';
        return 'text-purple-400 bg-purple-500/10';
    };

    return (
        <div className="space-y-4 animate-fade-in">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-2 items-center flex-1 w-full sm:w-auto">
                    <div className="relative flex-1 sm:max-w-xs">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                        <input
                            type="text"
                            value={store.buscaPromocao}
                            onChange={(e) => store.setBuscaPromocao(e.target.value)}
                            placeholder="Buscar promoção..."
                            className="w-full bg-surface-800/50 border border-surface-700 rounded-xl pl-9 pr-3 py-2 text-sm text-surface-200 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
                        <select
                            value={store.filtroPromocao}
                            onChange={(e) => store.setFiltroPromocao(e.target.value as 'todos' | 'ativas' | 'inativas')}
                            className="bg-surface-800/50 border border-surface-700 rounded-xl pl-8 pr-8 py-2 text-sm text-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 appearance-none cursor-pointer"
                        >
                            <option value="todos">Todas</option>
                            <option value="ativas">Ativas</option>
                            <option value="inativas">Inativas</option>
                        </select>
                    </div>
                </div>
                <button
                    onClick={() => { store.setPromocaoEditando(null); store.setModalPromocao(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all"
                >
                    <Plus size={16} /> Nova Promoção
                </button>
            </div>

            {/* Grid de promoções */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {promocoes.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-surface-500">Nenhuma promoção encontrada</div>
                ) : (
                    promocoes.map((promo) => {
                        const vigente = promo.ativo && promo.data_inicio <= hoje && promo.data_fim >= hoje;
                        return (
                            <div
                                key={promo.id}
                                className={`bg-surface-800/60 rounded-2xl border overflow-hidden transition-all ${vigente ? 'border-green-500/30 shadow-lg shadow-green-500/5' : 'border-surface-700/50'}`}
                            >
                                {/* Status bar */}
                                <div className={`h-1 ${vigente ? 'bg-gradient-to-r from-green-500 to-emerald-400' : promo.ativo ? 'bg-amber-500' : 'bg-surface-600'}`} />
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-surface-100 truncate">{promo.nome}</h4>
                                            <p className="text-xs text-surface-400 mt-0.5 line-clamp-2">{promo.descricao}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                store.togglePromocao(promo.id);
                                                adicionarToast({ tipo: 'info', titulo: `Promoção ${promo.ativo ? 'desativada' : 'ativada'}` });
                                            }}
                                            className="ml-3"
                                            title={promo.ativo ? 'Desativar' : 'Ativar'}
                                        >
                                            {promo.ativo
                                                ? <ToggleRight size={24} className="text-green-400" />
                                                : <ToggleLeft size={24} className="text-surface-500" />
                                            }
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tipoCor(promo.tipo)}`}>
                                            {tipoLabel(promo.tipo)}
                                        </span>
                                        <span className="text-sm font-bold text-surface-100">
                                            {promo.tipo === 'percentual' ? `${promo.valor_desconto}%` : promo.tipo === 'valor_fixo' ? formatarMoeda(promo.valor_desconto || 0) : `${promo.quantidade_minima}x`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-surface-400 mb-3">
                                        <Calendar size={12} />
                                        {formatarData(promo.data_inicio)} → {formatarData(promo.data_fim)}
                                    </div>
                                    {promo.quantidade_minima > 1 && (
                                        <p className="text-[10px] text-surface-500 mb-3">
                                            Quantidade mínima: {promo.quantidade_minima} itens
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between pt-3 border-t border-surface-700/30">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${vigente ? 'text-green-400 bg-green-500/10' : promo.ativo ? 'text-amber-400 bg-amber-500/10' : 'text-surface-500 bg-surface-700/50'}`}>
                                            {vigente ? '● Em vigor' : promo.ativo ? '◐ Agendada' : '○ Inativa'}
                                        </span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => { store.setPromocaoEditando(promo); store.setModalPromocao(true); }}
                                                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Remover esta promoção?')) {
                                                        store.removerPromocao(promo.id);
                                                        adicionarToast({ tipo: 'info', titulo: 'Promoção removida' });
                                                    }
                                                }}
                                                className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
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
// Aba: Tabelas de Preço
// =============================================
function AbaTabelasPreco() {
    const store = useCRMStore();
    const { adicionarToast } = useAppStore();

    const tipoCor = (t: TabelaPreco['tipo']) => {
        if (t === 'varejo') return 'from-blue-500 to-indigo-700';
        if (t === 'atacado') return 'from-orange-500 to-red-700';
        if (t === 'fidelidade') return 'from-pink-500 to-rose-700';
        return 'from-purple-500 to-violet-700';
    };

    const tipoEmoji = (t: TabelaPreco['tipo']) => {
        if (t === 'varejo') return '🏪';
        if (t === 'atacado') return '📦';
        if (t === 'fidelidade') return '💎';
        return '🎯';
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
                <p className="text-sm text-surface-400">Gerencie tabelas de preço diferenciadas para cada perfil de cliente</p>
                <button
                    onClick={() => { store.setTabelaEditando(null); store.setModalTabela(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all"
                >
                    <Plus size={16} /> Nova Tabela
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {store.tabelasPreco.map((tabela) => (
                    <div key={tabela.id} className="bg-surface-800/60 rounded-2xl border border-surface-700/50 overflow-hidden hover:border-surface-600 transition-all group">
                        <div className={`h-1.5 bg-gradient-to-r ${tipoCor(tabela.tipo)}`} />
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{tipoEmoji(tabela.tipo)}</span>
                                    <div>
                                        <h4 className="text-sm font-bold text-surface-100">{tabela.nome}</h4>
                                        <p className="text-xs text-surface-400 mt-0.5">{tabela.descricao}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tabela.ativo ? 'text-green-400 bg-green-500/10' : 'text-surface-500 bg-surface-700/50'}`}>
                                    {tabela.ativo ? 'Ativa' : 'Inativa'}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="bg-surface-700/30 rounded-xl p-3 text-center">
                                    <p className="text-lg font-bold text-surface-100">{tabela.tipo.charAt(0).toUpperCase() + tabela.tipo.slice(1)}</p>
                                    <p className="text-[10px] text-surface-500">Tipo</p>
                                </div>
                                <div className="bg-surface-700/30 rounded-xl p-3 text-center">
                                    <p className="text-lg font-bold text-brand-400">{tabela.margem_padrao}%</p>
                                    <p className="text-[10px] text-surface-500">Margem</p>
                                </div>
                                <div className="bg-surface-700/30 rounded-xl p-3 text-center">
                                    <p className="text-lg font-bold text-surface-100">{formatarData(tabela.updated_at)}</p>
                                    <p className="text-[10px] text-surface-500">Atualizada</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-surface-700/30">
                                <button className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors">
                                    Ver produtos <ChevronRight size={14} />
                                </button>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => { store.setTabelaEditando(tabela); store.setModalTabela(true); }}
                                        className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors"
                                        title="Editar"
                                    >
                                        <Edit3 size={14} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Remover esta tabela de preço?')) {
                                                store.removerTabela(tabela.id);
                                                adicionarToast({ tipo: 'info', titulo: 'Tabela removida' });
                                            }
                                        }}
                                        className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// =============================================
// Modal: Novo Cliente
// =============================================
function ModalCliente() {
    const store = useCRMStore();
    const { adicionarToast } = useAppStore();
    const editando = store.clienteSelecionado;

    const [nome, setNome] = useState(editando?.nome || '');
    const [cpf, setCpf] = useState(editando?.cpf_cnpj || '');
    const [telefone, setTelefone] = useState(editando?.telefone || '');
    const [email, setEmail] = useState(editando?.email || '');
    const [cidade, setCidade] = useState(editando?.cidade || '');
    const [estado, setEstado] = useState(editando?.estado || '');
    const [limite, setLimite] = useState(editando?.limite_credito?.toString() || '0');

    const inputClass = "w-full bg-surface-700/50 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all";

    const handleSalvar = () => {
        if (!nome.trim()) {
            adicionarToast({ tipo: 'erro', titulo: 'Nome é obrigatório' });
            return;
        }
        const agora = new Date().toISOString().split('T')[0];

        if (editando) {
            store.atualizarCliente(editando.id, {
                nome: nome.trim(), cpf_cnpj: cpf || undefined, telefone: telefone || undefined,
                email: email || undefined, cidade: cidade || undefined, estado: estado || undefined,
                limite_credito: parseFloat(limite) || 0, updated_at: agora,
            });
            adicionarToast({ tipo: 'sucesso', titulo: 'Cliente atualizado' });
        } else {
            store.adicionarCliente({
                id: crypto.randomUUID(), nome: nome.trim(), cpf_cnpj: cpf || undefined,
                telefone: telefone || undefined, email: email || undefined, cidade: cidade || undefined,
                estado: estado || undefined, limite_credito: parseFloat(limite) || 0, saldo_credito: 0,
                pontos_fidelidade: 0, ativo: true, created_at: agora, updated_at: agora, cep: undefined,
                endereco: undefined, data_nascimento: undefined, observacoes: undefined,
            });
            adicionarToast({ tipo: 'sucesso', titulo: 'Cliente cadastrado' });
        }
        store.setModalCliente(false);
    };

    return (
        <Modal aberto={store.modalCliente} onFechar={() => store.setModalCliente(false)} titulo={editando ? 'Editar Cliente' : 'Novo Cliente'} tamanho="md">
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-surface-400">Nome *</label>
                    <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" className={inputClass} autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-surface-400">CPF/CNPJ</label>
                        <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-surface-400">Telefone</label>
                        <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" className={inputClass} />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-surface-400">E-mail</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" className={inputClass} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-surface-400">Cidade</label>
                        <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-surface-400">Estado</label>
                        <input type="text" value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="UF" className={inputClass} maxLength={2} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-surface-400">Limite (R$)</label>
                        <input type="number" step="0.01" value={limite} onChange={(e) => setLimite(e.target.value)} className={inputClass} />
                    </div>
                </div>
                <button
                    onClick={handleSalvar}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all mt-2"
                >
                    <CheckCircle size={16} /> {editando ? 'Atualizar' : 'Cadastrar'}
                </button>
            </div>
        </Modal>
    );
}

// =============================================
// Modal: Nova Promoção
// =============================================
function ModalPromocao() {
    const store = useCRMStore();
    const { adicionarToast } = useAppStore();
    const editando = store.promocaoEditando;

    const [nome, setNome] = useState(editando?.nome || '');
    const [descricao, setDescricao] = useState(editando?.descricao || '');
    const [tipo, setTipo] = useState<Promocao['tipo']>(editando?.tipo || 'percentual');
    const [valorDesconto, setValorDesconto] = useState(editando?.valor_desconto?.toString() || '');
    const [qtdMinima, setQtdMinima] = useState(editando?.quantidade_minima?.toString() || '1');
    const [dataInicio, setDataInicio] = useState(editando?.data_inicio || '');
    const [dataFim, setDataFim] = useState(editando?.data_fim || '');

    const inputClass = "w-full bg-surface-700/50 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all";

    const handleSalvar = () => {
        if (!nome.trim() || !valorDesconto || !dataInicio || !dataFim) {
            adicionarToast({ tipo: 'erro', titulo: 'Preencha os campos obrigatórios' });
            return;
        }
        const agora = new Date().toISOString().split('T')[0];

        if (editando) {
            store.atualizarPromocao(editando.id, {
                nome: nome.trim(), descricao: descricao.trim(), tipo, valor_desconto: parseFloat(valorDesconto),
                quantidade_minima: parseInt(qtdMinima) || 1, data_inicio: dataInicio, data_fim: dataFim, updated_at: agora,
            });
            adicionarToast({ tipo: 'sucesso', titulo: 'Promoção atualizada' });
        } else {
            store.adicionarPromocao({
                id: crypto.randomUUID(), nome: nome.trim(), descricao: descricao.trim(), tipo,
                valor_desconto: parseFloat(valorDesconto), quantidade_minima: parseInt(qtdMinima) || 1,
                data_inicio: dataInicio, data_fim: dataFim, ativo: true, created_at: agora, updated_at: agora,
            });
            adicionarToast({ tipo: 'sucesso', titulo: 'Promoção criada' });
        }
        store.setModalPromocao(false);
    };

    return (
        <Modal aberto={store.modalPromocao} onFechar={() => store.setModalPromocao(false)} titulo={editando ? 'Editar Promoção' : 'Nova Promoção'} tamanho="md">
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-surface-400">Nome *</label>
                    <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da promoção" className={inputClass} autoFocus />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-surface-400">Descrição</label>
                    <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição da promoção" className={inputClass} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-surface-400">Tipo *</label>
                        <select value={tipo} onChange={(e) => setTipo(e.target.value as Promocao['tipo'])} className={inputClass}>
                            <option value="percentual">% Percentual</option>
                            <option value="valor_fixo">R$ Valor Fixo</option>
                            <option value="quantidade">Quantidade</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-surface-400">{tipo === 'percentual' ? 'Desconto (%)' : tipo === 'valor_fixo' ? 'Desconto (R$)' : 'Desconto (%)'} *</label>
                        <input type="number" step="0.01" value={valorDesconto} onChange={(e) => setValorDesconto(e.target.value)} placeholder="0" className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-surface-400">Qtd Mínima</label>
                        <input type="number" min="1" value={qtdMinima} onChange={(e) => setQtdMinima(e.target.value)} className={inputClass} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-surface-400">Início *</label>
                        <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-surface-400">Fim *</label>
                        <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className={inputClass} />
                    </div>
                </div>
                <button
                    onClick={handleSalvar}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all mt-2"
                >
                    <CheckCircle size={16} /> {editando ? 'Atualizar' : 'Criar Promoção'}
                </button>
            </div>
        </Modal>
    );
}

// =============================================
// Modal: Nova Tabela de Preço
// =============================================
function ModalTabela() {
    const store = useCRMStore();
    const { adicionarToast } = useAppStore();
    const editando = store.tabelaEditando;

    const [nome, setNome] = useState(editando?.nome || '');
    const [tipo, setTipo] = useState<TabelaPreco['tipo']>(editando?.tipo || 'varejo');
    const [descricao, setDescricao] = useState(editando?.descricao || '');
    const [margem, setMargem] = useState(editando?.margem_padrao?.toString() || '50');

    const inputClass = "w-full bg-surface-700/50 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all";

    const handleSalvar = () => {
        if (!nome.trim()) {
            adicionarToast({ tipo: 'erro', titulo: 'Nome é obrigatório' });
            return;
        }
        const agora = new Date().toISOString().split('T')[0];

        if (editando) {
            store.atualizarTabela(editando.id, {
                nome: nome.trim(), tipo, descricao: descricao.trim(), margem_padrao: parseFloat(margem) || 0, updated_at: agora,
            });
            adicionarToast({ tipo: 'sucesso', titulo: 'Tabela atualizada' });
        } else {
            store.adicionarTabela({
                id: crypto.randomUUID(), nome: nome.trim(), tipo, descricao: descricao.trim(),
                margem_padrao: parseFloat(margem) || 0, ativo: true, created_at: agora, updated_at: agora,
            });
            adicionarToast({ tipo: 'sucesso', titulo: 'Tabela criada' });
        }
        store.setModalTabela(false);
    };

    return (
        <Modal aberto={store.modalTabela} onFechar={() => store.setModalTabela(false)} titulo={editando ? 'Editar Tabela de Preço' : 'Nova Tabela de Preço'} tamanho="md">
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-surface-400">Nome *</label>
                    <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Atacado Restaurantes" className={inputClass} autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-surface-400">Tipo</label>
                        <select value={tipo} onChange={(e) => setTipo(e.target.value as TabelaPreco['tipo'])} className={inputClass}>
                            <option value="varejo">🏪 Varejo</option>
                            <option value="atacado">📦 Atacado</option>
                            <option value="fidelidade">💎 Fidelidade</option>
                            <option value="personalizada">🎯 Personalizada</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-surface-400">Margem Padrão (%)</label>
                        <input type="number" step="1" value={margem} onChange={(e) => setMargem(e.target.value)} className={inputClass} />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-surface-400">Descrição</label>
                    <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição da tabela" className={inputClass} />
                </div>
                <button
                    onClick={handleSalvar}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all mt-2"
                >
                    <CheckCircle size={16} /> {editando ? 'Atualizar' : 'Criar Tabela'}
                </button>
            </div>
        </Modal>
    );
}

// =============================================
// Página Principal: CRM & Precificação
// =============================================
const abas = [
    { id: 'clientes' as const, label: 'Clientes', icone: Users },
    { id: 'fidelidade' as const, label: 'Fidelidade', icone: Heart },
    { id: 'promocoes' as const, label: 'Promoções', icone: Tag },
    { id: 'tabelas' as const, label: 'Tabelas de Preço', icone: Layers },
];

export default function CRM() {
    const { abaAtiva, setAbaAtiva } = useCRMStore();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-surface-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-700 flex items-center justify-center shadow-lg shadow-pink-600/25">
                            <Users size={22} className="text-white" />
                        </div>
                        CRM & Precificação
                    </h1>
                    <p className="text-sm text-surface-500 mt-1 ml-[52px]">
                        Gestão de clientes, fidelidade, promoções e tabelas de preço
                    </p>
                </div>
            </div>

            {/* Abas */}
            <div className="flex gap-1 bg-surface-800/60 rounded-2xl p-1.5 border border-surface-700/50 overflow-x-auto">
                {abas.map((aba) => (
                    <button
                        key={aba.id}
                        onClick={() => setAbaAtiva(aba.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${abaAtiva === aba.id
                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                            : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700/50'
                            }`}
                    >
                        <aba.icone size={15} />
                        <span className="hidden sm:inline">{aba.label}</span>
                    </button>
                ))}
            </div>

            {/* Conteúdo da aba */}
            {abaAtiva === 'clientes' && <AbaClientes />}
            {abaAtiva === 'fidelidade' && <AbaFidelidade />}
            {abaAtiva === 'promocoes' && <AbaPromocoes />}
            {abaAtiva === 'tabelas' && <AbaTabelasPreco />}

            {/* Modais */}
            <ModalCliente />
            <ModalPromocao />
            <ModalTabela />
        </div>
    );
}
