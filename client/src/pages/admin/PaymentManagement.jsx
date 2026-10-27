import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/common/Spinner';
import { Chip } from '@mui/material';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/payments').then(r => setPayments(r.data.payments)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="container py-4">
      <h2 className="mb-4">Payment Audit</h2>
      {payments.length === 0 ? <div className="alert alert-info">No payments recorded yet.</div> : (
        <div className="table-responsive"><table className="table table-hover align-middle table-sm">
          <thead className="table-dark"><tr><th>Invoice</th><th>User</th><th>Booking</th><th>Amount</th><th>Gateway</th><th>Order ID</th><th>Payment ID</th><th>Status</th><th>Refund</th><th>Date</th></tr></thead>
          <tbody>{payments.map(p => (
            <tr key={p._id}>
              <td><small>{p.invoiceNumber}</small></td>
              <td>{p.user?.name}</td>
              <td><small>{p.booking?.room?.roomNumber || '-'}</small></td>
              <td>₹{p.amount}</td>
              <td>{p.gateway}</td>
              <td><small className="text-muted">{p.gatewayOrderId?.slice(0, 15) || '-'}</small></td>
              <td><small className="text-muted">{p.gatewayPaymentId?.slice(0, 15) || '-'}</small></td>
              <td><Chip label={p.status} size="small" color={p.status === 'captured' ? 'success' : p.status === 'failed' ? 'error' : 'default'} /></td>
              <td>{p.refundStatus}</td>
              <td><small>{new Date(p.createdAt).toLocaleDateString()}</small></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
    </div>
  );
};

export default PaymentManagement;
