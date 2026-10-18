import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAction } from '../lib/directory';
import { EstablishmentForm } from '../components/establishments/EstablishmentForm';
import { Button } from '../components/ui/Button';
import { Card, PageHeader } from '../components/ui/Layout';

export const EstablishmentNewPage = () => {
  const navigate = useNavigate();
  const create = useAction(api.createEstablishment, {
    success: e => `${e.name} added. Now add the doctors who sit here.`,
    onDone: e => navigate(`/establishments/${e.id}?add=doctor`)
  });

  return (
    <>
      <PageHeader title="Add establishment" back={{ to: '/establishments', label: 'Establishments' }} />
      <Card className="max-w-3xl">
        <div className="p-5">
          <EstablishmentForm formId="establishment" onSubmit={input => create.mutate(input)} />
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button variant="outline" onClick={() => navigate('/establishments')}>
            Cancel
          </Button>
          <Button type="submit" form="establishment" loading={create.isPending}>
            Save establishment
          </Button>
        </div>
      </Card>
    </>
  );
};
