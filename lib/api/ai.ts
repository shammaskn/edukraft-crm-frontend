import api from '@/lib/axios';

export interface GeneratedEmail {
  subject: string;
  body: string;
}

export const aiApi = {
  generateLeadEmail: async (leadId: string): Promise<GeneratedEmail> => {
    const res = await api.post(`/ai/leads/${leadId}/generate-email`);
    return res.data.data;
  },
};