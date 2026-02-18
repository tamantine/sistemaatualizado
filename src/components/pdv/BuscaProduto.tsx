// =============================================
// Componente: BuscaProduto
// Barra de busca + grid de produtos do PDV
// =============================================
import { useRef, useEffect } from 'react';
import { usePDVStore } from '../../store/usePDVStore';
import { useAppStore } from '../../store/useAppStore';
import { Search, Barcode, Tag } from 'lucide-react';
import { formatarMoeda } from '../../utils/formatters';
import { categoriasMock } from '../../services/mockData';

export default function BuscaProduto() {
    const { buscaProduto, setBuscaProduto, adicionarItem, produtosFiltrados } = usePDVStore();
    const { adicionarToast } = useAppStore();
    const inputRef = useRef<HTMLInputElement>(null);
    const produtos = produtosFiltrados();

    // Foca no campo de busca ao montar e ao pressionar F2
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                inputRef.current?.focus();
                inputRef.current?.select();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Ao pressionar Enter, adiciona o primeiro produto da lista
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && produtos.length > 0) {
            e.preventDefault();
            adicionarItem(produtos[0]);
            adicionarToast({ tipo: 'sucesso', titulo: `${produtos[0].nome} adicionado` });
            setBuscaProduto('');
            inputRef.current?.focus();
        }
    };

    // Adicionar produto com clique
    const handleClickProduto = (produto: typeof produtos[0]) => {
        adicionarItem(produto);
        adicionarToast({ tipo: 'sucesso', titulo: `${produto.nome} adicionado` });
        setBuscaProduto('');
        inputRef.current?.focus();
    };

    // Busca nome da categoria
    const nomeCategoria = (catId?: string) =>
        categoriasMock.find((c) => c.id === catId)?.nome || '';

    return (
        <div className="flex flex-col h-full">
            {/* Barra de busca */}
            <div className="relative mb-3">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500" />
                <input
                    ref={inputRef}
                    type="text"
                    value={buscaProduto}
                    onChange={(e) => setBuscaProduto(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Buscar produto por nome, código ou barras... (F2)"
                    className="w-full bg-surface-800 border border-surface-600 rounded-xl pl-11 pr-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                    autoFocus
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-surface-500">
                    <Barcode size={16} />
                </div>
            </div>

            {/* Grid de produtos */}
            <div className="flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {produtos.slice(0, 20).map((produto) => {
                        const emPromo = produto.em_promocao && produto.preco_promocional;
                        return (
                            <button
                                key={produto.id}
                                onClick={() => handleClickProduto(produto)}
                                className="group text-left p-3 rounded-xl bg-surface-800/50 border border-surface-700/50 hover:border-brand-500/40 hover:bg-surface-800 transition-all duration-200 hover:shadow-lg hover:shadow-brand-600/5"
                            >
                                {/* Tags */}
                                <div className="flex items-center gap-1.5 mb-2">
                                    <span className="text-[10px] font-bold bg-surface-700 text-surface-400 px-1.5 py-0.5 rounded">
                                        {produto.unidade}
                                    </span>
                                    {emPromo && (
                                        <span className="text-[10px] font-bold bg-accent-600/20 text-accent-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                            <Tag size={8} /> OFERTA
                                        </span>
                                    )}
                                </div>

                                {/* Nome */}
                                <p className="text-sm font-semibold text-surface-200 group-hover:text-brand-400 transition-colors leading-tight mb-1 truncate">
                                    {produto.nome}
                                </p>

                                {/* Categoria */}
                                <p className="text-[10px] text-surface-500 mb-2 truncate">
                                    {nomeCategoria(produto.categoria_id)}
                                </p>

                                {/* Preço */}
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-base font-bold ${emPromo ? 'text-accent-400' : 'text-brand-400'}`}>
                                        {formatarMoeda(emPromo ? produto.preco_promocional! : produto.preco_venda)}
                                    </span>
                                    {emPromo && (
                                        <span className="text-xs text-surface-500 line-through">
                                            {formatarMoeda(produto.preco_venda)}
                                        </span>
                                    )}
                                </div>

                                {/* Estoque */}
                                <p className={`text-[10px] mt-1.5 ${produto.estoque_atual <= produto.estoque_minimo ? 'text-red-400' : 'text-surface-500'}`}>
                                    Estoque: {produto.estoque_atual} {produto.unidade.toLowerCase()}
                                </p>
                            </button>
                        );
                    })}
                </div>

                {produtos.length === 0 && buscaProduto && (
                    <div className="flex flex-col items-center justify-center py-12 text-surface-500">
                        <Search size={32} className="mb-3 opacity-30" />
                        <p className="text-sm">Nenhum produto encontrado</p>
                        <p className="text-xs mt-1">Tente buscar por outro nome ou código</p>
                    </div>
                )}
            </div>
        </div>
    );
}
