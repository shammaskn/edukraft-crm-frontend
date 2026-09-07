'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi, GeneratedEmail } from '@/lib/api/ai';
import { Lead } from '@/types';
import { X, Loader2, Copy, RefreshCw, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  lead: Lead;
  onClose: () => void;
}

export default function EmailGeneratorModal({ lead, onClose }: Props) {
  const [email, setEmail] = useState<GeneratedEmail | null>(null);
  const [copied, setCopied] = useState(false);

  const generateMutation = useMutation({
    mutationFn: () => aiApi.generateLeadEmail(lead.id),
    onSuccess: (data) => {
      setEmail(data);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate email');
    },
  });

  const handleCopy = () => {
    if (!email) return;
    const fullEmail = `Subject: ${email.subject}\n\n${email.body}`;
    navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    toast.success('Email copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
   <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            AI Email Generator
          </h2>
          <p className="text-sm text-gray-500">
            For {lead.firstName} {lead.lastName}
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      {/* Generate button or email */}
      {!email ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm mb-6">
            AI will generate a professional follow-up email based on this lead's details.
          </p>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 mx-auto"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>✨ Generate Email</>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              SUBJECT
            </label>
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-900 font-medium">
              {email.subject}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              BODY
            </label>
            <div className="bg-gray-50 rounded-lg px-3 py-3 text-sm text-gray-700 whitespace-pre-wrap">
              {email.body}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {generateMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Regenerate
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              {copied ? (
                <>
                  <Check size={14} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy Email
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  </div>
</div>
  );
}