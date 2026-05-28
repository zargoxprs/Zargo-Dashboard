import { apiClient, mockOr } from "@/api/client";
import { Employee } from "@/types";
import { useStore } from "@/data/store";


const MOCK_EMPLOYEE_USER_STORE_KEY = "mock_employee_users";

const saveMockEmployeeUser = (email: string, role: string) => {
  try {
    const users = JSON.parse(localStorage.getItem(MOCK_EMPLOYEE_USER_STORE_KEY) || "[]");
    const normalizedEmail = email.toLowerCase();
    const username = normalizedEmail.split("@")[0];
    const password = "Welcome123";
    const nextId = `U${Date.now()}`;
    const user = { username, email: normalizedEmail, password, user: { id: nextId, username, email: normalizedEmail, role: role === "Admin" ? "admin" : "staff" } };
    const filtered = users.filter((u: any) => u.email.toLowerCase() !== normalizedEmail);
    localStorage.setItem(MOCK_EMPLOYEE_USER_STORE_KEY, JSON.stringify([...filtered, user]));
    return { email: normalizedEmail, password };
  } catch {
    return { email, password: "Welcome123" };
  }
};

export const employeeService = {
  async list(): Promise<Employee[]> {
    return mockOr(
      () => useStore.getState().employees,
      async () => (await apiClient.get<Employee[]>("/employees")).data
    );
  },

  async create(payload: Omit<Employee, "id">): Promise<Employee | { employee: Employee; credentials: { email: string; password: string } }> {
    return mockOr(
      () => {
        useStore.getState().addEmployee(payload);
        const list = useStore.getState().employees;

        const employee = list[list.length - 1];
        const credentials = saveMockEmployeeUser(payload.email, payload.role);
        return { employee, credentials };
      },
      async () => (await apiClient.post<{ employee: Employee; credentials: { email: string; password: string } }>("/employees", payload)).data
    );
  },
  async delete(id: string): Promise<void> {
    return mockOr(
      () => {
        useStore.getState().removeEmployee(id);
      },
      async () => {
        await apiClient.delete(`/employees/${id}`);
      }
    );
  },
};