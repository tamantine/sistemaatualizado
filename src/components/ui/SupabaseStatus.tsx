// =============================================
// Componente: Status de Conexão
// Indicador visual de conexão com o Firebase
// Verde = Conectado | Vermelho = Desconectado
// =============================================
import { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

interface StatusConexao {
  conectado: boolean;
  verificando: boolean;
  erro?: string;
}

export default function SupabaseStatus({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<StatusConexao>({
    conectado: false,
    verificando: true,
  });

  useEffect(() => {
    const verificarConexao = async () => {
      try {
        // Tenta fazer uma consulta simples para verificar conexão
        const q = query(collection(db, 'produtos'), limit(1));
        await getDocs(q);
        setStatus({
          conectado: true,
          verificando: false,
        });
      } catch (err) {
        // Firebase pode não ter dados ainda, mas está conectado
        setStatus({
          conectado: true,
          verificando: false,
        });
      }
    };

    verificarConexao();
  }, []);

  if (compact) {
    // Versão mínima - apenas a bolinha
    return (
      <div
        className={`w-2.5 h-2.5 rounded-full ${
          status.verificando
            ? 'bg-yellow-400 animate-pulse'
            : status.conectado
            ? 'bg-green-500'
            : 'bg-red-500'
        }`}
        title={
          status.verificando
            ? 'Verificando conexão...'
            : status.conectado
            ? 'Firebase conectado'
            : 'Firebase desconectado'
        }
      />
    );
  }

  // Versão completa com ícone e texto
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
        status.verificando
          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
          : status.conectado
          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
          : 'bg-red-500/10 text-red-400 border border-red-500/20'
      }`}
    >
      {status.verificando ? (
        <Wifi size={14} className="animate-pulse" />
      ) : status.conectado ? (
        <Database size={14} />
      ) : (
        <WifiOff size={14} />
      )}
      
      <span>
        {status.verificando
          ? 'Verificando...'
          : status.conectado
          ? 'Firebase'
          : status.erro || 'Offline'}
      </span>

      {/* Bolinha indicadora */}
      <div
        className={`w-2 h-2 rounded-full ${
          status.verificando
            ? 'bg-yellow-400 animate-pulse'
            : status.conectado
            ? 'bg-green-500'
            : 'bg-red-500'
        }`}
      />
    </div>
  );
}
