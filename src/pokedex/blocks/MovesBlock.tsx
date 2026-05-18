import React, { useState } from 'react';
import { usePokedexStore } from '../store/pokedexStore';
import { MoveCard } from '../components/MoveCard';
import { MoveModal } from '../components/MoveModal';
import { MoveEntry } from '../types/schema';
import { Plus, ArrowRightLeft } from 'lucide-react';

export function MovesBlock() {
  const { 
    schema, 
    addMovePvp, updateMovePvp, removeMovePvp, reorderMovePvp,
    addMovePve, updateMovePve, removeMovePve, reorderMovePve 
  } = usePokedexStore();

  const [activeMode, setActiveMode] = useState<'PvP' | 'PvE'>('PvP');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMove, setSelectedMove] = useState<MoveEntry | undefined>(undefined);

  const handleAddClick = () => {
    setSelectedMove(undefined);
    setModalOpen(true);
  };

  const handleEditClick = (move: MoveEntry) => {
    setSelectedMove(move);
    setModalOpen(true);
  };

  const handleSaveMove = (move: MoveEntry) => {
    if (activeMode === 'PvP') {
      if (selectedMove) {
        updateMovePvp(move.id, move);
      } else {
        addMovePvp(move);
      }
    } else {
      if (selectedMove) {
        updateMovePve(move.id, move);
      } else {
        addMovePve(move);
      }
    }
  };

  const handleDeleteMove = (id: string) => {
    if (confirm('Deseja realmente remover este movimento?')) {
      if (activeMode === 'PvP') {
        removeMovePvp(id);
      } else {
        removeMovePve(id);
      }
    }
  };

  const currentMoves = activeMode === 'PvP' ? schema.movesPvp : schema.movesPve;
  const reorderFn = activeMode === 'PvP' ? reorderMovePvp : reorderMovePve;

  return (
    <div id={activeMode === 'PvP' ? 'block-moves-pvp' : 'block-moves-pve'} className="bg-[#121216]/90 border border-white/[0.08] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-bold text-accent-primary uppercase tracking-wider flex items-center gap-1.5 font-outfit">
            <ArrowRightLeft size={14} /> Movimentos do Pokémon
          </h3>
          {/* Segmented Selector for PvP / PvE */}
          <div className="flex p-0.5 bg-black/40 rounded-xl border border-white/[0.05]">
            <button
              onClick={() => setActiveMode('PvP')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 ${activeMode === 'PvP' ? 'bg-[#1D1D23] text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
            >
              PvP ({schema.movesPvp.length})
            </button>
            <button
              onClick={() => setActiveMode('PvE')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 ${activeMode === 'PvE' ? 'bg-[#1D1D23] text-white shadow-lg' : 'text-text-muted hover:text-white'}`}
            >
              PvE ({schema.movesPve.length})
            </button>
          </div>
        </div>

        <button
          onClick={handleAddClick}
          className="flex items-center gap-1.5 px-3 py-2 bg-accent-primary/10 hover:bg-accent-primary/25 border border-accent-primary/25 hover:border-accent-primary/50 text-accent-primary rounded-xl text-xs font-extrabold transition shadow-sm"
        >
          <Plus size={14} />
          Criar Movimento
        </button>
      </div>

      {/* Grid of Move Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {currentMoves.map((move, index) => (
          <MoveCard
            key={move.id}
            move={move}
            index={index}
            total={currentMoves.length}
            onEdit={() => handleEditClick(move)}
            onDelete={() => handleDeleteMove(move.id)}
            onMoveUp={() => reorderFn(index, index - 1)}
            onMoveDown={() => reorderFn(index, index + 1)}
          />
        ))}
      </div>

      {/* Empty State */}
      {currentMoves.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/[0.06] rounded-xl bg-black/10 text-center gap-2">
          <span className="text-xl">⚔️</span>
          <p className="text-xs font-bold text-text-secondary">Nenhum movimento {activeMode} cadastrado</p>
          <p className="text-[10px] text-text-muted">Clique em "Criar Movimento" para começar a montar o moveset.</p>
        </div>
      )}

      {/* Modal popup */}
      <MoveModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveMove}
        initialMove={selectedMove}
        mode={activeMode}
      />
    </div>
  );
}
