import React, { useState, useEffect } from 'react';
import { itemAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const Items = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    itemCode: '',
    itemName: '',
    category: 'Product',
    description: '',
    unit: 'Pcs',
    hsnCode: '',
    openingStock: 0,
    minStockLevel: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    mrp: 0,
    gstRate: 0,
    taxType: 'NONE',
  });

  /* -------------------------------------------------------------------------- */
  /* FETCH ITEMS */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await itemAPI.getByCompany();
      setItems(res.data.data || []);
    } catch {
      toast.error('Failed to fetch items');
    }
  };

  /* -------------------------------------------------------------------------- */
  /* FORM HANDLERS */
  /* -------------------------------------------------------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      itemCode: '',
      itemName: '',
      category: 'Product',
      description: '',
      unit: 'Pcs',
      hsnCode: '',
      openingStock: 0,
      minStockLevel: 0,
      purchasePrice: 0,
      sellingPrice: 0,
      mrp: 0,
      gstRate: 0,
      taxType: 'NONE',
    });
    setEditingItem(null);
  };

const handleSubmit = async (e) => {
  e.preventDefault();




const normalizedCode = formData.itemCode.trim().toLowerCase();

const exists = items.some(
  (i) =>
    i.itemCode?.trim().toLowerCase() === normalizedCode &&
    (!editingItem || i.id !== editingItem.id)
);

if (exists) {
  toast.error('Item Code already exists');
  return;
}



  try {
    if (editingItem) {
      await itemAPI.update(editingItem.id, formData);
      toast.success('Item updated successfully!');
    } else {
      const payload = {
        ...formData,
        category: formData.category.toUpperCase().replace(' ', '_'),
        unit: formData.unit.toUpperCase(),
      };

      await itemAPI.create(payload);
      toast.success('Item created successfully!');
    }

    setShowModal(false);
    resetForm();
    fetchItems();
  } catch (error) {
    toast.error(
      error.response?.data?.message || 'Failed to save item'
    );
  }
};


  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      itemCode: item.itemCode,
      itemName: item.itemName,
      category: item.category,
      description: item.description || '',
      unit: item.unit,
      hsnCode: item.hsnCode || '',
      openingStock: item.openingStock || 0,
      minStockLevel: item.minStockLevel || 0,
      purchasePrice: item.purchasePrice || 0,
      sellingPrice: item.sellingPrice || 0,
      mrp: item.mrp || 0,
      gstRate: item.gstRate || 0,
      taxType: item.taxType || 'NONE',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await itemAPI.delete(id);
      toast.success('Item deleted successfully!');
      fetchItems();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  /* -------------------------------------------------------------------------- */
  /* UI */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Items</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Add New Item
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Current Stock</th>
              <th>Purchase Price</th>
              <th>Selling Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.itemCode}</td>
                  <td>{item.itemName}</td>
                  <td>{item.category}</td>
                  <td>{item.unit}</td>
                  <td>
                    <span
                      className={
                        item.currentStock <= item.minStockLevel
                          ? 'badge badge-danger'
                          : 'badge badge-success'
                      }
                    >
                      {item.currentStock}
                    </span>
                  </td>
                  <td>₹{item.purchasePrice}</td>
                  <td>₹{item.sellingPrice}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      style={{ marginRight: '8px' }}
                      onClick={() => handleEdit(item)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>
                  No items found. Create your first item!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* MODAL */}
      {/* ---------------------------------------------------------------------- */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Item Code *</label>
                  <input
                    type="text"
                    name="itemCode"
                    className="form-input"
                    value={formData.itemCode}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Item Name *</label>
                  <input
                    type="text"
                    name="itemName"
                    className="form-input"
                    value={formData.itemName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="Product">Product</option>
                    <option value="Service">Service</option>
                    <option value="Raw Material">Raw Material</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Unit *</label>
                  <select
                    name="unit"
                    className="form-select"
                    value={formData.unit}
                    onChange={handleChange}
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Kg">Kg</option>
                    <option value="Ltr">Ltr</option>
                    <option value="Mtr">Mtr</option>
                    <option value="Box">Box</option>
                    <option value="Dozen">Dozen</option>
                    <option value="Ton">Ton</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">HSN Code</label>
                  <input
                    type="text"
                    name="hsnCode"
                    className="form-input"
                    value={formData.hsnCode}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Opening Stock</label>
                  <input
                    type="number"
                    name="openingStock"
                    className="form-input"
                    value={formData.openingStock}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Min Stock Level</label>
                <input
                  type="number"
                  name="minStockLevel"
                  className="form-input"
                  value={formData.minStockLevel}
                  onChange={handleChange}
                />
              </div>

              <h3 style={{ marginTop: '20px', marginBottom: '12px' }}>
                Pricing
              </h3>
              <div className="grid grid-3">
                <div className="form-group">
                  <label className="form-label">Purchase Price *</label>
                  <input
                    type="number"
                    name="purchasePrice"
                    className="form-input"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Selling Price *</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    className="form-input"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">MRP</label>
                  <input
                    type="number"
                    name="mrp"
                    className="form-input"
                    value={formData.mrp}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <h3 style={{ marginTop: '20px', marginBottom: '12px' }}>
                Tax
              </h3>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">GST Rate (%)</label>
                  <input
                    type="number"
                    name="gstRate"
                    className="form-input"
                    value={formData.gstRate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tax Type</label>
                  <select
                    name="taxType"
                    className="form-select"
                    value={formData.taxType}
                    onChange={handleChange}
                  >
                    <option value="NONE">None</option>
                    <option value="GST">GST</option>
                    <option value="IGST">IGST</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end',
                  marginTop: '20px',
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update' : 'Create'} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;
