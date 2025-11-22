import { useEffect, useState } from 'react';
import { getUserItems, getUserBids, getUserWonAuctions } from '../services/userService';
import type { UserItem, UserBid, WonAuction } from '../services/userService';
import { payTransaction, shipItem, confirmReceipt } from '../services/transactionService';

export const DashboardPage = () => {
    const [activeTab, setActiveTab] = useState<'items' | 'bids' | 'won'>('items');
    const [items, setItems] = useState<UserItem[]>([]);
    const [bids, setBids] = useState<UserBid[]>([]);
    const [wonAuctions, setWonAuctions] = useState<WonAuction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'items') {
                const data = await getUserItems();
                setItems(data);
            } else if (activeTab === 'bids') {
                const data = await getUserBids();
                setBids(data);
            } else if (activeTab === 'won') {
                const data = await getUserWonAuctions();
                setWonAuctions(data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handlePay = async (transactionId: string) => {
        try {
            await payTransaction(transactionId);
            fetchData(); // Recargar datos
        } catch (error) {
            console.error('Error paying transaction:', error);
            alert('Error al procesar el pago');
        }
    };

    const handleShip = async (transactionId: string) => {
        try {
            await shipItem(transactionId);
            fetchData(); // Recargar datos
        } catch (error) {
            console.error('Error shipping item:', error);
            alert('Error al marcar como enviado');
        }
    };

    const handleConfirm = async (transactionId: string) => {
        try {
            await confirmReceipt(transactionId);
            fetchData(); // Recargar datos
        } catch (error) {
            console.error('Error confirming receipt:', error);
            alert('Error al confirmar recepción');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1>Mi Dashboard</h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid #ccc' }}>
                <button
                    onClick={() => setActiveTab('items')}
                    style={{ padding: '0.5rem 1rem', background: activeTab === 'items' ? '#eee' : 'transparent', border: 'none', cursor: 'pointer' }}
                >
                    Mis Items
                </button>
                <button
                    onClick={() => setActiveTab('bids')}
                    style={{ padding: '0.5rem 1rem', background: activeTab === 'bids' ? '#eee' : 'transparent', border: 'none', cursor: 'pointer' }}
                >
                    Mis Pujas
                </button>
                <button
                    onClick={() => setActiveTab('won')}
                    style={{ padding: '0.5rem 1rem', background: activeTab === 'won' ? '#eee' : 'transparent', border: 'none', cursor: 'pointer' }}
                >
                    Ganadas
                </button>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div>
                    {activeTab === 'items' && (
                        <ul>
                            {items.map(item => {
                                const soldAuction = item.auctions.find(a => a.status === 'SOLD' || a.status === 'ENDED'); // Ajustar según estados reales
                                const transaction = soldAuction?.transaction;

                                return (
                                    <li key={item.id} style={{ marginBottom: '1rem', border: '1px solid #ddd', padding: '1rem' }}>
                                        <h3>{item.title}</h3>
                                        <p>{item.description}</p>
                                        {item.auctions.length > 0 ? (
                                            <div>
                                                <p>Estado Subasta: {item.auctions[0].status} - Precio: ${item.auctions[0].currentPrice}</p>
                                                {transaction && (
                                                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f9f9f9' }}>
                                                        <p><strong>Transacción:</strong> {transaction.status}</p>
                                                        {transaction.status === 'PENDING_PAYMENT' && (
                                                            <p style={{ color: 'orange' }}>Esperando pago del comprador</p>
                                                        )}
                                                        {transaction.status === 'IN_ESCROW' && (
                                                            <button onClick={() => handleShip(transaction.id)} style={{ background: 'blue', color: 'white', padding: '0.5rem' }}>
                                                                Marcar como Enviado
                                                            </button>
                                                        )}
                                                        {transaction.status === 'SHIPPED' && (
                                                            <p style={{ color: 'blue' }}>Enviado - Esperando confirmación</p>
                                                        )}
                                                        {transaction.status === 'COMPLETED' && (
                                                            <p style={{ color: 'green' }}>Transacción Finalizada</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p>No subastado aún</p>
                                        )}
                                    </li>
                                );
                            })}
                            {items.length === 0 && <p>No tienes items listados.</p>}
                        </ul>
                    )}

                    {activeTab === 'bids' && (
                        <ul>
                            {bids.map(bid => (
                                <li key={bid.id} style={{ marginBottom: '1rem', border: '1px solid #ddd', padding: '1rem' }}>
                                    <h3>Subasta: {bid.auction.item.title}</h3>
                                    <p>Tu puja: ${bid.maxAmount}</p>
                                    <p>Precio actual: ${bid.auction.currentPrice}</p>
                                    <p>Estado: {bid.auction.status}</p>
                                </li>
                            ))}
                            {bids.length === 0 && <p>No has realizado pujas.</p>}
                        </ul>
                    )}

                    {activeTab === 'won' && (
                        <ul>
                            {wonAuctions.map(auction => (
                                <li key={auction.id} style={{ marginBottom: '1rem', border: '1px solid #ddd', padding: '1rem' }}>
                                    <h3>{auction.item.title}</h3>
                                    <p>Precio Final: ${auction.currentPrice}</p>
                                    {auction.transaction ? (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <p>Estado Transacción: {auction.transaction.status}</p>
                                            {auction.transaction.status === 'PENDING_PAYMENT' && (
                                                <button onClick={() => handlePay(auction.transaction!.id)} style={{ background: 'green', color: 'white', padding: '0.5rem' }}>
                                                    Simular Pago
                                                </button>
                                            )}
                                            {auction.transaction.status === 'IN_ESCROW' && (
                                                <p style={{ color: 'orange' }}>Esperando envío del vendedor</p>
                                            )}
                                            {auction.transaction.status === 'SHIPPED' && (
                                                <button onClick={() => handleConfirm(auction.transaction!.id)} style={{ background: 'blue', color: 'white', padding: '0.5rem' }}>
                                                    Confirmar Recepción
                                                </button>
                                            )}
                                            {auction.transaction.status === 'COMPLETED' && (
                                                <p style={{ color: 'green' }}>Transacción Finalizada</p>
                                            )}
                                        </div>
                                    ) : (
                                        <p>Esperando creación de transacción...</p>
                                    )}
                                </li>
                            ))}
                            {wonAuctions.length === 0 && <p>No has ganado subastas aún.</p>}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};
