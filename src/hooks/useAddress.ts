import { useState } from 'react';
import { Address } from '../types';

interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const useAddress = () => {
  const [address, setAddress] = useState<Address>({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddressByCEP = async (cep: string) => {
    if (!cep || cep.length !== 8) {
      setError('CEP inválido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: ViaCEPResponse = await response.json();

      if (data.erro) {
        setError('CEP não encontrado');
        return;
      }

      setAddress({
        street: data.logradouro,
        number: '',
        complement: data.complemento,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
        zipCode: cep,
      });
    } catch (err) {
      setError('Erro ao buscar CEP');
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = (field: keyof Address, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateAddress = (): string[] => {
    const errors: string[] = [];

    if (!address.zipCode) errors.push('CEP é obrigatório');
    if (!address.street) errors.push('Rua é obrigatória');
    if (!address.number) errors.push('Número é obrigatório');
    if (!address.neighborhood) errors.push('Bairro é obrigatório');
    if (!address.city) errors.push('Cidade é obrigatória');
    if (!address.state) errors.push('Estado é obrigatório');

    return errors;
  };

  return {
    address,
    loading,
    error,
    fetchAddressByCEP,
    updateAddress,
    validateAddress,
  };
};
