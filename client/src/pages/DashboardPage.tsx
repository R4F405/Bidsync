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
            fetchData();
        } catch (error) {
            console.error('Error paying transaction:', error);
            alert('Error al procesar el pago');
        }
    };

    const handleShip = async (transactionId: string) => {
        try {
            await shipItem(transactionId);
            fetchData();
        } catch (error) {
            console.error('Error shipping item:', error);
            alert('Error al marcar como enviado');
        }
    };

    const handleConfirm = async (transactionId: string) => {
        try {
            await confirmReceipt(transactionId);
            fetchData();
        } catch (error) {
            console.error('Error confirming receipt:', error);
            alert('Error al confirmar recepción');
        }
    };

    const TabButton = ({ id, label }: { id: 'items' | 'bids' | 'won', label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Panel</h1>

            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <TabButton id="items" label="Mis Artículos" />
                    <TabButton id="bids" label="Mis Pujas" />
                    <TabButton id="won" label="Ganadas" />
                </nav>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {activeTab === 'items' && (
                        <div className="space-y-4">
                            {items.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No tienes artículos listados.</p>
                            ) : (
                                items.map(item => {
                                    const soldAuction = item.auctions.find(a => a.status === 'SOLD' || a.status === 'ENDED');
                                    const transaction = soldAuction?.transaction;

                                    return (
                                        <div key={item.id} className="bg-white shadow rounded-lg p-6 border border-gray-100">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                                                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                                                </div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.auctions.length > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {item.auctions.length > 0 ? item.auctions[0].status : 'Borrador'}
                                                </span>
                                            </div>

                                            {item.auctions.length > 0 && (
                                                <div className="mt-4 border-t border-gray-100 pt-4">
                                                    <p className="text-sm text-gray-600">
                                                        Precio actual: <span className="font-semibold text-gray-900">${item.auctions[0].currentPrice}</span>
                                                    </p>

                                                    {transaction && (
                                                        <div className="mt-3 bg-gray-50 p-3 rounded-md">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-medium text-gray-900">Estado Transacción: {transaction.status}</span>
                                                                {transaction.status === 'IN_ESCROW' && (
                                                                    <button
                                                                        onClick={() => handleShip(transaction.id)}
                                                                        className="ml-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                                    >
                                                                        Marcar Enviado
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {transaction.status === 'PENDING_PAYMENT' && (
                                                                <p className="mt-1 text-xs text-amber-600">Esperando pago del comprador</p>
                                                            )}
                                                            {transaction.status === 'SHIPPED' && (
                                                                <p className="mt-1 text-xs text-blue-600">Enviado - Esperando confirmación</p>
                                                            )}
                                                            {transaction.status === 'COMPLETED' && (
                                                                <p className="mt-1 text-xs text-green-600">Transacción Finalizada</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {activeTab === 'bids' && (
                        <div className="space-y-4">
                            {bids.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No has realizado pujas.</p>
                            ) : (
                                bids.map(bid => (
                                    <div key={bid.id} className="bg-white shadow rounded-lg p-6 border border-gray-100">
                                        <h3 className="text-lg font-medium text-gray-900">Subasta: {bid.auction.item.title}</h3>
                                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Tu puja máxima</p>
                                                <p className="font-semibold text-gray-900">${bid.maxAmount}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Precio actual</p>
                                                <p className="font-semibold text-primary">${bid.auction.currentPrice}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {bid.auction.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'won' && (
                        <div className="space-y-4">
                            {wonAuctions.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No has ganado subastas aún.</p>
                            ) : (
                                wonAuctions.map(auction => (
                                    <div key={auction.id} className="bg-white shadow rounded-lg p-6 border border-green-100 ring-1 ring-green-50">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-medium text-gray-900">{auction.item.title}</h3>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Ganada
                                            </span>
                                        </div>

                                        <p className="mt-2 text-sm text-gray-600">
                                            Precio Final: <span className="font-bold text-gray-900">${auction.currentPrice}</span>
                                        </p>

                                        {auction.transaction ? (
                                            <div className="mt-4 bg-gray-50 p-4 rounded-md">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-900">Estado: {auction.transaction.status}</span>
                                                </div>

                                                {auction.transaction.status === 'PENDING_PAYMENT' && (
                                                    <button
                                                        onClick={() => handlePay(auction.transaction!.id)}
                                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                    >
                                                        Pagar Ahora
                                                    </button>
                                                )}

                                                {auction.transaction.status === 'IN_ESCROW' && (
                                                    <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                                                        Esperando envío del vendedor...
                                                    </p>
                                                )}

                                                {auction.transaction.status === 'SHIPPED' && (
                                                    <button
                                                        onClick={() => handleConfirm(auction.transaction!.id)}
                                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        Confirmar Recepción
                                                    </button>
                                                )}

                                                {auction.transaction.status === 'COMPLETED' && (
                                                    <p className="text-sm text-green-600 font-medium flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        Transacción Finalizada
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="mt-2 text-sm text-gray-500 italic">Procesando transacción...</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
