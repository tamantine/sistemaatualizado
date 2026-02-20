// =============================================
// Componente: SupabaseStatus
// Indicador visual de conexão com o Supabase
// Verde = Conectado | Vermelho = Desconectado
// =============================================
import { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

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
      // Se Supabase não está configurado, mostra como desconectado (modo demo)
      if (!isSupabaseConfigured || !supabase) {
        setStatus({
          conectado: false,
          verificando: false,
          erro: 'Modo Demo',
        });
        return;
      }

      try {
        // Tenta fazer uma consulta simples para verificar conexão
        const { error } = await supabase.from('produtos').select('id').limit(1);
        
        if (error) {
          // Se der erro, pode ser RLS ou outro problema, mas o Supabase está conectado
          setStatus({
            conectado: true,
            verificando: false,
          });
        } else {
          setStatus({
            conectado: true,
            verificando: false,
          });
        }
      } catch (err) {
        setStatus({
          conectado: false,
          verificando: false,
          erro: 'Erro de conexão',
        });
      }
    };

    verificarConexao();

    // Verifica conexão periodicamente (a cada 30 segundos)
    const intervalo = setInterval(verificarConexao, 30000);
    
    return () => clearInterval(intervalo);
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
            ? 'Supabase conectado'
            : 'Supabase desconectado'
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
          ? 'Supabase'
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
