import { useEffect, useState } from 'react';
import { getUserItems, getUserBids, getUserWonAuctions } from '../services/userService';
import type { UserItem, UserBid, WonAuction } from '../services/userService';

export const DashboardPage = () => {
    const [activeTab, setActiveTab] = useState<'items' | 'bids' | 'won'>('items');
    const [items, setItems] = useState<UserItem[]>([]);
    const [bids, setBids] = useState<UserBid[]>([]);
    const [wonAuctions, setWonAuctions] = useState<WonAuction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

        fetchData();
    }, [activeTab]);

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
                            {items.map(item => (
                                <li key={item.id} style={{ marginBottom: '1rem', border: '1px solid #ddd', padding: '1rem' }}>
                                    <h3>{item.title}</h3>
                                    <p>{item.description}</p>
                                    {item.auctions.length > 0 ? (
                                        <p>Estado Subasta: {item.auctions[0].status} - Precio: ${item.auctions[0].currentPrice}</p>
                                    ) : (
                                        <p>No subastado aún</p>
                                    )}
                                </li>
                            ))}
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
                                        <p>Estado Transacción: {auction.transaction.status}</p>
                                    ) : (
                                        <button style={{ background: 'green', color: 'white', padding: '0.5rem' }}>Pagar Ahora</button>
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
