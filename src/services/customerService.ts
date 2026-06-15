import { apiClient, mockOr } from "@/api/client";
import { Customer } from "@/types";

// Mock data storage for customers
const CUSTOMERS_STORAGE_KEY = "zargo_customers";

const getMockCustomers = (): Customer[] => {
  try {
    const stored = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveMockCustomers = (customers: Customer[]) => {
  try {
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
  } catch {
    // ignore
  }
};

const generateCustomerId = () => `CUST-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

export const customerService = {
  async list(): Promise<Customer[]> {
    return mockOr(
      () => getMockCustomers(),
      async () => {
        const { data } = await apiClient.get<Customer[]>("/customers");
        return data;
      }
    );
  },

  async create(payload: Omit<Customer, "id" | "customerId" | "createdAt">): Promise<Customer> {
    return mockOr(
      () => {
        const customer: Customer = {
          id: `customer_${Date.now()}`,
          customerId: generateCustomerId(),
          createdAt: new Date().toISOString(),
          ...payload,
        };
        const existing = getMockCustomers();
        const updated = [...existing, customer];
        saveMockCustomers(updated);
        return customer;
      },
      async () => {
        const { data } = await apiClient.post<Customer>("/customers", payload);
        return data;
      }
    );
  },

  async update(id: string, patch: Partial<Customer>): Promise<Customer> {
    return mockOr(
      () => {
        const customers = getMockCustomers();
        const index = customers.findIndex((c) => c.id === id);
        if (index === -1) throw { message: "Customer not found" };
        const updated = { ...customers[index], ...patch };
        customers[index] = updated;
        saveMockCustomers(customers);
        return updated;
      },
      async () => {
        const { data } = await apiClient.patch<Customer>(`/customers/${id}`, patch);
        return data;
      }
    );
  },

  async delete(id: string): Promise<void> {
    return mockOr(
      () => {
        const customers = getMockCustomers();
        const filtered = customers.filter((c) => c.id !== id);
        saveMockCustomers(filtered);
      },
      async () => {
        await apiClient.delete(`/customers/${id}`);
      }
    );
  },
};
