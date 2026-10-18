import type { ReactNode } from 'react';
import { useDirectory, type Directory } from '../../lib/directory';
import { LoadError, Loading } from '../ui/Layout';

export const WithDirectory = ({ children }: { children: (directory: Directory) => ReactNode }) => {
  const { directory, error, refetch } = useDirectory();
  if (directory) return <>{children(directory)}</>;
  if (error) return <LoadError error={error} onRetry={() => refetch()} />;
  return <Loading />;
};
