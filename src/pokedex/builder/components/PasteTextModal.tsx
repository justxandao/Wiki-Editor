import React, { useState } from 'react';

interface PasteTextModalProps {
  onClose: () => void;
  onImport: (text: string) => void;
}

export function PasteTextModal({ onClose, onImport }: PasteTextModalProps) {
  const [text, setText] = useState('');

  const placeholderText = `Nome: Shiny Ursaring
Nível: 100

Habilidade: dig, rock smash, cut, headbutt e strength

Evoluções:
Shiny Teddiursa (requer nível 50)
Shiny Ursaring (requer nível 100)

Boost: Heart Stone (2)
Materia: Gardestrike

Descrição: Um Ursaring mais agressivo e territorial, especialmente durante a época de acasalamento. Ele é extremamente protetor com seus filhotes.`;

  return (
    <div className="pxg-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pxg-modal" style={{ maxWidth: 500 }}>
        <div className="pxg-modal-header">
          <div className="pxg-modal-title">
            <span>📋 Importar de Texto</span>
          </div>
          <button className="pxg-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="pxg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Cole as informações do Pokémon abaixo. O construtor irá preencher os campos e buscar os golpes/ícone no banco de dados automaticamente.
          </p>

          <div className="pxg-form-group">
            <textarea
              className="pxg-input"
              style={{ minHeight: 250, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.5 }}
              placeholder={placeholderText}
              value={text}
              onChange={e => setText(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="pxg-modal-footer">
          <button className="pxg-btn-remove-text" onClick={onClose}>Cancelar</button>
          <button
            className="pxg-btn-primary"
            onClick={() => {
              if (text.trim()) {
                onImport(text);
                onClose();
              }
            }}
            disabled={!text.trim()}
            style={{ opacity: text.trim() ? 1 : 0.6 }}
          >
            Processar e Importar
          </button>
        </div>
      </div>
    </div>
  );
}
