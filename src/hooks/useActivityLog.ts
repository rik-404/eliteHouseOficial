import { useLogs } from '@/contexts/LogsContext';
import { useAuth } from '@/contexts/TempAuthContext';
import { User } from '@/types/user';

export const useActivityLog = () => {
  const { addLog } = useLogs();
  const { user } = useAuth();

  const logCreate = async (entityType: string, entityId: string, details: string, entityName: string) => {
    if (!user) return;
    await addLog({
      user_id: user.auth_id,
      user_name: user.name || user.email,
      action: 'create',
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      details,
      ip_address: window.location.hostname,
      timestamp: new Date().toISOString()
    });
  };

  const logUpdate = async (entityType: string, entityId: string, details: string, entityName: string) => {
    if (!user) return;
    await addLog({
      user_id: user.id,
      user_name: user.name || user.email,
      action: 'update',
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      details,
      ip_address: window.location.hostname,
      timestamp: new Date().toISOString()
    });
  };

  const logDelete = async (entityType: string, entityId: string, details: string, entityName: string, brokerId: string) => {
    if (!brokerId) return;
    await addLog({
      user_id: brokerId,
      user_name: user?.name || user?.email || 'Usuário desconhecido',
      action: 'delete',
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      details,
      ip_address: window.location.hostname,
      timestamp: new Date().toISOString()
    });
  };

  return {
    logCreate,
    logUpdate,
    logDelete
  };
};