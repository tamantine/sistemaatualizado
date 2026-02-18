// =============================================
// Componente: ModalAberturaCaixa
// Tela para inserir valor de abertura e operador
// =============================================
import { useState } from 'react';
import { usePDVStore } from '../../store/usePDVStore';
import { useAppStore } from '../../store/useAppStore';
import { DollarSign, User, LogIn } from 'lucide-react';

export default function ModalAberturaCaixa() {
    const { abrirCaixa } = usePDVStore();
    const { adicionarToast } = useAppStore();
    const [valorAbertura, setValorAbertura] = useState('200.00');
    const [operador, setOperador] = useState('');

    const handleAbrir = () => {
        if (!operador.trim()) {
            adicionarToast({ tipo: 'erro', titulo: 'Informe o nome do operador' });
            return;
        }
        const valor = parseFloat(valorAbertura) || 0;
        abrirCaixa(valor, operador.trim());
        adicionarToast({ tipo: 'sucesso', titulo: 'Caixa aberto com sucesso', mensagem: `Operador: ${operador}` });
    };

    const inputClass = "w-full bg-surface-700/50 border border-surface-600 rounded-xl px-4 py-3 text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all";

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-full max-w-md glass rounded-3xl p-8 animate-fade-in">
                {/* Ícone */}
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mb-6 shadow-lg shadow-brand-600/30">
                    <DollarSign size={36} className="text-white" />
                </div>

                <h2 className="text-2xl font-bold text-center text-surface-100 mb-1">Abertura de Caixa</h2>
                <p className="text-sm text-surface-400 text-center mb-8">Informe os dados para iniciar as operações</p>

                <div className="space-y-5">
                    {/* Operador */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-surface-300 flex items-center gap-2">
                            <User size={14} /> Operador
                        </label>
                        <input
                            type="text"
                            value={operador}
                            onChange={(e) => setOperador(e.target.value)}
                            placeholder="Nome do operador"
                            className={inputClass}
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleAbrir()}
                        />
                    </div>

                    {/* Valor de abertura */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-surface-300 flex items-center gap-2">
                            <DollarSign size={14} /> Valor de Abertura (R$)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={valorAbertura}
                            onChange={(e) => setValorAbertura(e.target.value)}
                            placeholder="0,00"
                            className={inputClass}
                            onKeyDown={(e) => e.key === 'Enter' && handleAbrir()}
                        />
                    </div>

                    {/* Botão */}
                    <button
                        onClick={handleAbrir}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-bold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-600/25 transition-all mt-2"
                    >
                        <LogIn size={20} /> Abrir Caixa
                    </button>
                </div>

                {/* Atalho */}
                <p className="text-xs text-surface-500 text-center mt-6">
                    Pressione <kbd className="px-1.5 py-0.5 bg-surface-700 rounded text-surface-300 font-mono">Enter</kbd> para confirmar
                </p>
            </div>
        </div>
    );
}
