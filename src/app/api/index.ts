import axios,{AxiosInstance} from 'axios'
class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:8080') {
    this.client = axios.create({ baseURL });
  }

  async get<T>(url: string, params?: any): Promise<any> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data: any, headers?: any): Promise<any> {
    const response = await this.client.post<T>(url, data, { headers });
    return response.data;
  }

  async put<T>(url: string, data: any): Promise<any> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<any> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }
}
export default new ApiClient()