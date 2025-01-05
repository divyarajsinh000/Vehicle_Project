import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
// import './TransactionPage.css'; // Add custom styles here
import * as XLSX from 'xlsx'; 
function TransactionList() {
    const [transactions, setTransactions] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({
        TransactionId: '',
        CustomerId: '',
        VehicleNo: '',
        OperationDate: '',
        Price: '',
    });
    // Fetch transactions on page load
   
    const handleEditTranset = (transaction) => {
        setFormData({
            TransactionId: transaction.TransactionId,
            CustomerId: transaction.CustomerId,
            VehicleNo: transaction.VehicleNo,
            Price: transaction.Price,
            OperationDate: new Date(transaction.OperationDate).toISOString().split('T')[0] // Set the date in YYYY-MM-DD format
        });
    };
    // Handle form submission for editing transaction
  const handleEditTransaction = useCallback(async (e) => {
    e.preventDefault();
    try {
        await axios.patch(`http://localhost:5000/transactions/${formData.TransactionId}`, formData);
        alert('Transaction updated successfully!');
        setFormData({
            TransactionId: '',
            CustomerId: '',
            VehicleNo: '',
            Price: '',            OperationDate: ''
        }); // Reset form data
    } catch (error) {
        console.error(error);
        alert('Failed to update transaction.');
    }
}, [formData]);
const handleDeleteTransaction = useCallback((id) => {
    axios.delete(`http://localhost:5000/transactions/${id}`)
        .then(() => {
            setTransactions(transactions.filter(transaction => transaction.TransactionId !== id));
            alert('Transaction deleted successfully');
        })
        .catch((err) => {
            console.error('Error deleting transaction:', err);
            alert('Failed to delete transaction');
        });
},[]);
  const exportToExceltransactions = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(transactions);
        XLSX.utils.book_append_sheet(wb, ws, 'transactions');
        XLSX.writeFile(wb, 'transactions.xlsx');
    };
useEffect(() => {
    axios.get('http://localhost:5000/customers')
    .then((res) => {
        setCustomers(res.data);
    })
    .catch((err) => {
        console.error('Error fetching customer data:', err);
    });
    axios.get('http://localhost:5000/transactions')
        .then((res) => {
            setTransactions(res.data);
        })
        .catch((err) => {
            console.error('Error fetching transaction data:', err);
        });
}, [handleDeleteTransaction,handleEditTransaction]);
    return (
        <div className="transaction-page">
          
                {/* Transactions Table */}
                <div className="table-container">
                    <h2>Transactions</h2>
                    <Link to="/add-transaction">
                <button className="dashboard-button">Add Transaction</button>
            </Link>
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Customer Name</th>
                                <th>Vehicle No</th>
                                <th>Price</th>
                                <th>Operation Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length > 0 ? (
                                transactions.map((transaction) => (
                                    <tr key={transaction.TransactionId}>
                                        <td>{transaction.TransactionId}</td>
                                        <td>{transaction.CustomerName }</td>
                                        <td>{transaction.VehicleNo}</td>
                                        <td>{transaction.Price}</td>
                                        <td>{new Date(transaction.OperationDate).toLocaleDateString()}</td>
                                        <td>
                                            <button onClick={() => handleEditTranset(transaction)}>Edit</button>
                                            <button onClick={() => handleDeleteTransaction(transaction.TransactionId)}>Delete</button>
                                            <button className="export-button" onClick={exportToExceltransactions}>
                    Export to Excel
                </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">No transactions available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {formData.TransactionId && (
    <div className="modal-overlay">
        <div className="modal-content">
            <div className="modal-header">
                <h3>Edit Transaction</h3>
                <button
                    onClick={() => setFormData({ TransactionId: "" })}
                    className="close-btn"
                >
                    &times;
                </button>
            </div>
            <form onSubmit={handleEditTransaction}>
                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="CustomerId">Customer Name:</label>
                        <select
                            id="CustomerId"
                            value={formData.CustomerId}
                            onChange={(e) =>
                                setFormData({ ...formData, CustomerId: e.target.value })
                            }
                            required
                        >
                            <option value="">Select Customer</option>
                            {customers.map((customer) => (
                                <option key={customer.CustomerId} value={customer.CustomerId}>
                                    {customer.CustomerName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="VehicleNo">Vehicle No:</label>
                        <input
                            type="text"
                            id="VehicleNo"
                            value={formData.VehicleNo}
                            onChange={(e) =>
                                setFormData({ ...formData, VehicleNo: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="Price">Price:</label>
                        <input
                            type="text"
                            id="Price"
                            value={formData.Price}
                            onChange={(e) =>
                                setFormData({ ...formData, Price: e.target.value })
                            }
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="OperationDate">Operation Date:</label>
                        <input
                            type="date"
                            id="OperationDate"
                            value={formData.OperationDate}
                            onChange={(e) =>
                                setFormData({ ...formData, OperationDate: e.target.value })
                            }
                            required
                        />
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="submit" className="save-btn">
                        Save Changes
                    </button>
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => setFormData({ TransactionId: "" })}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
)}
        </div>
    );
}

export default TransactionList;
