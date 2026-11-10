import React, { useState } from 'react';
import {
  ShoppingCart,
  CreditCard,
  Package,
  Plus,
  Calendar,
  AlertCircle,
  TrendingUp,
  Store,
  DollarSign,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
} from 'lucide-react';

type SubTab = 'mandado' | 'pagos' | 'productos';

export function PantryView() {
  const [subTab, setSubTab] = useState<SubTab>('mandado');

  // Muestra de items de mandado
  const [shoppingItems, setShoppingItems] = useState([
    { id: '1', name: 'Huevos (30 pzas)', category: 'Alimentos', done: false, quantity: '1 cartón' },
    { id: '2', name: 'Avena integral 1kg', category: 'Alimentos', done: false, quantity: '2 bolsas' },
    { id: '3', name: 'Pasta de dientes', category: 'Higiene', done: true, quantity: '1 pza' },
    { id: '4', name: 'Detergente líquido', category: 'Hogar', done: false, quantity: '1 botella' },
  ]);

  // Muestra de suscripciones y pagos
  const sampleSubscriptions = [
    {
      id: 'sub-1',
      name: 'Spotify Premium',
      amount: 129,
      currency: 'MXN',
      cycle: 'Mensual',
      nextPayment: '2026-11-18',
      cancelBefore: '2026-11-16',
      daysRemaining: 9,
      category: 'Entretenimiento',
    },
    {
      id: 'sub-2',
      name: 'Gimnasio / Calistenia Park Pass',
      amount: 450,
      currency: 'MXN',
      cycle: 'Mensual',
      nextPayment: '2026-11-12',
      cancelBefore: '2026-11-10',
      daysRemaining: 3,
      urgent: true,
      category: 'Salud',
    },
    {
      id: 'sub-3',
      name: 'Almacenamiento Cloud',
      amount: 39,
      currency: 'MXN',
      cycle: 'Mensual',
      nextPayment: '2026-11-30',
      cancelBefore: '2026-11-28',
      daysRemaining: 21,
      category: 'Tecnología',
    },
  ];

  // Muestra de productos y durabilidad
  const sampleProducts = [
    {
      id: 'prod-1',
      name: 'Proteína en Polvo 2kg',
      category: 'Salud / Nutrición',
      avgDurationDays: 45,
      lastPurchased: '2026-10-01',
      lastPrice: 850,
      store: 'Amazon',
      estimatedFinish: '2026-11-15',
      history: [
        { date: '2026-07-01', price: 799, store: 'Amazon' },
        { date: '2026-08-15', price: 820, store: 'Costco' },
        { date: '2026-10-01', price: 850, store: 'Amazon' },
      ],
    },
    {
      id: 'prod-2',
      name: 'Café Molido 500g',
      category: 'Alimentos',
      avgDurationDays: 20,
      lastPurchased: '2026-10-25',
      lastPrice: 165,
      store: 'Walmart',
      estimatedFinish: '2026-11-14',
      history: [
        { date: '2026-09-10', price: 155, store: 'Walmart' },
        { date: '2026-10-02', price: 160, store: 'Soriana' },
        { date: '2026-10-25', price: 165, store: 'Walmart' },
      ],
    },
  ];

  const handleToggleShopping = (id: string) => {
    setShoppingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="page-eyebrow">
              <ShoppingCart size={15} />
              Finanzas & Hogar
            </div>
            <h1 className="page-title">Despensa & Pagos</h1>
            <p className="page-description">
              Lista de mandado, alertas anticipadas de suscripciones y control de durabilidad de tus compras para presupuestar mejor.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => alert('En la Fase 4 activaremos la captura interactiva con guardado en base de datos local.')}>
            <Plus size={16} />{' '}
            {subTab === 'mandado'
              ? 'Agregar al mandado'
              : subTab === 'pagos'
              ? 'Nueva suscripción'
              : 'Registrar compra'}
          </button>
        </div>
      </header>

      {/* SUB-TABS DEDICADAS */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', overflowX: 'auto' }}>
        <button
          className={`btn ${subTab === 'mandado' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setSubTab('mandado')}
        >
          <ShoppingCart size={15} /> Lista de Mandado ({shoppingItems.filter((i) => !i.done).length})
        </button>
        <button
          className={`btn ${subTab === 'pagos' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setSubTab('pagos')}
        >
          <CreditCard size={15} /> Pagos & Suscripciones ({sampleSubscriptions.length})
        </button>
        <button
          className={`btn ${subTab === 'productos' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setSubTab('productos')}
        >
          <Package size={15} /> Durabilidad & Precios
        </button>
      </div>

      {/* 1. SECCIÓN: LISTA DE MANDADO */}
      {subTab === 'mandado' && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="card-title">Artículos por comprar</h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {shoppingItems.filter((i) => i.done).length} de {shoppingItems.length} comprados
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {shoppingItems.map((item) => (
              <div
                key={item.id}
                className={`task-item ${item.done ? 'completed' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleToggleShopping(item.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {item.done ? (
                    <CheckCircle2 size={20} color="var(--primary)" />
                  ) : (
                    <Circle size={20} color="var(--text-muted)" />
                  )}
                  <div>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        textDecoration: item.done ? 'line-through' : 'none',
                      }}
                    >
                      {item.name}
                    </span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      Cantidad: {item.quantity} · {item.category}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. SECCIÓN: PAGOS Y SUSCRIPCIONES */}
      {subTab === 'pagos' && (
        <section>
          <div
            className="card"
            style={{
              background: 'var(--warning-light)',
              borderColor: 'var(--warning)',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <AlertCircle size={20} color="var(--warning)" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
              <strong>Aviso de cancelación oportuna:</strong> Tienes 1 suscripción que cobrará en 3 días. Si deseas cancelar antes de que te cobren el próximo mes, cancélala a más tardar el 10 de noviembre.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {sampleSubscriptions.map((sub) => (
              <div
                key={sub.id}
                className="card"
                style={{
                  borderTop: sub.urgent ? '4px solid var(--warning)' : '4px solid var(--primary)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>{sub.name}</h3>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{sub.category}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--primary)' }}>
                      ${sub.amount} {sub.currency}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sub.cycle}</span>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--bg-surface-hover)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.65rem 0.85rem',
                    margin: '0.85rem 0',
                    fontSize: '0.82rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Próximo cobro:</span>
                    <span style={{ fontWeight: 600 }}>{sub.nextPayment} ({sub.daysRemaining} días)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Cancelar antes de:</span>
                    <span style={{ fontWeight: 600, color: sub.urgent ? 'var(--warning)' : 'var(--text-primary)' }}>
                      {sub.cancelBefore}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => alert(`Recordatorio programado para ${sub.name}`)}
                  >
                    <Clock size={14} /> Recordar 3 días antes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. SECCIÓN: PRODUCTOS Y DURABILIDAD */}
      {subTab === 'productos' && (
        <section>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sampleProducts.map((prod) => (
              <div key={prod.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>{prod.name}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {prod.category} · Comprado en <strong>{prod.store}</strong> por ${prod.lastPrice} MXN
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                    }}
                  >
                    Rinde aprox: {prod.avgDurationDays} días
                  </div>
                </div>

                {/* Previsión de agotamiento */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    margin: '1rem 0',
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'var(--bg-surface-hover)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                  }}
                >
                  <Clock size={16} color="var(--primary)" />
                  <span>
                    Fecha estimada de agotamiento: <strong>{prod.estimatedFinish}</strong> (en ~5 días)
                  </span>
                </div>

                {/* Historial de precios y tiendas */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    <TrendingUp size={15} />
                    Historial de precios:
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {prod.history.map((h, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: '0.78rem',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-surface)',
                        }}
                      >
                        <span style={{ color: 'var(--text-muted)' }}>{h.date}</span> · <strong>${h.price}</strong> ({h.store})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

