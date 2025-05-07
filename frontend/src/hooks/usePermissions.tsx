import { useRbac } from '../contexts/RbacContext';

export const usePermissions = () => {
  return useRbac();
};