
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Plus, PencilLine, Trash2, Check, ShoppingCart, Send } from 'lucide-react'; 
import Swal from 'sweetalert2';

// API and Firebase Imports
import useApi from '../../api/useApi';
import { db } from '../../firebase/Database';
import { ref, push, set } from "firebase/database";

const Order = () => {
    const { entityName = "Rahul" } = useParams();
    const navigate = useNavigate();
    const { getData } = useApi();

    // --- STATES ---
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [cart, setCart] = useState([]);
    
    // UI Specific States
    const [showCartMobile, setShowCartMobile] = useState(false);
    const [editingId, setEditingId] = useState(null); 
    const [summaryEditId, setSummaryEditId] = useState(null); 

    // --- FETCH DATA ---
    useEffect(() => {
        (async () => {
            try {
                const [resCat, resProd] = await Promise.all([
                    getData("/admin/categories"),
                    getData("/admin/products"),
                ]);
                setCategories(resCat || []);
                setProducts(resProd || []);
                if (resCat?.length > 0) setSelectedCategory(resCat[0].id);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        })();
    }, []);

    const itemsToShow = useMemo(() => 
        products.filter(item => item.category_id === selectedCategory), 
    [products, selectedCategory]);

    // --- HANDLERS ---
    const handleQtyChange = (id, value, key) => {
        setCart(prev => {
            const exists = prev.some(i => i.id === id);
            if (exists) {
                return prev.map(item => item.id === id ? { ...item, [key]: value } : item);
            } else {
                const product = products.find(p => p.id === id);
                return [...prev, { ...product, pieces: key === 'pieces' ? value : 0, quantity: key === 'quantity' ? value : 0 }];
            }
        });
    };

    const toggleCartItemDesktop = (item) => {
        setCart(prev => {
            const exists = prev.some(i => i.id === item.id);
            return exists ? prev.filter(i => i.id !== item.id) : [...prev, { ...item, pieces: 0, quantity: 0 }];
        });
    };

    const confirmDelete = (item) => {
        Swal.fire({
            title: "Remove?",
            text: `Delete ${item.name}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Yes"
        }).then((result) => {
            if (result.isConfirmed) {
                setCart(prev => prev.filter(i => i.id !== item.id));
            }
        });
    };

    const handleSaveOrder = async () => {
        if (cart.length === 0) { 
            Swal.fire("Empty!", "Cannot save an empty order.", "warning"); 
            return; 
        }

        const newDocRef = push(ref(db, `orders`));
        try {
            await set(newDocRef, {
                id: newDocRef.key,
                vendor_id: entityName,
                items: cart,
                billed: false,
                created_at: new Date().toISOString(),
            });
            
            Swal.fire({
                title: "Success!",
                text: "Order saved successfully.",
                icon: "success",
                timer: 1000,
                showConfirmButton: false
                });

            setCart([]);
            setShowCartMobile(false);
            navigate('/order'); // Or wherever you'd like to redirect
        } catch (error) {
            console.error("Firebase Error: ", error);
            Swal.fire("Error", "Failed to save order.", "error");
        }
    };

    // --- SUB-COMPONENTS ---
    const DesktopItemCard = ({ item }) => {
        const isInCart = cart.some(cartItem => cartItem.id === item.id);
        return (
            <div
                onClick={() => toggleCartItemDesktop(item)}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer flex flex-col items-center text-center shadow-sm ${
                    isInCart ? "bg-orange-50 border-orange-500 shadow-md" : "bg-white border-gray-200 hover:border-orange-300"
                }`}
            >
                <span className="font-semibold text-gray-800">{item.name} <span className='text-xs text-slate-600'>({item.sub_category_name})</span></span>
                <span className={`text-xs mt-2 font-medium ${isInCart ? "text-orange-600" : "text-green-600"}`}>
                    {isInCart ? "✓ Added" : "+ Add to Cart"}
                </span>
            </div>
        );
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
            
            {/* --- DESKTOP VIEW --- */}
            <div className="hidden md:flex flex-col h-full overflow-hidden">
                <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
                    <div className="flex items-center grow">
                        <div onClick={() => navigate('/')} className="text-orange-600 font-bold text-xl cursor-pointer flex items-center mr-6">
                            <ChevronLeft className="mr-2" />NPH
                        </div>
                        <button onClick={() => navigate('/order')} className="text-orange-600 hover:text-orange-700 px-4 py-2 rounded-md transition-colors text-sm font-semibold border border-orange-700">
                            New Order
                        </button>
                    </div>
                </nav>

                <div className="flex grow overflow-hidden">
                    <div className="w-56 bg-white border-r border-gray-200 overflow-y-auto">
                        {categories.map(cat => (
                            <button 
                                key={cat.id} 
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`w-full text-left px-6 py-4 font-semibold text-sm transition-colors border-b border-gray-100 ${
                                    selectedCategory === cat.id ? "bg-orange-600 text-white" : "text-gray-600 hover:bg-orange-50"
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="grow p-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Customer: <span className="text-orange-600">{entityName}</span></h2>
                            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-orange-600 font-medium">← Change Vendor</button>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {itemsToShow.map(item => <DesktopItemCard key={item.id} item={item} />)}
                        </div>
                    </div>

                    <div className="w-80 bg-white border-l border-gray-200 p-5 overflow-y-auto shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Current Order Items</h3>
                        <div className="space-y-3">
                            {cart.length === 0 ? (
                                <p className="text-center text-gray-400 mt-10 italic">Your cart is empty.</p>
                            ) : (
                               cart.map(item => (
                                    <div
                                        key={item.id}
                                        className="bg-white p-3 rounded-md border border-gray-100"
                                    >
                                        <div className="font-bold text-sm mb-2">
                                        {item.name} ({item.unit})
                                        </div>

                                        <div className="flex gap-2">
                                        {/* SINGLE input */}
                                        {item.inputType === "SINGLE" && (
                                            <div className="flex-1">
                                            <label className="text-[10px] text-gray-500 block uppercase">
                                                {item.unit === "Kg" ? "Weight (Kg)" : "Pieces"}
                                            </label>
                                            <input
                                                type="number"
                                                value={item.unit === "Kg" ? item.quantity || '' : item.pieces || ''}
                                                onChange={e =>
                                                handleQtyChange(
                                                    item.id,
                                                    e.target.value,
                                                    item.unit === "Kg" ? "quantity" : "pieces"
                                                )
                                                }
                                                step={item.unit === "Kg" ? "0.01" : "1"}
                                                className="w-full border border-gray-300 rounded p-1 text-right outline-none focus:ring-1 focus:ring-orange-500"
                                            />
                                            </div>
                                        )}

                                        {/* DUAL input */}
                                        {item.inputType === "DUAL" && (
                                            <>
                                            <div className="flex-1">
                                                <label className="text-[10px] text-gray-500 block uppercase">
                                                Pieces
                                                </label>
                                                <input
                                                type="number"
                                                value={item.pieces || ''}
                                                onChange={e =>
                                                    handleQtyChange(item.id, e.target.value, 'pieces')
                                                }
                                                step="1"
                                                className="w-full border border-gray-300 rounded p-1 text-right outline-none focus:ring-1 focus:ring-orange-500"
                                                />
                                            </div>

                                            <div className="flex-1">
                                                <label className="text-[10px] text-gray-500 block uppercase">
                                                Weight (Kg)
                                                </label>
                                                <input
                                                type="number"
                                                value={item.quantity || ''}
                                                onChange={e =>
                                                    handleQtyChange(item.id, e.target.value, 'quantity')
                                                }
                                                step="0.01"
                                                className="w-full border border-gray-300 rounded p-1 text-right outline-none focus:ring-1 focus:ring-orange-500"
                                                />
                                            </div>
                                            </>
                                        )}
                                        </div>
                                    </div>
                                    ))
                            )}
                        </div>
                        {cart.length > 0 && (
                            <button onClick={handleSaveOrder} className="w-full mt-4 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Save Order</button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- MOBILE VIEW --- */}
            <div className="md:hidden flex flex-col h-full overflow-y-auto bg-slate-50 pb-32">
                <nav className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
                    <div onClick={() => navigate(-1)} className="text-orange-600 font-bold flex items-center cursor-pointer">
                        <ChevronLeft size={22} /> NPH
                    </div>
                    <button onClick={() => navigate('/order')} className="text-orange-600 border border-orange-600 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                        New Order
                    </button>
                </nav>

                <div className="p-4">
                    {!showCartMobile ? (
                        <>
                            <div className="mb-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Customer</p>
                                <h2 className="text-lg font-bold text-slate-800 uppercase">{entityName}</h2>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-xs font-black text-slate-500 uppercase mb-2 ml-1 tracking-widest">Select Category</h3>
                                <select 
                                    className="w-full p-3 border border-slate-200 rounded-xl bg-white shadow-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                                    value={selectedCategory || ''}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <table className="w-full">
                                    <tbody>
                                     {itemsToShow.map(item => {
                                            const cartItem = cart.find(c => c.id === item.id);
                                            const isEditing = editingId === item.id;

                                            // fallback to item config if cartItem not created yet
                                            const inputType = cartItem?.inputType || item.inputType;
                                            const unit = cartItem?.unit || item.unit;

                                            return (
                                                <tr
                                                key={item.id}
                                                className="border-b last:border-0 hover:bg-slate-50 transition-colors"
                                                >
                                                {/* Product info */}
                                                <td className="p-4 align-middle">
                                                    <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                                                    <div className="text-[11px] text-slate-400">
                                                    {item.sub_category_name} ({unit})
                                                    </div>
                                                </td>

                                                {/* Quantity cell */}
                                                <td className="p-4 text-right align-middle">
                                                    {isEditing ? (
                                                    <div className="flex gap-2 justify-end items-center">

                                                        {/* Pieces input */}
                                                        {(inputType === "DUAL" || unit === "Piece") && (
                                                        <input
                                                            type="number"
                                                            step="1"
                                                            placeholder="Pcs"
                                                            className="w-14 border-2 border-slate-200 rounded-lg p-2 text-xs font-bold text-center"
                                                            value={cartItem?.pieces || ''}
                                                            onChange={e =>
                                                            handleQtyChange(item.id, e.target.value, 'pieces')
                                                            }
                                                        />
                                                        )}

                                                        {/* KG input */}
                                                        {(inputType === "DUAL" || unit === "Kg") && (
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="KG"
                                                            className="w-14 border-2 border-slate-200 rounded-lg p-2 text-xs font-bold text-center"
                                                            value={cartItem?.quantity || ''}
                                                            onChange={e =>
                                                            handleQtyChange(item.id, e.target.value, 'quantity')
                                                            }
                                                        />
                                                        )}

                                                        <button
                                                        onClick={() => setEditingId(null)}
                                                        className="bg-green-600 text-white p-2 rounded-lg"
                                                        >
                                                        <Check size={18} />
                                                        </button>
                                                    </div>
                                                    ) : (
                                                    <button
                                                        onClick={() => setEditingId(item.id)}
                                                        className={`${
                                                        cartItem
                                                            ? 'bg-orange-50 text-orange-600 border-orange-200'
                                                            : 'bg-blue-600 text-white shadow-md'
                                                        } border-2 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap`}
                                                    >
                                                        {cartItem ? (
                                                        <>
                                                            {(inputType === "DUAL" || unit === "Piece") &&
                                                            `${cartItem.pieces || 0} Pcs`}
                                                            {(inputType === "DUAL" || unit === "Kg") &&
                                                            `  ${cartItem.quantity || 0} Kg`}
                                                        </>
                                                        ) : (
                                                        '+ Add'
                                                        )}
                                                    </button>
                                                    )}
                                                </td>
                                                </tr>
                                            );
                                            })}

                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                            <div className="p-4 bg-slate-900 flex justify-between items-center text-white">
                                <h2 className="font-bold tracking-tight">Your Selection</h2>
                                <button onClick={() => setShowCartMobile(false)} className="bg-orange-600 px-4 py-2 rounded-xl font-bold text-[10px] uppercase flex items-center gap-1">
                                    <Plus size={14} /> Add More
                                </button>
                            </div>
                            <div className="divide-y divide-slate-100">
                               {cart.map(item => (
                                    <div key={item.id} className="p-4">
                                        <div className="flex items-center justify-between gap-2">
                                        {/* Product info */}
                                        <div className="w-1/3 min-w-0">
                                            <div className="font-bold text-slate-800 text-sm truncate">
                                            {item.name}
                                            </div>
                                            <div className="text-[9px] text-slate-400 font-bold uppercase truncate">
                                            {item.sub_category_name}
                                            </div>
                                        </div>

                                        {/* Quantity summary */}
                                        <div className="flex-1 flex justify-center gap-4">
                                            {/* Pieces */}
                                            {(item.inputType === "DUAL" || item.unit === "Piece") && (
                                            <div className="text-center">
                                                <div className="text-xs font-black">{item.pieces || 0}</div>
                                                <div className="text-[8px] text-slate-400 font-bold uppercase">
                                                Pieces
                                                </div>
                                            </div>
                                            )}

                                            {/* KG */}
                                            {(item.inputType === "DUAL" || item.unit === "Kg") && (
                                            <div className="text-center">
                                                <div className="text-xs font-black">{item.quantity || 0}</div>
                                                <div className="text-[8px] text-slate-400 font-bold uppercase">
                                                KG
                                                </div>
                                            </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-1 shrink-0">
                                            <button
                                            onClick={() =>
                                                setSummaryEditId(summaryEditId === item.id ? null : item.id)
                                            }
                                            className="p-2 text-blue-600"
                                            >
                                            <PencilLine size={18} />
                                            </button>
                                            <button
                                            onClick={() => confirmDelete(item)}
                                            className="p-2 text-red-500"
                                            >
                                            <Trash2 size={18} />
                                            </button>
                                        </div>
                                        </div>

                                        {/* Edit panel */}
                                        {summaryEditId === item.id && (
                                        <div className="mt-3 p-2 bg-blue-50/50 rounded-xl border border-blue-100">
                                            <div className="grid grid-cols-7 gap-2 items-end">

                                            {/* Pieces input */}
                                            {(item.inputType === "DUAL" || item.unit === "Piece") && (
                                                <div className="col-span-3">
                                                <label className="text-[8px] font-black text-blue-400 uppercase mb-1 block ml-1">
                                                    Pieces
                                                </label>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    className="w-full border border-blue-200 p-2 rounded-lg text-xs font-bold text-center bg-white"
                                                    value={item.pieces || ''}
                                                    onChange={e =>
                                                    handleQtyChange(item.id, e.target.value, 'pieces')
                                                    }
                                                />
                                                </div>
                                            )}

                                            {/* KG input */}
                                            {(item.inputType === "DUAL" || item.unit === "Kg") && (
                                                <div className="col-span-3">
                                                <label className="text-[8px] font-black text-blue-400 uppercase mb-1 block ml-1">
                                                    Weight (KG)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full border border-blue-200 p-2 rounded-lg text-xs font-bold text-center bg-white"
                                                    value={item.quantity || ''}
                                                    onChange={e =>
                                                    handleQtyChange(item.id, e.target.value, 'quantity')
                                                    }
                                                />
                                                </div>
                                            )}

                                            {/* Save */}
                                            <div className="col-span-1">
                                                <button
                                                onClick={() => setSummaryEditId(null)}
                                                className="w-full bg-blue-600 text-white h-[34px] flex items-center justify-center rounded-lg"
                                                >
                                                <Check size={16} />
                                                </button>
                                            </div>
                                            </div>
                                        </div>
                                        )}
                                    </div>
                                    ))}

                            </div>
                            <div className="p-6 bg-slate-50 border-t flex justify-center">
                                <button onClick={handleSaveOrder} className="bg-green-600 text-white py-4 px-12 rounded-full font-black text-xs shadow-xl flex items-center gap-2 uppercase tracking-widest">
                                    <Send size={16} /> Save Final Order
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {!showCartMobile && cart.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50">
                        <button 
                            onClick={() => setShowCartMobile(true)}
                            className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black flex justify-center items-center gap-4 shadow-2xl transition-all"
                        >
                            <ShoppingCart size={24} className="text-orange-500" />
                            <span className="text-sm tracking-widest uppercase">View Summary ({cart.length})</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Order;

