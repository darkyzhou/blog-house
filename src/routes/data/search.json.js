import config from '../../../config/basic-configuration.yml';

export async function get() {
  return {
    body: {
      enabled: process.env.NODE_ENV === 'development' || config.algolia.enabled,
      index: process.env.ALGO_INDEX || config.algolia.index,
      appId: process.env.ALGO_APPID || config.algolia.applicationId,
      apiKey: process.env.ALGO_SEARCHKEY || config.algolia.searchOnlyApiKey
    }
  };
}
