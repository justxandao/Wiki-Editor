import wikiLogo from '../../assets/wiki.png';

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      color: 'var(--text-muted)',
    }}>
      <img 
        src={wikiLogo} 
        alt="Wiki" 
        style={{ 
          width: 64, 
          height: 64, 
          objectFit: 'contain', 
          backgroundColor: '#353671',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(168, 85, 247, 0.15)',
          animation: 'pulse-glow 3s ease-in-out infinite'
        }} 
      />
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif' }}>
        WikiPokexGames Editor
      </div>
      <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 320 }}>
        Nenhuma aba aberta. Use o atalho Ctrl+T ou a barra de abas para começar a editar WikiText.
      </div>
      <button
        onClick={onCreate}
        style={{
          marginTop: 8,
          padding: '8px 20px',
          background: 'var(--accent-primary)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Nova Aba
      </button>
    </div>
  );
}
