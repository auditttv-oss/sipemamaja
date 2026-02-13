import React, { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { 
  MOCK_COMPLAINTS, 
  MOCK_UNITS, 
  MOCK_INVOICES, 
  MOCK_CLUSTER_EXPENSES,
  MOCK_CLUSTERS,
  MOCK_VENDORS,
  MOCK_LEADS,
  MOCK_USERS,
  MOCK_PAYMENTS,
  MOCK_HOUSE_TYPES
} from './constants';
import { 
  Complaint, 
  UnitData, 
  Invoice, 
  ClusterExpense, 
  ComplaintStatus, 
  InvoiceStatus,
  Cluster,
  Vendor,
  Lead,
  User,
  Payment,
  HouseType
} from './types';
import * as complaintService from './services/complaintService';
import * as userService from './services/userService';

interface DataContextType {
  complaints: Complaint[];
  units: UnitData[];
  invoices: Invoice[];
  expenses: ClusterExpense[];
  clusters: Cluster[]; 
  vendors: Vendor[];
  leads: Lead[];
  users: User[];
  payments: Payment[];
  houseTypes: HouseType[];
  
  // Complaint CRUD
  addComplaint: (complaint: Complaint) => void;
  updateComplaintStatus: (id: string, status: ComplaintStatus) => void;
  
  // Unit CRUD
  addUnit: (unit: UnitData) => void;
  updateUnit: (unit: UnitData) => void;
  deleteUnit: (id: string) => void;
  
  // Invoice CRUD
  payInvoice: (id: string) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  
  // Payment CRUD
  submitPayment: (payment: Payment) => void;
  verifyPayment: (id: string) => void;
  
  // Expense CRUD
  addExpense: (expense: ClusterExpense) => void;
  updateExpense: (expense: ClusterExpense) => void;
  deleteExpense: (id: string) => void;
  
  // Cluster CRUD
  addCluster: (cluster: Cluster) => void;
  updateCluster: (cluster: Cluster) => void;
  deleteCluster: (id: string) => void;

  // Vendor CRUD
  addVendor: (vendor: Vendor) => void;
  updateVendor: (vendor: Vendor) => void;
  deleteVendor: (id: string) => void;

  // Marketing/Leads CRUD
  addLead: (lead: Lead) => void;
  updateLead: (lead: Lead) => void;
  deleteLead: (id: string) => void;

  // User CRUD
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;

  // House Type CRUD
  addHouseType: (houseType: HouseType) => void;
  updateHouseType: (houseType: HouseType) => void;
  deleteHouseType: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state with Mock Data
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [units, setUnits] = useState<UnitData[]>(MOCK_UNITS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [expenses, setExpenses] = useState<ClusterExpense[]>(MOCK_CLUSTER_EXPENSES);
  const [clusters, setClusters] = useState<Cluster[]>(MOCK_CLUSTERS);
  const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [houseTypes, setHouseTypes] = useState<HouseType[]>(MOCK_HOUSE_TYPES);

  useEffect(() => {
    complaintService.getComplaints().then(setComplaints).catch(console.error);
  }, []);

  useEffect(() => {
    userService.getUsers().then(setUsers).catch(console.error);
  }, []);

  // Complaints
  const addComplaint = (newComplaint: Complaint) => {
    const { id, createdAt, ...complaintData } = newComplaint;
    complaintService.addComplaint(complaintData).then(added => {
      setComplaints(prev => [added, ...prev]);
    }).catch(console.error);
  };

  const updateComplaintStatus = (id: string, status: ComplaintStatus) => {
    complaintService.updateComplaintStatus(id, status).then(() => {
      setComplaints(prev => prev.map(c => 
        c.id === id ? { ...c, status: status } : c
      ));
    }).catch(console.error);
  };

  // Units
  const addUnit = (newUnit: UnitData) => {
    setUnits(prev => [newUnit, ...prev]);
  };

  const updateUnit = (updatedUnit: UnitData) => {
    setUnits(prev => prev.map(u => u.id === updatedUnit.id ? updatedUnit : u));
  };

  const deleteUnit = (id: string) => {
    setUnits(prev => prev.filter(u => u.id !== id));
  };

  // Invoices
  const payInvoice = (id: string) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, status: InvoiceStatus.PAID } : inv
    ));
  };

  const addInvoice = (newInvoice: Invoice) => {
    setInvoices(prev => [newInvoice, ...prev]);
  };

  const updateInvoice = (updatedInvoice: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  // Payments
  const submitPayment = (newPayment: Payment) => {
    setPayments(prev => [newPayment, ...prev]);
  };

  const verifyPayment = (id: string) => {
    setPayments(prev => prev.map(p => 
      p.id === id ? { ...p, status: 'verified' as const } : p
    ));
    // Find user's unpaid invoices and mark as paid
    const payment = payments.find(p => p.id === id);
    if (payment) {
      setInvoices(prev => prev.map(inv => 
        inv.unitId === payment.userId && inv.status !== InvoiceStatus.PAID 
          ? { ...inv, status: InvoiceStatus.PAID } 
          : inv
      ));
    }
  };

  // Expenses
  const addExpense = (newExpense: ClusterExpense) => {
    setExpenses(prev => [newExpense, ...prev]);
  };

  const updateExpense = (updatedExpense: ClusterExpense) => {
    setExpenses(prev => prev.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  // Clusters
  const addCluster = (newCluster: Cluster) => {
    setClusters(prev => [...prev, newCluster]);
  };

  const updateCluster = (updatedCluster: Cluster) => {
    setClusters(prev => prev.map(c => 
      c.id === updatedCluster.id ? updatedCluster : c
    ));
  };

  const deleteCluster = (id: string) => {
    setClusters(prev => prev.filter(c => c.id !== id));
  };

  // Vendors
  const addVendor = (newVendor: Vendor) => {
    setVendors(prev => [...prev, newVendor]);
  };

  const updateVendor = (updatedVendor: Vendor) => {
    setVendors(prev => prev.map(v => v.id === updatedVendor.id ? updatedVendor : v));
  };

  const deleteVendor = (id: string) => {
    setVendors(prev => prev.filter(v => v.id !== id));
  };

  // Leads (Marketing)
  const addLead = (newLead: Lead) => {
    setLeads(prev => [newLead, ...prev]);
  }

  const updateLead = (updatedLead: Lead) => {
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
  }

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  }

  // Users
  const addUser = (newUser: User) => {
    const { id, ...userData } = newUser;
    userService.addUser(userData).then(added => {
      setUsers(prev => [...prev, added]);
    }).catch(console.error);
  };

  const updateUser = (updatedUser: User) => {
    userService.updateUser(updatedUser).then(() => {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }).catch(console.error);
  };

  const deleteUser = (id: string) => {
    userService.deleteUser(id).then(() => {
      setUsers(prev => prev.filter(u => u.id !== id));
    }).catch(console.error);
  };

  // House Types
  const addHouseType = (newHouseType: HouseType) => {
    setHouseTypes(prev => [newHouseType, ...prev]);
  };

  const updateHouseType = (updatedHouseType: HouseType) => {
    setHouseTypes(prev => prev.map(ht => ht.id === updatedHouseType.id ? updatedHouseType : ht));
  };

  const deleteHouseType = (id: string) => {
    setHouseTypes(prev => prev.filter(ht => ht.id !== id));
  };

  return (
    <DataContext.Provider value={{
      complaints,
      units,
      invoices,
      expenses,
      clusters,
      vendors,
      leads,
      users,
      payments,
      houseTypes,
      addComplaint,
      updateComplaintStatus,
      addUnit,
      updateUnit,
      deleteUnit,
      payInvoice,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      submitPayment,
      verifyPayment,
      addExpense,
      updateExpense,
      deleteExpense,
      addCluster,
      updateCluster,
      deleteCluster,
      addVendor,
      updateVendor,
      deleteVendor,
      addLead,
      updateLead,
      deleteLead,
      addUser,
      updateUser,
      deleteUser,
      addHouseType,
      updateHouseType,
      deleteHouseType
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};