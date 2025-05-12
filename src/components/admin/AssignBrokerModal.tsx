import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface AssignBrokerModalProps {
  open: boolean;
  brokers: any[];
  selectedBroker: string | null;
  onBrokerSelect: (brokerId: string) => void;
  onClose: () => void;
}

export default function AssignBrokerModal({
  open,
  brokers,
  selectedBroker,
  onBrokerSelect,
  onClose
}: AssignBrokerModalProps) {
  const [selectedBrokerId, setSelectedBrokerId] = useState(selectedBroker);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atribuir ao Corretor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select
            value={selectedBrokerId}
            onValueChange={(value) => setSelectedBrokerId(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um corretor" />
            </SelectTrigger>
            <SelectContent>
              {brokers.map((broker) => (
                <SelectItem key={`assign-${broker.id}`} value={broker.broker_id}>
                  {broker.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              if (selectedBrokerId) {
                onBrokerSelect(selectedBrokerId);
                onClose();
              }
            }}
          >
            Atribuir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
