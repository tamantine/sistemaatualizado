import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Wand2, UploadCloud, Download, Loader2, ImagePlus, AlertCircle } from 'lucide-react';
import { gerarEncarteIA } from '../services/aiService';
import type { DadosEncarte } from '../services/aiService';

export default function Encartes() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [produto, setProduto] = useState('');
  const [preco, setPreco] = useState('');
  const [unidade, setUnidade] = useState('kg');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageBase64(reader.result as string);
        setGeneratedImageUrl(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageBase64) {
        setErrorInfo("O encarte base (imagem) é obrigatório.");
        return;
    }
    if (!produto || !preco) {
        setErrorInfo("Preencha o nome do produto e o novo preço.");
        return;
    }

    setIsGenerating(true);
    setErrorInfo(null);
    setGeneratedImageUrl(null);

    try {
      const dados: DadosEncarte = { produto, unidade, preco };
      const url = await gerarEncarteIA(imageBase64, dados);
      setGeneratedImageUrl(url);
    } catch (err: any) {
      setErrorInfo(err.message || 'Houve uma falha ao comunicar com o servidor de IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  const clearImage = () => {
      setImageBase64(null);
      setGeneratedImageUrl(null);
  }

  return (
    <div className="space-y-6 bg-slate-900 min-h-[calc(100vh-4rem)] p-6">
      
      {/* ─── CABEÇALHO ───────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-emerald-500" />
            Estúdio de Encartes (IA)
          </h1>
          <p className="text-slate-400 mt-1">
            Gere encartes publicitários (9:16) preservando seu layout original.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mt-6">
        
        {/* LDO ESQUERDO: CONTROLES E INPUT */}
        <div className="space-y-8">
            <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-6">
                <h2 className="text-lg font-bold text-white mb-4">1. Imagem Base de Referência</h2>
                
                {!imageBase64 ? (
                    <div 
                        {...getRootProps()} 
                        className={`border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors flex flex-col items-center justify-center text-center
                            ${isDragActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800'}`}
                    >
                        <input {...getInputProps()} />
                        <UploadCloud className={`h-10 w-10 mb-3 ${isDragActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                        <p className="text-slate-300 font-medium">
                            {isDragActive ? 'Solte a imagem aqui...' : 'Arraste uma foto aqui ou clique para buscar'}
                        </p>
                        <p className="text-slate-500 text-sm mt-2">Suporta JPG, PNG (máx 5MB)</p>
                    </div>
                ) : (
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex justify-center h-48">
                        <img 
                            src={imageBase64} 
                            alt="Base" 
                            className="h-full object-contain opacity-70"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none" />
                        <div className="absolute bottom-4 left-0 w-full flex justify-center">
                            <button 
                                onClick={clearImage}
                                className="bg-slate-800/80 backdrop-blur text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/80 transition-colors border border-slate-600 hover:border-red-500"
                            >
                                Trocar Imagem
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleGenerate} className="rounded-xl border border-slate-800 bg-slate-800/50 p-6 space-y-5">
                <h2 className="text-lg font-bold text-white">2. Dados da Nova Oferta</h2>
                
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Produto em Oferta</label>
                    <input
                        type="text"
                        value={produto}
                        onChange={(e) => setProduto(e.target.value)}
                        placeholder="Ex: Maçã Fuji Fresca"
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Novo Preço</label>
                        <div className="relative">
                           <span className="absolute left-4 top-3 text-slate-500 font-medium">R$</span>
                           <input
                            type="number"
                            step="0.01"
                            value={preco}
                            onChange={(e) => setPreco(e.target.value)}
                            placeholder="4.99"
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 pl-11 pr-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                           />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Unidade</label>
                        <select
                            value={unidade}
                            onChange={(e) => setUnidade(e.target.value)}
                            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 appearance-none"
                        >
                            <option value="kg">Por Kilo (kg)</option>
                            <option value="un">Por Unidade (un)</option>
                            <option value="maço">Por Maço</option>
                            <option value="100g">A cada 100g</option>
                        </select>
                    </div>
                </div>

                {errorInfo && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3 text-sm">
                        <AlertCircle className="h-5 w-5 shrink-0" /> {errorInfo}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isGenerating || !imageBase64}
                    className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <>
                           <Loader2 className="h-5 w-5 animate-spin" /> Inpainting e Renderizando IA...
                        </>
                    ) : (
                        <>
                           <Wand2 className="h-5 w-5" /> Gerar Novo Encarte (9:16)
                        </>
                    )}
                </button>
            </form>
        </div>

        {/* LADO DIREITO: PREVIEW FINAL */}
        <div className="rounded-xl border border-slate-800 bg-slate-800/30 p-6 flex flex-col h-full min-h-[500px]">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-emerald-500" /> Resultado Final
            </h2>
            
            <div className="flex-1 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden group">
                {isGenerating ? (
                    <div className="flex flex-col items-center gap-4 text-emerald-500 p-8 text-center animate-pulse">
                        <Wand2 className="h-12 w-12 animate-bounce" />
                        <h3 className="font-bold text-lg">Reconstruindo Imagem...</h3>
                        <p className="text-sm text-slate-400">O robô do Black Forest Labs está recortando o contorno do seu produto antigo e escrevendo "{produto}". Isso pode levar cerca de 15 segundos.</p>
                    </div>
                ) : generatedImageUrl ? (
                    <>
                        <img 
                            src={generatedImageUrl} 
                            alt="Novo Encarte" 
                            className="h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <a 
                                href={generatedImageUrl}
                                target="_blank"
                                rel="noreferrer"
                                download="encarte-hortifruti.png"
                                className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all"
                            >
                                <Download className="h-5 w-5" /> Fazer Download em Alta (4K)
                            </a>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-8 text-slate-500">
                        <ImagePlus className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>A arte publicatória renderizada pela Inteligência Artificial aparecerá aqui.</p>
                        <p className="text-xs mt-2 text-slate-600">Proporção fixada: Stories/WhatsApp (1080x1920)</p>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
