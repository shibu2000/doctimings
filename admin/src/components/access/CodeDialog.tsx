import { useState } from 'react';
import { Check, Copy, KeyRound } from 'lucide-react';
import type { CreatedInvite } from '../../lib/types';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';

export const CodeDialog = ({ invite, onClose, audience }: { invite: CreatedInvite; onClose: () => void; audience: string }) => {
  const [copied, setCopied] = useState(false);
  const expires = new Date(invite.invitation.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
  const message = `Your DocTimings Partner code is ${invite.code}. Open the DocTimings Partner app, tap "Activate with a code" and enter it. It works once and expires on ${expires}.`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title="Access code created"
      description={`Give this code to ${invite.invitation.name} (${invite.invitation.phone}) ${audience}.`}
      footer={
        <>
          <Button variant="outline" icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} onClick={copy}>
            {copied ? 'Copied' : 'Copy message'}
          </Button>
          <Button onClick={onClose}>Done</Button>
        </>
      }
    >
      <div className="rounded-xl border-2 border-dashed border-teal-300 bg-teal-50 px-4 py-5 text-center">
        <KeyRound className="w-6 h-6 text-teal-700 mx-auto mb-2" />
        <p className="font-mono text-3xl font-bold tracking-[0.2em] text-teal-900 select-all">{invite.code}</p>
        <p className="mt-2 text-sm text-teal-800">Works once · expires {expires}</p>
      </div>
      <ul className="mt-4 space-y-1.5 text-sm text-slate-600 list-disc pl-5">
        <li>This is the only time the code is shown. It is stored securely and cannot be looked up later.</li>
        <li>Share it by phone call, SMS or WhatsApp with the person directly.</li>
        <li>If it is lost or sent to the wrong person, cancel it and create a new one.</li>
      </ul>
    </Dialog>
  );
};
