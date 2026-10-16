import { Link } from "react-router";
import React, { useEffect, useState } from "react";
import useApi from "../api/useApi";

export default function Add_Product() {
  // State for switching tabs
  const [activeTab, setActiveTab] = useState("product");


  // Category
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [editCategoryIndex, setEditCategoryIndex] = useState(null);

  // Sub Category
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoryName, setSubCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editSubCategoryIndex, setEditSubCategoryIndex] = useState(null);

  // Products
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState("");
  const [gst, setgst] = useState("");
  const [unit, setunit] = useState("Kg");
  const [pkg, setpkg] = useState(null);
  const [inputType, setInputType] = useState("SINGLE");
  const [hsnCode, setHsnCode] = useState("");
  const [selectedProductCategory, setSelectedProductCategory] = useState("");
  const [selectedProductSubCategory, setSelectedProductSubCategory] = useState("");
  const [editProductIndex, setEditProductIndex] = useState(null);

  const { getData, postData } = useApi()

  const fetchcategories = async () => {
    const res = await getData('/admin/categories')
    setCategories(res || [])
  }
  const fetchsubcategories = async () => {
    const res = await getData('/admin/sub_categories')
    setSubCategories(res || [])
  }
  const fetchproducts = async () => {
    const res = await getData('/admin/products')
    setProducts(res || [])
  }

  useEffect(() => {
    (async () => {
      try {
        const [res1, res2, res3] = await Promise.all([
          getData("/admin/categories"),
          getData("/admin/sub_categories"),
          getData("/admin/products"),
        ]);

        setCategories(res1 || []);
        setSubCategories(res2 || []);
        setProducts(res3 || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    )()
  }, [])

  // ------------------ CATEGORY ------------------
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    let payload = { name: categoryName }
    if (editCategoryIndex !== null) {
      payload.id = editCategoryIndex
      setEditCategoryIndex(null);
    }
    try {
      const res = await postData('/admin/categories', payload)
      console.log(res);
      fetchcategories()
    } catch (error) {
      console.log(error);
    } finally {
      setCategoryName("");
    }
  };

  const handleEditCategory = (item) => {
    setCategoryName(item.name);
    setEditCategoryIndex(item.id);
  };

  const handleDeleteCategory = (index) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  // ------------------ SUB CATEGORY ------------------
  const handleSubCategorySubmit = async (e) => {
    e.preventDefault();
    if (!subCategoryName.trim() || !selectedCategory) return;
    let payload = { sub_category: subCategoryName, category_id: selectedCategory }
    if (editSubCategoryIndex !== null) {
      payload.id = editSubCategoryIndex
      setEditSubCategoryIndex(null);
    }
    try {
      const res = await postData('/admin/sub_categories', payload)
      console.log(res);
      fetchsubcategories()
    } catch (error) {
      console.log(error);
    } finally {
      setSubCategoryName("");
      setSelectedCategory("");
    }
  };

  const handleEditSubCategory = (item) => {
    setSubCategoryName(item.sub_category);
    setSelectedCategory(item.category_id);
    setEditSubCategoryIndex(item.id);
  };
  const handleDeleteSubCategory = (index) => {
    setSubCategories(subCategories.filter((_, i) => i !== index));
  };

  // ------------------ PRODUCT ------------------
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productName.trim() || !gst || !selectedProductCategory || !selectedProductSubCategory) return;
    let payload = { name: productName, gst: gst, hsn_code: hsnCode, category_id: selectedProductCategory, sub_category_id: selectedProductSubCategory, price: 0, unit, pkg: pkg || 1, inputType }
    if (editProductIndex !== null) {
      payload.id = editProductIndex
      setEditProductIndex(null);
    }
    try {
      console.log(payload);
      const res = await postData('/admin/products', payload)
      console.log(res);
      fetchproducts()
    } catch (error) {
      console.log(error);
    } finally {
      setProductName("");
      setgst("");
      // setpkg("");
      setunit("");
      setHsnCode("");
      setSelectedProductCategory("");
      setSelectedProductSubCategory("");
    }
  };

  const handleEditProduct = (p) => {
    setProductName(p.name);
    setgst(p.gst);
    setunit(p.unit);
    setHsnCode(p.hsn_code || "");
    // setpkg(p.pkg);
    setInputType(p.inputType || "SINGLE");
    setSelectedProductCategory(p.category_id);
    setSelectedProductSubCategory(p.sub_category_id);
    setEditProductIndex(p.id);
  };
  const handleDeleteProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const tabClass = (tab) => `
    flex flex-col items-center justify-center w-20 h-16 rounded-lg transition-all
    ${activeTab === tab
      ? 'bg-teal-600 text-white shadow-sm'
      : 'bg-white border border-gray-200 text-gray-400 hover:bg-gray-50'}
  `;

  return (
    <div className="min-h-screen bg-slate-50 text-sm">
      {/* Top Navigation Bar */}
      <Link to={'/'} className="block shadow-sm">
        <div className="bg-[#249CA2] h-11 w-full flex items-center px-4 gap-3 text-white">
          <i className="fa-solid fa-arrow-left text-xs"></i>
          <span className="font-bold text-xs uppercase tracking-tight">Back to Dashboard</span>
        </div>
      </Link>

      <div className="max-w-5xl mx-auto p-3">
        {/* Compact Tab Selector */}
        <div className="flex justify-center gap-4 my-4">

          <button onClick={() => setActiveTab("product")} className={tabClass("product")}>
            <span className="text-xl">🛒</span>
            <span className="text-[10px] font-bold uppercase mt-1">Product</span>
          </button>

          <button onClick={() => setActiveTab("category")} className={tabClass("category")}>
            <span className="text-xl">📂</span>
            <span className="text-[10px] font-bold uppercase mt-1">Category</span>
          </button>

          <button onClick={() => setActiveTab("subcategory")} className={tabClass("subcategory")}>
            <span className="text-xl">🗂️</span>
            <span className="text-[10px] font-bold uppercase mt-1">Sub-Cat</span>
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4">

            {/* Category Section */}
            {activeTab === "category" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="font-bold text-gray-700 uppercase tracking-wide">Category List</h2>
                  <span className="text-xs text-gray-400">{categories.length} Items</span>
                </div>

                <form onSubmit={handleCategorySubmit} className="flex gap-2 bg-gray-50 p-2 rounded">
                  <input
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-teal-500 outline-none"
                    placeholder="Category name..."
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                  <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-1.5 rounded font-semibold text-xs transition-colors">
                    {editCategoryIndex !== null ? "UPDATE" : "ADD NEW"}
                  </button>
                </form>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-100 text-[11px] uppercase text-gray-500 tracking-wider">
                        <th className="px-3 py-2 border-b">Category Name</th>
                        <th className="px-3 py-2 border-b text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {categories.map((cat, i) => (
                        <tr key={i} className="hover:bg-teal-50/30 transition-colors">
                          <td className="px-3 py-2 text-gray-600 font-medium">{cat.name}</td>
                          <td className="px-3 py-2 text-right">
                            <button onClick={() => handleEditCategory(cat)} className="text-teal-600 hover:underline font-bold text-[11px]">
                              EDIT
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sub Category Section */}
            {activeTab === "subcategory" && (
              <div className="space-y-4">
                <h2 className="font-bold text-gray-700 uppercase tracking-wide border-b pb-2">Sub Category Setup</h2>
                <form onSubmit={handleSubCategorySubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 p-2 rounded">
                  <select className="px-2 py-1.5 border rounded text-sm outline-none" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="">Category...</option>
                    {categories.map((cat, i) => <option key={i} value={cat.id}>{cat.name}</option>)}
                  </select>
                  <input className="px-2 py-1.5 border rounded text-sm outline-none" placeholder="Sub-category name..." value={subCategoryName} onChange={(e) => setSubCategoryName(e.target.value)} />
                  <button className="bg-teal-600 text-white px-3 py-1.5 rounded font-bold text-xs uppercase tracking-tighter hover:bg-teal-700">
                    {editSubCategoryIndex !== null ? "Update" : "Save Sub-Cat"}
                  </button>
                </form>

                <table className="w-full text-left mt-2">
                  <thead className="bg-gray-100 text-[11px] uppercase text-gray-500">
                    <tr>
                      <th className="px-3 py-2 border-b">Main Category</th>
                      <th className="px-3 py-2 border-b">Sub Category</th>
                      <th className="px-3 py-2 border-b text-right text-transparent">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subCategories.map((sub, i) => (
                      <tr key={i} className="hover:bg-teal-50/30">
                        <td className="px-3 py-2 text-gray-400 text-xs">{sub.category_name}</td>
                        <td className="px-3 py-2 text-gray-700 font-medium">{sub.sub_category}</td>
                        <td className="px-3 py-2 text-right">
                          <button onClick={() => handleEditSubCategory(sub)} className="text-teal-600 font-bold text-[11px]">EDIT</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Product Section */}
            {activeTab === "product" && (
              <div className="space-y-4">
                <h2 className="font-bold text-gray-700 uppercase tracking-wide border-b pb-2">Product Catalog</h2>
                <form onSubmit={handleProductSubmit} className="grid grid-cols-2 md:grid-cols-6 gap-2 bg-gray-50 p-2 rounded items-end">
                  <div className="col-span-1">
                    <label className="text-[10px] text-gray-500 uppercase ml-1">Category</label>
                    <select required className="w-full p-1 border rounded text-xs outline-none" value={selectedProductCategory} onChange={(e) => setSelectedProductCategory(e.target.value)}>
                      <option value="">Select</option>
                      {categories.map((cat, i) => <option key={i} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] text-gray-500 uppercase ml-1">Sub-Cat</label>
                    <select required className="w-full p-1 border rounded text-xs outline-none" value={selectedProductSubCategory} onChange={(e) => setSelectedProductSubCategory(e.target.value)}>
                      <option value="">Select</option>
                      {subCategories.filter(item => item.category_id === selectedProductCategory).map((sub, i) => <option key={i} value={sub.id}>{sub.sub_category}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-gray-500 uppercase ml-1">Product Name</label>
                    <input required className="w-full p-1 border rounded text-xs outline-none" placeholder="Name" value={productName} onChange={(e) => setProductName(e.target.value)} />
                  </div>

                  <div className="col-span-2 flex gap-1">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase ml-1">GST</label>
                      <input required className="w-full p-1 border rounded text-xs outline-none" placeholder="Gst(%)" value={gst} onChange={(e) => setgst(e.target.value)} type="number" />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase">Unit</label>
                      <select required className="w-full p-0.5 border rounded text-xs outline-none" value={unit} onChange={(e) => setunit(e.target.value)}>
                        <option>Kg</option><option>Pcs</option>
                      </select>
                    </div>
                    {/* <div>
                      <label className="text-[10px] text-gray-500 uppercase">Pkg Size</label>
                      <input required className="w-full p-1 border rounded text-xs outline-none" type="number" value={pkg} onChange={(e) => setpkg(e.target.value)} />
                    </div> */}
                    <div className="col-span-1">
                      <label className="text-[10px] text-gray-500 uppercase">HSN Code</label>
                      <input required className="w-full p-1 border rounded text-xs outline-none" placeholder="HSN" value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase">INPUT</label>
                      <select required className="w-full p-0.5 border rounded text-xs outline-none" value={inputType} onChange={(e) => setInputType(e.target.value)}>
                        <option>SINGLE</option><option>DUAL</option>
                      </select>
                    </div>
                  </div>
                  <button className="bg-teal-600 text-white p-1.5 rounded font-bold text-xs uppercase hover:bg-teal-700 h-7.5">
                    {editProductIndex !== null ? "Update" : "Add"}
                  </button>
                </form>

                <div className="overflow-x-auto rounded border">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 font-bold border-b">
                        <th className="p-2">Details</th>
                        <th className="p-2 text-center">HSN</th>
                        <th className="p-2 text-center">Unit</th>
                        <th className="p-2 text-center">GST</th>
                        <th className="p-2 text-center">Input</th>
                        <th className="p-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2">
                            <div className="font-bold text-gray-800 uppercase text-[11px]">{p.name}</div>
                            <div className="text-[10px] text-gray-400">{p.category_name} &raquo; {p.sub_category_name}</div>
                          </td>
                          <td className="p-2 text-center text-gray-600">{p.hsn_code}</td>
                          <td className="p-2 text-center text-gray-600">{p.unit}</td>
                          <td className="p-2 text-center font-semibold text-teal-700">{p.gst}%</td>
                          <td className="p-2 text-center rext-gray-600">{p.inputType}</td>
                          <td className="p-2 text-right">
                            <button onClick={() => handleEditProduct(p)} className="text-amber-600 font-bold hover:underline">EDIT</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

}
