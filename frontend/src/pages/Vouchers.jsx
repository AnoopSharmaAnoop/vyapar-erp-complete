import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { voucherAPI, itemAPI, ledgerAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaEye } from 'react-icons/fa';
import { FaEdit } from 'react-icons/fa';

import { format } from 'date-fns';

const Vouchers = () => {
  const { selectedCompany } = useApp();
  const [vouchers, setVouchers] = useState([]);
  const [items, setItems] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
const [formData, setFormData] = useState({
  voucherNumber: '',
  voucherType: 'Sales Invoice',
  voucherDate: new Date().toISOString().split('T')[0],
  party: '',
  items: [],
  paymentMode: 'CASH',

  subTotal: 0,
  totalDiscount: 0,
  totalTax: 0,
  totalAmount: 0,
  amountPaid: 0,
  balanceAmount: 0,

  narration: '',
  status: 'Pending',

  debitLedgerId: null,
  creditLedgerId: null,
  journalAmount: 0
});


  const PARTY_REQUIRED_VOUCHERS = [
  'Sales Invoice',
  'Purchase Invoice',
  'Receipt',
  'Payment',
  'Debit Note',
  'Credit Note',
];



const VOUCHER_TYPE_MAP = {
  'Sales Invoice': 'SALES_INVOICE',
  'Purchase Invoice': 'PURCHASE_INVOICE',
  'Payment': 'PAYMENT',
  'Receipt': 'RECEIPT',
  'Journal': 'JOURNAL',
  'Debit Note': 'DEBIT_NOTE',
  'Credit Note': 'CREDIT_NOTE',
};

const STATUS_MAP = {
  'Pending': 'PENDING',
  'Paid': 'PAID',
  'Cancelled': 'CANCELLED',
  'Partially Paid': 'PARTIALLY_PAID'
};



  const [currentItem, setCurrentItem] = useState({
    item: '',
    quantity: 1,
    rate: 0,
    discount: 0,
    taxAmount: 0,
    amount: 0
  });

  useEffect(() => {
    if (selectedCompany) {
      fetchVouchers();
      fetchItems();
      fetchLedgers();
    }
  }, [selectedCompany]);

  const fetchVouchers = async () => {
    try {
      const response = await voucherAPI.getByCompany(selectedCompany.id, {});
      setVouchers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch vouchers');
    }
  };

  const fetchItems = async () => {
    try {
      const response = await itemAPI.getByCompany(selectedCompany.id);
      setItems(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch items');
    }
  };

 const fetchLedgers = async () => {
  try {
    const response = await ledgerAPI.getByCompany();
    setLedgers(response.data.data);
  } catch (error) {
    console.error(error);
    toast.error('Failed to fetch ledgers');
  }
};

const handleItemChange = (e) => {
  const { name, value } = e.target;

  if (name === "item") {
    const id = Number(value);

    const selectedItem = items.find(i => i.id === id);

    setCurrentItem({
      item: id,
      quantity: 1,
      rate: selectedItem?.pricing?.sellingPrice || 0,
      discount: 0,
      taxAmount: 0,
      amount: selectedItem?.pricing?.sellingPrice || 0
    });

    return;
  }

  const updatedItem = {
    ...currentItem,
    [name]: Number(value)
  };

  updatedItem.amount =
    updatedItem.quantity * updatedItem.rate -
    updatedItem.discount +
    updatedItem.taxAmount;

  setCurrentItem(updatedItem);
};




  useEffect(() => {
    const amount = (currentItem.quantity * currentItem.rate) - currentItem.discount + currentItem.taxAmount;
    setCurrentItem(prev => ({ ...prev, amount }));
  }, [currentItem.quantity, currentItem.rate, currentItem.discount, currentItem.taxAmount]);

const addItem = () => {
console.log("Adding item:", currentItem);


  if (!currentItem.item) {
    toast.error("Select item first");
    return;
  }

 
setFormData(prev => {
  const updated = {
    ...prev,
    items: [...prev.items, currentItem]
  };
  console.log("Updated voucher items:", updated.items);
  return updated;
});


  setCurrentItem({
    item: "",
    quantity: 1,
    rate: 0,
    discount: 0,
    taxAmount: 0,
    amount: 0
  });
};


  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    const subTotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const totalDiscount = formData.items.reduce((sum, item) => sum + item.discount, 0);
    const totalTax = formData.items.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalAmount = subTotal - totalDiscount + totalTax;
    const balanceAmount = totalAmount - formData.amountPaid;

    setFormData(prev => ({
      ...prev,
      subTotal,
      totalDiscount,
      totalTax,
      totalAmount,
      balanceAmount
    }));
  }, [formData.items, formData.amountPaid]);

const buildVoucherPayload = () => {

 const payload = {
  voucherNumber: formData.voucherNumber,
  voucherType: formData.voucherType,
  voucherDate: formData.voucherDate,
  narration: formData.narration,

  totalAmount:
    formData.voucherType === 'Journal'
      ? Number(formData.journalAmount)
      : ['Receipt', 'Payment'].includes(formData.voucherType)
      ? Number(formData.voucherAmount)
      : Number(formData.totalAmount),

  amountPaid:
    ['Receipt', 'Payment'].includes(formData.voucherType)
      ? Number(formData.voucherAmount)
      : Number(formData.amountPaid),

  paymentMode: formData.paymentMode,
  party: formData.party
};

  if (formData.party && formData.voucherType !== 'Journal') {
    payload.party = Number(formData.party);
  }

  if (['Sales Invoice', 'Purchase Invoice'].includes(formData.voucherType)) {
    payload.items = formData.items.map(item => ({
      itemId: Number(item.item),
      quantity: Number(item.quantity),
      rate: Number(item.rate),
      discount: Number(item.discount || 0),
      amount: Number(item.amount),
    }));
  }

  if (formData.voucherType === 'Journal') {
    payload.journalEntries = [
      {
        ledgerId: Number(formData.debitLedgerId),
        debit: Number(formData.journalAmount),
        credit: 0
      },
      {
        ledgerId: Number(formData.creditLedgerId),
        debit: 0,
        credit: Number(formData.journalAmount)
      }
    ];
  }

  return payload;
};


const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Items:", formData.items);

  
  const itemRequiredTypes = ['Sales Invoice', 'Purchase Invoice'];

  if (
    itemRequiredTypes.includes(formData.voucherType) &&
    formData.items.length === 0
  ) {
    toast.error('Please add at least one item');
    console.log("itemslength"+formData.items.length);
    return;
  }

  try {

    // ✅ ADD CONSOLE HERE
    console.log(
      "Ledger values before validation:",
      formData.debitLedgerId,
      formData.creditLedgerId
    );

    if (formData.voucherType === 'Journal') {
      if (!formData.debitLedgerId || !formData.creditLedgerId) {
        toast.error("Select both Debit and Credit ledger");
        return;
      }
    }

    const data = buildVoucherPayload();
    console.log("FINAL PAYLOAD:", data);
    console.log("JSON:", JSON.stringify(data, null, 2));


    await voucherAPI.create(data);
    toast.success('Voucher created successfully!');
    setShowModal(false);
    resetForm();
    fetchVouchers();

  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to create voucher');
  }
};



 
  const handleView = (voucher) => {
    setSelectedVoucher(voucher);
    setViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      company: '',
      voucherNumber: '',
      voucherType: 'Sales Invoice',
      voucherDate: new Date().toISOString().split('T')[0],
      party: null,
      items: [],
      paymentMode: 'Cash',
      subTotal: 0,
      totalDiscount: 0,
      totalTax: 0,
      totalAmount: 0,
      amountPaid: 0,
      balanceAmount: 0,
      narration: '',
      status: 'Pending'
    });
  };

  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData(prev => ({
    ...prev,
    [name]: value === '' ? null : value
  }));
};




  const getStatusBadge = (status) => {
    const badges = {
      'Paid': 'badge-success',
      'Pending': 'badge-warning',
      'Partially Paid': 'badge-info',
      'Cancelled': 'badge-danger'
    };
    return badges[status] || 'badge-info';
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Vouchers</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Create Voucher
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Voucher No.</th>
              <th>Type</th>
              <th>Date</th>
              <th>Party</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((voucher) => (
              <tr key={voucher.id}>
                <td>{voucher.voucherNumber}</td>
                <td>{voucher.voucherType}</td>
                <td>{format(new Date(voucher.voucherDate), 'dd/MM/yyyy')}</td>
                <td>{voucher.party?.ledgerName}</td>
                <td>₹{voucher.totalAmount.toFixed(2)}</td>
                <td>
                  <span className={`badge ${getStatusBadge(voucher.status)}`}>
                    {voucher.status}
                  </span>
                </td>
                <td>
                <td>
  <button className="btn btn-primary" onClick={() => handleView(voucher)}>
    <FaEye />
  </button>

  <button className="btn btn-warning" onClick={() => handleEdit(voucher)}>
    <FaEdit />
  </button>

  <button
    className="btn btn-danger"
    onClick={() => handleDelete(voucher.id)}
  >
    <FaTrash />
  </button>
</td>

                
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {vouchers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>No vouchers found. Create your first voucher!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" style={{ maxWidth: '900px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Create Voucher</h2>
              <button className="close-btn" onClick={() => { setShowModal(false); resetForm(); }}>×</button>
            </div>
<form onSubmit={handleSubmit}>
  <div className="grid grid-3">
    
    <div className="form-group">
      <label>Voucher Number</label>
      <p><strong>Auto Generated</strong></p>
    </div>

    <div className="form-group">
      <label>Voucher Type</label>
      <select
        name="voucherType"
        className="form-select"
        value={formData.voucherType}
        onChange={handleChange}
      >
        <option value="Sales Invoice">Sales Invoice</option>
        <option value="Purchase Invoice">Purchase Invoice</option>
        <option value="Payment">Payment</option>
        <option value="Receipt">Receipt</option>
        <option value="Journal">Journal</option>
        <option value="Debit Note">Debit Note</option>
        <option value="Credit Note">Credit Note</option>
      </select>
    </div>

    <div className="form-group">
      <label>Date</label>
      <input
        type="date"
        name="voucherDate"
        className="form-input"
        value={formData.voucherDate}
        onChange={handleChange}
      />
    </div>
  </div>

  {/* PARTY */}
  {formData.voucherType !== 'Journal' && (
    <div className="form-group">
      <label>Party</label>
      <select
        name="party"
        className="form-select"
        value={formData.party || ''}
        onChange={handleChange}
      >
        <option value="">Select Party</option>
        {ledgers.map(l => (
          <option key={l.id} value={l.id}>
            {l.ledgerName}
          </option>
        ))}
      </select>
    </div>
  )}


{['Receipt', 'Payment'].includes(formData.voucherType) && (
  <div className="form-group">
    <label>Amount</label>
    <input
      type="number"
      name="voucherAmount"
      className="form-input"
      value={formData.voucherAmount}
      onChange={handleChange}
    />
  </div>
)}



  {/* ITEM SECTION */}
  {['Sales Invoice', 'Purchase Invoice'].includes(formData.voucherType) && (
    <>
      <h3 style={{ marginTop: 20 }}>Add Items</h3>

      <div className="grid grid-4">
        <div className="form-group">
          <label>Item</label>
          <select
            name="item"
            className="form-select"
            value={currentItem.item || ''}
            onChange={handleItemChange}
          >
            <option value="">Select Item</option>
            {items.map(i => (
              <option key={i.id} value={i.id}>
                {i.itemName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Qty</label>
          <input
            type="number"
            name="quantity"
            className="form-input"
            value={currentItem.quantity}
            onChange={handleItemChange}
          />
        </div>

        <div className="form-group">
          <label>Rate</label>
          <input
            type="number"
            name="rate"
            className="form-input"
            value={currentItem.rate}
            onChange={handleItemChange}
          />
        </div>

        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            className="form-input"
            value={currentItem.amount}
            disabled
          />
        </div>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        onClick={addItem}
        style={{ marginTop: 10 }}
      >
        Add Item
      </button>
    </>
  )}

  {/* ADDED ITEMS TABLE */}
  {formData.items.length > 0 && (
    <table className="table" style={{ marginTop: 20 }}>
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>Amount</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {formData.items.map((item, index) => {
          const itemDetails = items.find(i => i.id === item.item);

          return (
            <tr key={index}>
              <td>{itemDetails?.itemName}</td>
              <td>{item.quantity}</td>
              <td>{item.rate}</td>
              <td>{item.amount}</td>
              <td>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeItem(index)}
                >
                  Remove
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  )}

  {/* JOURNAL ENTRY */}
  {formData.voucherType === 'Journal' && (
    <div className="grid grid-3" style={{ marginTop: 20 }}>
      <div className="form-group">
        <label>Debit Ledger</label>
        <select
          className="form-select"
          value={formData.debitLedgerId || ''}
          onChange={e =>
            setFormData(prev => ({
              ...prev,
              debitLedgerId: Number(e.target.value)
            }))
          }
        >
          <option value="">Select</option>
          {ledgers.map(l => (
            <option key={l.id} value={l.id}>
              {l.ledgerName}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Credit Ledger</label>
        <select
          className="form-select"
          value={formData.creditLedgerId || ''}
          onChange={e =>
            setFormData(prev => ({
              ...prev,
              creditLedgerId: Number(e.target.value)
            }))
          }
        >
          <option value="">Select</option>
          {ledgers.map(l => (
            <option key={l.id} value={l.id}>
              {l.ledgerName}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Amount</label>
        <input
          type="number"
          name="journalAmount"
          className="form-input"
          value={formData.journalAmount}
          onChange={handleChange}
        />
      </div>
    </div>
  )}

  <div className="form-group" style={{ marginTop: 20 }}>
    <label>Payment Mode</label>
    <select
      name="paymentMode"
      className="form-select"
      value={formData.paymentMode}
      onChange={handleChange}
    >
      <option value="Cash">Cash</option>
      <option value="Bank">Bank</option>
      <option value="UPI">UPI</option>
      <option value="Cheque">Cheque</option>
    </select>
  </div>

  <div style={{ textAlign: 'right', marginTop: 20 }}>
    <button type="submit" className="btn btn-primary">
      Create Voucher
    </button>
  </div>
</form>


          </div>
        </div>
      )}

      {viewModal && selectedVoucher && (
        <div className="modal-overlay" onClick={() => setViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Voucher Details</h2>
              <button className="close-btn" onClick={() => setViewModal(false)}>×</button>
            </div>

            <div>
              <div className="grid grid-2">
                <div>
                  <p><strong>Voucher Number:</strong> {selectedVoucher.voucherNumber}</p>
                  <p><strong>Type:</strong> {selectedVoucher.voucherType}</p>
                  <p><strong>Date:</strong> {format(new Date(selectedVoucher.voucherDate), 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <p><strong>Party:</strong> {selectedVoucher.party?.ledgerName}</p>
                  {/* ITEMS SECTION — ONLY FOR SALES/PURCHASE */}
{['Sales Invoice', 'Purchase Invoice'].includes(formData.voucherType) && (
  <>
    <h3 style={{ marginTop: '20px' }}>Add Items</h3>

    <div className="grid grid-4">
      <div className="form-group">
        <label>Item</label>
       <select
  name="item"
  className="form-select"
  value={currentItem.item || ''}
  onChange={handleItemChange}
>
  <option value="">Select Item</option>
  {items.map(i => (
    <option key={i.id} value={i.id}>
      {i.itemName}
    </option>
  ))}
</select>

      </div>

      <div className="form-group">
        <label>Quantity</label>
        <input
          type="number"
          name="quantity"
          className="form-input"
          value={currentItem.quantity}
          onChange={handleItemChange}
        />
      </div>

      <div className="form-group">
        <label>Rate</label>
        <input
          type="number"
          name="rate"
          className="form-input"
          value={currentItem.rate}
          onChange={handleItemChange}
        />
      </div>

      <div className="form-group">
        <label>Amount</label>
        <input
          type="number"
          className="form-input"
          value={currentItem.amount}
          disabled
        />
      </div>
    </div>

    <button
      type="button"
      className="btn btn-primary"
      onClick={addItem}
      style={{ marginTop: '10px' }}
    >
      Add Item
    </button>
  </>
)}

                  <p><strong>Payment Mode:</strong> {selectedVoucher.paymentMode}</p>
                  <p><strong>Status:</strong> <span className={`badge ${getStatusBadge(selectedVoucher.status)}`}>
                    {selectedVoucher.status}
                  </span></p>
                </div>
              </div>

              <h3 style={{ marginTop: '20px', marginBottom: '12px' }}>Items</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVoucher.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.item?.itemName}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.rate}</td>
                      <td>₹{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="card" style={{ marginTop: '20px', background: '#f0f9ff' }}>
                <p><strong>Sub Total:</strong> ₹{selectedVoucher.subTotal.toFixed(2)}</p>
                <p><strong>Total Discount:</strong> ₹{selectedVoucher.totalDiscount.toFixed(2)}</p>
                <p><strong>Total Tax:</strong> ₹{selectedVoucher.totalTax.toFixed(2)}</p>
                <h3 style={{ color: '#2563eb', marginTop: '12px' }}>
                  Total Amount: ₹{selectedVoucher.totalAmount.toFixed(2)}
                </h3>
                <p style={{ marginTop: '8px' }}>
                  <strong>Amount Paid:</strong> ₹{selectedVoucher.amountPaid.toFixed(2)}
                </p>
                <p><strong>Balance:</strong> ₹{selectedVoucher.balanceAmount.toFixed(2)}</p>
              </div>

              {selectedVoucher.narration && (
                <div style={{ marginTop: '16px' }}>
                  <strong>Narration:</strong>
                  <p>{selectedVoucher.narration}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vouchers;
