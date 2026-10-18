import { api } from '../../lib/api';
import { useAction } from '../../lib/directory';
import type { Establishment } from '../../lib/types';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { EstablishmentForm } from './EstablishmentForm';

interface Props {
  open: boolean;
  onClose: () => void;
  initialName?: string;
  defaults?: { district?: string; subDistrict?: string };
  onCreated: (establishment: Establishment) => void;
}

export const NewEstablishmentDialog = ({ open, onClose, initialName, defaults, onCreated }: Props) => {
  const create = useAction(api.createEstablishment, {
    success: e => `${e.name} added`,
    onDone: e => {
      onCreated(e);
      onClose();
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New establishment"
      description="A pharmacy, chamber, clinic or hospital where doctors sit."
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="new-establishment" loading={create.isPending}>
            Add establishment
          </Button>
        </>
      }
    >
      {open && (
        <EstablishmentForm formId="new-establishment" initial={{ name: initialName }} defaults={defaults} onSubmit={input => create.mutate(input)} />
      )}
    </Dialog>
  );
};
