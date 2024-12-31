import { HumeClient } from 'hume';

interface ListConfigsParams {
  pageSize?: number;
  pageNumber?: number;
  name?: string;
}

interface ListConfigVersionsParams {
  configId: string;
  pageSize?: number;
  pageNumber?: number;
  restrictToMostRecent?: boolean;
}

export async function listConfigs({ pageSize, pageNumber, name }: ListConfigsParams) {
  const client = new HumeClient({ apiKey: process.env.HUME_API_KEY || '' });
  return client.empathicVoice.configs.listConfigs({
    pageSize,
    pageNumber,
    name
  });
}

export async function listConfigVersions({ configId, pageSize, pageNumber, restrictToMostRecent }: ListConfigVersionsParams) {
  const client = new HumeClient({ apiKey: process.env.HUME_API_KEY || '' });
  return client.empathicVoice.configs.listConfigVersions(configId, {
    pageSize,
    pageNumber,
    restrictToMostRecent
  });
}
