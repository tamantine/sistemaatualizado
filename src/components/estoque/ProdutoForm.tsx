// =============================================
// Componente: ProdutoForm — Formulário de produto
// =============================================
import { useState, useEffect } from 'react';
import type { Produto, Categoria } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { Save, X } from 'lucide-react';

interface ProdutoFormProps {
    produto?: Produto | null;
    categorias: Categoria[];
    onSalvar: (dados: Partial<Produto>) => void;
    onCancelar: () => void;
}

// Componente Campo movido para fora para evitar perda de foco durante a digitação
const Campo = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
        <label className="text-sm font-medium text-surface-300">{label}</label>
        {children}
    </div>
);

// Tipos para o formulário
interface FormData {
    nome: string;
    codigo: string;
    codigo_barras: string;
    categoria_id: string;
    unidade: Produto['unidade'];
    preco_custo: number;
    preco_venda: number;
    estoque_atual: number;
    estoque_minimo: number;
    data_validade: string;
    lote: string;
    localizacao: string;
}

// Função para gerar estado inicial
function getInitialForm(produto: Produto | null | undefined): FormData {
    if (produto) {
        return {
            nome: produto.nome,
            codigo: produto.codigo || '',
            codigo_barras: produto.codigo_barras || '',
            categoria_id: produto.categoria_id || '',
            unidade: produto.unidade,
            preco_custo: produto.preco_custo,
            preco_venda: produto.preco_venda,
            estoque_atual: produto.estoque_atual,
            estoque_minimo: produto.estoque_minimo,
            data_validade: produto.data_validade || '',
            lote: produto.lote || '',
            localizacao: produto.localizacao || '',
        };
    }
    return {
        nome: '',
        codigo: '',
        codigo_barras: '',
        categoria_id: '',
        unidade: 'KG',
        preco_custo: 0,
        preco_venda: 0,
        estoque_atual: 0,
        estoque_minimo: 0,
        data_validade: '',
        lote: '',
        localizacao: '',
    };
}

export default function ProdutoForm({ produto, categorias, onSalvar, onCancelar }: ProdutoFormProps) {
    const { adicionarToast } = useAppStore();
    const [form, setForm] = useState<FormData>(() => getInitialForm(produto));

    // Atualiza o formulário quando o produto mudar (para modo edição)
    useEffect(() => {
        setForm(getInitialForm(produto));
    }, [produto?.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validação básica
        if (!form.nome.trim()) {
            adicionarToast({ tipo: 'erro', titulo: 'Nome é obrigatório' });
            return;
        }
        if (form.preco_venda <= 0) {
            adicionarToast({ tipo: 'erro', titulo: 'Preço de venda deve ser maior que zero' });
            return;
        }
        onSalvar(form);
    };

    const handleChange = (campo: keyof FormData, valor: string | number) => {
        setForm((prev) => ({ ...prev, [campo]: valor }));
    };



    const inputClass = "w-full bg-surface-700/50 border border-surface-600 rounded-xl px-3 py-2.5 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all";

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Linha 1: Nome e Código */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Campo label="Nome do Produto *">
                    <input
                        type="text"
                        value={form.nome}
                        onChange={(e) => handleChange('nome', e.target.value)}
                        placeholder="Ex: Banana Prata"
                        className={inputClass}
                    />
                </Campo>
                <Campo label="Código">
                    <input
                        type="text"
                        value={form.codigo}
                        onChange={(e) => handleChange('codigo', e.target.value)}
                        placeholder="Ex: FRT001"
                        className={inputClass}
                    />
                </Campo>
            </div>

            {/* Linha 2: Código de Barras e Categoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Campo label="Código de Barras">
                    <input
                        type="text"
                        value={form.codigo_barras}
                        onChange={(e) => handleChange('codigo_barras', e.target.value)}
                        placeholder="Ex: 7891234560001"
                        className={inputClass}
                    />
                </Campo>
                <Campo label="Categoria">
                    <select
                        value={form.categoria_id}
                        onChange={(e) => handleChange('categoria_id', e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Selecione...</option>
                        {categorias.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.nome}</option>
                        ))}
                    </select>
                </Campo>
            </div>

            {/* Linha 3: Unidade, Preço Custo, Preço Venda */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Campo label="Unidade *">
                    <select
                        value={form.unidade}
                        onChange={(e) => handleChange('unidade', e.target.value)}
                        className={inputClass}
                    >
                        <option value="KG">KG (Quilograma)</option>
                        <option value="UN">UN (Unidade)</option>
                        <option value="CX">CX (Caixa)</option>
                        <option value="PCT">PCT (Pacote)</option>
                        <option value="DZ">DZ (Dúzia)</option>
                        <option value="L">L (Litro)</option>
                    </select>
                </Campo>
                <Campo label="Preço de Custo (R$)">
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.preco_custo}
                        onChange={(e) => handleChange('preco_custo', parseFloat(e.target.value) || 0)}
                        className={inputClass}
                    />
                </Campo>
                <Campo label="Preço de Venda (R$) *">
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.preco_venda}
                        onChange={(e) => handleChange('preco_venda', parseFloat(e.target.value) || 0)}
                        className={inputClass}
                    />
                </Campo>
            </div>

            {/* Margem de lucro calculada */}
            {form.preco_custo > 0 && form.preco_venda > 0 && (
                <div className="bg-brand-600/10 border border-brand-600/20 rounded-xl px-4 py-2 text-sm">
                    <span className="text-surface-400">Margem de lucro: </span>
                    <span className="text-brand-400 font-bold">
                        {(((form.preco_venda - form.preco_custo) / form.preco_custo) * 100).toFixed(1)}%
                    </span>
                </div>
            )}

            {/* Linha 4: Estoque */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Campo label="Estoque Atual">
                    <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={form.estoque_atual}
                        onChange={(e) => handleChange('estoque_atual', parseFloat(e.target.value) || 0)}
                        className={inputClass}
                    />
                </Campo>
                <Campo label="Estoque Mínimo">
                    <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={form.estoque_minimo}
                        onChange={(e) => handleChange('estoque_minimo', parseFloat(e.target.value) || 0)}
                        className={inputClass}
                    />
                </Campo>
            </div>

            {/* Linha 5: Validade e Lote */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Campo label="Data de Validade">
                    <input
                        type="date"
                        value={form.data_validade}
                        onChange={(e) => handleChange('data_validade', e.target.value)}
                        className={inputClass}
                    />
                </Campo>
                <Campo label="Lote">
                    <input
                        type="text"
                        value={form.lote}
                        onChange={(e) => handleChange('lote', e.target.value)}
                        placeholder="Ex: L2026-001"
                        className={inputClass}
                    />
                </Campo>
                <Campo label="Localização">
                    <input
                        type="text"
                        value={form.localizacao}
                        onChange={(e) => handleChange('localizacao', e.target.value)}
                        placeholder="Ex: Setor A - Prateleira 3"
                        className={inputClass}
                    />
                </Campo>
            </div>

            {/* Botões */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-700">
                <button
                    type="button"
                    onClick={onCancelar}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors"
                >
                    <X size={16} /> Cancelar
                </button>
                <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all"
                >
                    <Save size={16} /> {produto ? 'Atualizar' : 'Cadastrar'}
                </button>
            </div>
        </form>
    );
}
