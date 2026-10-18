import { useState } from 'react';
import { api } from '../../lib/api';
import { useAction } from '../../lib/directory';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { TextInput } from '../ui/Field';

export const ResetPasswordDialog = ({ user, onClose }: { user: { userId: string; name: string; phone: string }; onClose: () => void }) => {
  const [password, setPassword] = useState('');
  const reset = useAction(() => api.updateUser(user.userId, { password }), {
    success: `Temporary password set for ${user.name}. They are signed out everywhere.`,
    onDone: onClose
  });

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Set a temporary password for ${user.name}`}
      description={`Call ${user.phone} first to confirm it’s them, then tell them this password and ask them to change it in the app.`}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={password.length < 8} loading={reset.isPending} onClick={() => reset.mutate(undefined)}>
            Set password
          </Button>
        </>
      }
    >
      <TextInput label="Temporary password" value={password} onChange={e => setPassword(e.target.value)} hint="At least 8 characters" autoComplete="off" />
    </Dialog>
  );
};
